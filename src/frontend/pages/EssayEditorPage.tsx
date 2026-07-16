import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Button, Input, Select } from '../components/ui'
import Loading from '../components/Loading'
import { cn } from '../../lib/cn'
import { usePageTitle } from '../../lib/usePageTitle'
import {
  createEssay,
  getMyDocumentById,
  updateDocument,
} from '../../backend/services/documentsService'
import type { DocumentStatus } from '../../backend/types/database'

type EssayDocType = 'essay' | 'motivation_letter'

interface Snapshot {
  title: string
  docType: EssayDocType
  content: string
  status: DocumentStatus
}

export default function EssayEditorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams()
  const loadedIdRef = useRef<string | null>(null)

  const [docId, setDocId] = useState<string | null>(id ?? null)
  const [loading, setLoading] = useState(id != null)
  const [notFound, setNotFound] = useState(false)

  const [title, setTitle] = useState('')
  const [docType, setDocType] = useState<EssayDocType>('essay')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<DocumentStatus>('draft')
  const [saved, setSaved] = useState<Snapshot>({
    title: '',
    docType: 'essay',
    content: '',
    status: 'draft',
  })

  const [saving, setSaving] = useState(false)
  const [showSavedFlag, setShowSavedFlag] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)

  useEffect(() => {
    if (!id || id === loadedIdRef.current) return
    let active = true
    setLoading(true)
    getMyDocumentById(id)
      .then((doc) => {
        if (!active) return
        loadedIdRef.current = id
        if (!doc) {
          setNotFound(true)
          setLoading(false)
          return
        }
        const nextType: EssayDocType =
          doc.doc_type === 'motivation_letter' ? 'motivation_letter' : 'essay'
        setTitle(doc.title)
        setDocType(nextType)
        setContent(doc.content ?? '')
        setStatus(doc.status)
        setSaved({
          title: doc.title,
          docType: nextType,
          content: doc.content ?? '',
          status: doc.status,
        })
        setLoading(false)
      })
      .catch(() => {
        if (active) {
          setNotFound(true)
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [id])

  const dirty =
    title !== saved.title ||
    docType !== saved.docType ||
    content !== saved.content ||
    status !== saved.status

  const words = useMemo(() => {
    const trimmed = content.trim()
    return trimmed ? trimmed.split(/\s+/).length : 0
  }, [content])
  const characters = content.length

  const handleSave = async () => {
    setSaving(true)
    try {
      const trimmedTitle = title.trim()
      if (docId) {
        await updateDocument(docId, {
          title: trimmedTitle,
          doc_type: docType,
          content,
          status,
        })
      } else {
        const { data } = await createEssay({
          doc_type: docType,
          title: trimmedTitle,
          content,
        })
        let created = data
        if (status === 'ready') {
          created = (await updateDocument(data.id, { status: 'ready' })).data
        }
        loadedIdRef.current = created.id
        setDocId(created.id)
        navigate(`/app/documents/${created.id}/edit`, { replace: true })
      }
      setTitle(trimmedTitle)
      setSaved({ title: trimmedTitle, docType, content, status })
      setShowSavedFlag(true)
      setTimeout(() => setShowSavedFlag(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (dirty) setShowDiscard(true)
    else navigate('/app/documents')
  }

  usePageTitle(title.trim() || t('documents.writeEssay'))

  if (loading) {
    return <Loading />
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-[720px] space-y-4 py-16 text-center">
        <p className="text-muted">{t('documents.editor.notFound')}</p>
        <button
          type="button"
          onClick={() => navigate('/app/documents')}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('documents.editor.back')}
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t('documents.editor.back')}
        </button>
        {showDiscard && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-muted">
              {t('documents.editor.discard')}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDiscard(false)}
            >
              {t('documents.editor.stay')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/app/documents')}
            >
              {t('documents.editor.discardConfirm')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_13rem]">
        <Input
          aria-label={t('documents.editor.titlePlaceholder')}
          placeholder={t('documents.editor.titlePlaceholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Select
          aria-label={t('documents.form.docType')}
          value={docType}
          onChange={(e) => setDocType(e.target.value as EssayDocType)}
        >
          <option value="essay">{t('documents.docTypes.essay')}</option>
          <option value="motivation_letter">
            {t('documents.docTypes.motivation_letter')}
          </option>
        </Select>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        aria-label={t('documents.editor.content')}
        className="min-h-[480px] w-full resize-y rounded-base border border-border bg-bg p-4 font-sans text-base text-fg focus-visible:border-fg"
      />

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <div className="font-mono text-[12px] text-muted">
          {t('documents.editor.counts', { words, characters })}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {(['draft', 'ready'] as DocumentStatus[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={cn(
                  'rounded-base border px-3 py-1.5 text-sm transition-colors',
                  status === option
                    ? 'border-fg bg-fg text-bg'
                    : 'border-border bg-bg text-muted hover:text-fg',
                )}
              >
                {t(`documents.status.${option}`)}
              </button>
            ))}
          </div>
          <Button
            variant="primary"
            size="md"
            loading={saving}
            disabled={!dirty}
            onClick={handleSave}
          >
            {t('documents.editor.save')}
          </Button>
          {showSavedFlag && (
            <span className="text-[13px] text-muted">
              {t('documents.editor.saved')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
