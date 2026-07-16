import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Download, FileText, PenLine, Trash2 } from 'lucide-react'
import { Badge, Button, Card, Input, Select } from '../components/ui'
import Loading from '../components/Loading'
import { formatDate } from '../../lib/dates'
import { usePageTitle } from '../../lib/usePageTitle'
import {
  deleteDocument,
  getSignedUrl,
  listMyDocuments,
  updateDocument,
  uploadDocumentFile,
  validateFile,
} from '../../backend/services/documentsService'
import type {
  DocType,
  DocumentRecord,
  DocumentStatus,
} from '../../backend/types/database'

const UPLOAD_DOC_TYPES: DocType[] = [
  'transcript',
  'recommendation_letter',
  'cv',
  'passport',
  'certificate',
  'other',
]

type FileFilter = 'all' | 'essays' | 'files'
type StatusFilter = 'all' | DocumentStatus

export default function DocumentsPage() {
  const { t } = useTranslation()
  usePageTitle(t('nav.documents'))
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [documents, setDocuments] = useState<DocumentRecord[] | null>(null)
  const [fileFilter, setFileFilter] = useState<FileFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [actionError, setActionError] = useState<string | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDocType, setUploadDocType] = useState<DocType>('transcript')
  const [uploading, setUploading] = useState(false)

  const load = async () => {
    const data = await listMyDocuments()
    setDocuments(data)
  }

  useEffect(() => {
    let active = true
    listMyDocuments()
      .then((d) => {
        if (active) setDocuments(d)
      })
      .catch(() => {
        if (active) setDocuments([])
      })
    return () => {
      active = false
    }
  }, [])

  const patchLocal = (id: string, patch: Partial<DocumentRecord>) =>
    setDocuments((prev) =>
      prev ? prev.map((d) => (d.id === id ? { ...d, ...patch } : d)) : prev,
    )
  const removeLocal = (id: string) =>
    setDocuments((prev) => (prev ? prev.filter((d) => d.id !== id) : prev))

  const openFilePicker = () => fileInputRef.current?.click()

  const onFilePicked = (event: ChangeEvent<HTMLInputElement>) => {
    setActionError(null)
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const problem = validateFile(file)
    if (problem) {
      setActionError(
        problem === 'file_too_large'
          ? t('documents.validation.tooLarge')
          : t('documents.validation.unsupported'),
      )
      return
    }
    setSelectedFile(file)
    setUploadTitle(file.name.replace(/\.[^.]+$/, ''))
    setUploadDocType('transcript')
  }

  const cancelUpload = () => {
    setSelectedFile(null)
    setUploadTitle('')
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setActionError(null)
    try {
      await uploadDocumentFile(
        selectedFile,
        uploadDocType,
        uploadTitle.trim() || selectedFile.name,
      )
      cancelUpload()
      await load()
    } catch {
      setActionError(t('documents.error'))
    } finally {
      setUploading(false)
    }
  }

  if (documents === null) {
    return <Loading />
  }

  const visible = documents.filter((doc) => {
    if (fileFilter === 'essays') {
      if (doc.doc_type !== 'essay' && doc.doc_type !== 'motivation_letter') {
        return false
      }
    }
    if (fileFilter === 'files' && doc.storage_path == null) return false
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.png,.jpg"
        className="hidden"
        onChange={onFilePicked}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">
          {t('nav.documents')}
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app/documents/new')}
          >
            {t('documents.writeEssay')}
          </Button>
          <Button variant="secondary" size="md" onClick={openFilePicker}>
            {t('documents.uploadFile')}
          </Button>
        </div>
      </div>

      {actionError && <p className="text-[13px] text-fg">{actionError}</p>}

      {selectedFile && (
        <Card className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              aria-label={t('documents.form.titlePlaceholder')}
              placeholder={t('documents.form.titlePlaceholder')}
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
            />
            <Select
              aria-label={t('documents.form.docType')}
              value={uploadDocType}
              onChange={(e) => setUploadDocType(e.target.value as DocType)}
            >
              {UPLOAD_DOC_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`documents.docTypes.${type}`)}
                </option>
              ))}
            </Select>
          </div>
          <p className="font-mono text-[12px] text-muted">{selectedFile.name}</p>
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              loading={uploading}
              onClick={handleUpload}
            >
              {t('documents.upload')}
            </Button>
            <Button variant="ghost" size="md" onClick={cancelUpload}>
              {t('documents.cancel')}
            </Button>
          </div>
        </Card>
      )}

      {documents.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-muted">{t('documents.empty.title')}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/app/documents/new')}
            >
              {t('documents.writeEssay')}
            </Button>
            <Button variant="secondary" size="md" onClick={openFilePicker}>
              {t('documents.uploadFile')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {(['all', 'essays', 'files'] as FileFilter[]).map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setFileFilter(pill)}
                  className={
                    fileFilter === pill
                      ? 'rounded-base border border-fg bg-fg px-3 py-1.5 text-sm text-bg'
                      : 'rounded-base border border-border bg-bg px-3 py-1.5 text-sm text-fg transition-colors hover:border-fg'
                  }
                >
                  {t(`documents.filters.${pill}`)}
                </button>
              ))}
            </div>
            <div className="w-40">
              <Select
                size="sm"
                aria-label={t('documents.filters.statusAll')}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="all">{t('documents.filters.statusAll')}</option>
                <option value="draft">{t('documents.status.draft')}</option>
                <option value="ready">{t('documents.status.ready')}</option>
              </Select>
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="py-10 text-center text-muted">
              {t('documents.empty.title')}
            </p>
          ) : (
            <ul className="space-y-3">
              {visible.map((doc) => (
                <li key={doc.id}>
                  <DocumentRow
                    doc={doc}
                    onPatch={patchLocal}
                    onRemove={removeLocal}
                    onError={setActionError}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

function DocumentRow({
  doc,
  onPatch,
  onRemove,
  onError,
}: {
  doc: DocumentRecord
  onPatch: (id: string, patch: Partial<DocumentRecord>) => void
  onRemove: (id: string) => void
  onError: (message: string | null) => void
}) {
  const { t, i18n } = useTranslation()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isFile = doc.storage_path != null

  const handleStatusChange = async (next: DocumentStatus) => {
    const previous = doc.status
    onError(null)
    onPatch(doc.id, { status: next })
    try {
      await updateDocument(doc.id, { status: next })
    } catch {
      onPatch(doc.id, { status: previous })
      onError(t('documents.error'))
    }
  }

  const handleDownload = async () => {
    if (!doc.storage_path) return
    try {
      const url = await getSignedUrl(doc.storage_path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      onError(t('documents.error'))
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    onError(null)
    try {
      await deleteDocument(doc.id)
      onRemove(doc.id)
    } catch {
      setDeleting(false)
      onError(t('documents.error'))
    }
  }

  return (
    <Card className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {isFile ? (
          <FileText size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
        ) : (
          <PenLine size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
        )}
        <div className="min-w-0 space-y-1">
          <div className="truncate font-medium">{doc.title}</div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted">
              {t(`documents.docTypes.${doc.doc_type}`)}
            </Badge>
            <span className="font-mono text-[12px] text-muted">
              {formatDate(doc.updated_at, i18n.language)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {confirmingDelete ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="text-[13px] text-muted">
              {t('documents.remove.confirm')}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmingDelete(false)}
            >
              {t('documents.remove.cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={deleting}
              onClick={handleDelete}
            >
              {t('documents.remove.remove')}
            </Button>
          </div>
        ) : (
          <>
            <div className="w-28">
              <Select
                size="sm"
                aria-label={t('common.status')}
                value={doc.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as DocumentStatus)
                }
              >
                <option value="draft">{t('documents.status.draft')}</option>
                <option value="ready">{t('documents.status.ready')}</option>
              </Select>
            </div>
            {isFile ? (
              <button
                type="button"
                aria-label={t('documents.actions.download')}
                onClick={handleDownload}
                className="p-1.5 text-muted transition-colors hover:text-fg"
              >
                <Download size={16} aria-hidden="true" />
              </button>
            ) : (
              <Link
                to={`/app/documents/${doc.id}/edit`}
                aria-label={t('documents.actions.edit')}
                className="p-1.5 text-muted transition-colors hover:text-fg"
              >
                <PenLine size={16} aria-hidden="true" />
              </Link>
            )}
            <button
              type="button"
              aria-label={t('documents.actions.delete')}
              onClick={() => setConfirmingDelete(true)}
              className="p-1.5 text-muted transition-colors hover:text-fg"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </Card>
  )
}
