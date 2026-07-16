import { supabase } from '../supabaseClient'
import { getUserId } from './session'
import type {
  DocType,
  DocumentRecord,
  DocumentStatus,
} from '../types/database'

const BUCKET = 'documents'

export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'png', 'jpg']

export type DocumentErrorCode = 'file_too_large' | 'unsupported_type'

export class DocumentError extends Error {
  code: DocumentErrorCode

  constructor(code: DocumentErrorCode, message: string) {
    super(message)
    this.name = 'DocumentError'
    this.code = code
  }
}

function fileExtension(name: string): string {
  return name.includes('.') ? name.split('.').pop()!.toLowerCase() : ''
}

// Client side validation reused by the page before an upload is attempted.
export function validateFile(file: File): DocumentErrorCode | null {
  if (file.size > MAX_FILE_BYTES) return 'file_too_large'
  if (!ALLOWED_EXTENSIONS.includes(fileExtension(file.name))) {
    return 'unsupported_type'
  }
  return null
}

export async function listMyDocuments(): Promise<DocumentRecord[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as DocumentRecord[]
}

export async function getMyDocumentById(
  id: string,
): Promise<DocumentRecord | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as DocumentRecord | null
}

export async function createEssay(input: {
  doc_type: 'essay' | 'motivation_letter'
  title: string
  content: string
}): Promise<{ data: DocumentRecord }> {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      doc_type: input.doc_type,
      title: input.title,
      content: input.content,
      status: 'draft',
    })
    .select()
    .single()
  if (error) throw error
  return { data: data as DocumentRecord }
}

export async function updateDocument(
  id: string,
  patch: {
    title?: string
    content?: string | null
    status?: DocumentStatus
    doc_type?: DocType
  },
): Promise<{ data: DocumentRecord }> {
  const { data, error } = await supabase
    .from('documents')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return { data: data as DocumentRecord }
}

export async function uploadDocumentFile(
  file: File,
  doc_type: DocType,
  title: string,
): Promise<{ data: DocumentRecord }> {
  const validation = validateFile(file)
  if (validation) throw new DocumentError(validation, 'Invalid file')

  const userId = await getUserId()
  const path = `${userId}/${crypto.randomUUID()}.${fileExtension(file.name)}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false })
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      doc_type,
      title,
      storage_path: path,
      status: 'draft',
    })
    .select()
    .single()
  if (error) {
    // Do not leave an orphaned object behind if the row insert fails.
    await supabase.storage.from(BUCKET).remove([path])
    throw error
  }
  return { data: data as DocumentRecord }
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60)
  if (error) throw error
  return data.signedUrl
}

export async function deleteDocument(id: string): Promise<{ data: null }> {
  const { data: row, error: fetchError } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', id)
    .maybeSingle()
  if (fetchError) throw fetchError

  const storagePath =
    (row as { storage_path: string | null } | null)?.storage_path ?? null
  if (storagePath) {
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath])
    if (removeError) throw removeError
  }

  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw error
  return { data: null }
}
