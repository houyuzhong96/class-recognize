import { useCallback, useEffect, useState } from 'react'
import { Archive, ArrowLeft, Check, LoaderCircle, Save } from 'lucide-react'
import type { LessonRecord, SyncState } from '../domain/types'
import type { LessonRecordDraft } from '../data/repository'
import { richTextToPlainText } from '../domain/richText'
import { RichTextEditor } from './RichTextEditor'

interface RecordEditorProps {
  sectionId: string
  record?: LessonRecord
  onSave(input: LessonRecordDraft): Promise<LessonRecord | void>
  onArchive(id: string): Promise<void>
  onClose?(): void
}

export function RecordEditor({
  sectionId,
  record,
  onSave,
  onArchive,
  onClose,
}: RecordEditorProps) {
  const [form, setForm] = useState<LessonRecordDraft>(() => ({
    id: record?.id,
    sectionId,
    teachingSummary: record?.teachingSummary ?? '',
    studentMistakes: record?.studentMistakes ?? '',
    teachingReflection: record?.teachingReflection ?? '',
    classicExample: record?.classicExample ?? '',
  }))
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState<SyncState>('saved')

  const persist = useCallback(async () => {
    setSaveState('saving')
    try {
      await onSave(form)
      setDirty(false)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [form, onSave])

  useEffect(() => {
    if (!dirty) return

    const timer = window.setTimeout(() => {
      void persist()
    }, 900)

    return () => window.clearTimeout(timer)
  }, [dirty, persist])

  function updateField(
    key:
      | 'teachingSummary'
      | 'studentMistakes'
      | 'teachingReflection'
      | 'classicExample',
    value: string,
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setDirty(true)
  }

  const statusLabel = {
    saved: '已保存',
    saving: '保存中',
    offline: '等待联网',
    error: '保存失败，可重试',
  }[saveState]
  const heading =
    richTextToPlainText(form.teachingSummary).slice(0, 36) || '课次记录'

  return (
    <form
      className="record-editor"
      onSubmit={(event) => {
        event.preventDefault()
        void persist()
      }}
    >
      <header className="editor-header">
        <div className="editor-title">
          {onClose ? (
            <button
              type="button"
              className="icon-button"
              aria-label="返回记录列表"
              onClick={onClose}
            >
              <ArrowLeft aria-hidden="true" size={19} />
            </button>
          ) : null}
          <div>
            <span>{record ? '编辑课次记录' : '新建课次记录'}</span>
            <h2>{heading}</h2>
          </div>
        </div>

        <span
          className={`save-status save-status--${saveState}`}
          role="status"
          aria-live="polite"
        >
          {saveState === 'saving' ? (
            <LoaderCircle aria-hidden="true" className="spin" size={15} />
          ) : (
            <Check aria-hidden="true" size={15} />
          )}
          {statusLabel}
        </span>
      </header>

      <div className="rich-field-stack">
        <RichTextEditor
          label="教学总结"
          value={form.teachingSummary}
          placeholder="记录本节完成了哪些内容，学生掌握情况如何。"
          onChange={(value) => updateField('teachingSummary', value)}
        />

        <RichTextEditor
          label="学生易错点"
          value={form.studentMistakes}
          placeholder="记录典型错误、混淆点、思维障碍，并插入对应图形。"
          onChange={(value) => updateField('studentMistakes', value)}
        />

        <RichTextEditor
          label="教学反思"
          value={form.teachingReflection}
          placeholder="记录教学处理中的有效做法和需要调整的环节。"
          onChange={(value) => updateField('teachingReflection', value)}
        />

        <RichTextEditor
          label="经典例题"
          value={form.classicExample}
          placeholder="整理题目、关键解法、常用变式和易错步骤。"
          onChange={(value) => updateField('classicExample', value)}
        />
      </div>

      <div className="editor-actions">
        <button type="submit" className="button button--primary">
          <Save aria-hidden="true" size={18} />
          保存记录
        </button>

        {record ? (
          <button
            type="button"
            className="button button--secondary"
            onClick={() => void onArchive(record.id)}
          >
            <Archive aria-hidden="true" size={18} />
            归档
          </button>
        ) : null}
      </div>
    </form>
  )
}
