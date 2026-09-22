import { useEffect, useRef, useState } from 'react'
import { Archive, ArrowLeft, Check, LoaderCircle, Save } from 'lucide-react'
import type { LessonRecord, LessonType, SyncState } from '../domain/types'
import type { LessonRecordDraft } from '../data/repository'

interface RecordEditorProps {
  sectionId: string
  record?: LessonRecord
  onSave(input: LessonRecordDraft): Promise<LessonRecord | void>
  onArchive(id: string): Promise<void>
  onClose?(): void
}

const lessonTypes: LessonType[] = [
  '新授课',
  '习题课',
  '复习课',
  '讲评课',
  '其他',
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

function tagsFromInput(value: string): string[] {
  return value
    .split(/[，,、]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
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
    lessonDate: record?.lessonDate ?? today(),
    lessonType: record?.lessonType ?? '新授课',
    title: record?.title ?? '',
    teachingReflection: record?.teachingReflection ?? '',
    teachingSummary: record?.teachingSummary ?? '',
    studentMistakes: record?.studentMistakes ?? '',
    improvementActions: record?.improvementActions ?? '',
    tags: record?.tags ?? [],
  }))
  const [tagsInput, setTagsInput] = useState(record?.tags.join('、') ?? '')
  const [dirty, setDirty] = useState(false)
  const [saveState, setSaveState] = useState<SyncState>('saved')
  const initialRender = useRef(true)

  useEffect(() => {
    setForm({
      id: record?.id,
      sectionId,
      lessonDate: record?.lessonDate ?? today(),
      lessonType: record?.lessonType ?? '新授课',
      title: record?.title ?? '',
      teachingReflection: record?.teachingReflection ?? '',
      teachingSummary: record?.teachingSummary ?? '',
      studentMistakes: record?.studentMistakes ?? '',
      improvementActions: record?.improvementActions ?? '',
      tags: record?.tags ?? [],
    })
    setTagsInput(record?.tags.join('、') ?? '')
    setDirty(false)
    setSaveState('saved')
    initialRender.current = true
  }, [record, sectionId])

  async function persist() {
    setSaveState('saving')
    try {
      await onSave({
        ...form,
        tags: tagsFromInput(tagsInput),
      })
      setDirty(false)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }
    if (!dirty) return

    const timer = window.setTimeout(() => {
      void persist()
    }, 800)

    return () => window.clearTimeout(timer)
  }, [dirty, form, tagsInput])

  function updateField<Key extends keyof LessonRecordDraft>(
    key: Key,
    value: LessonRecordDraft[Key],
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
            <h2>{form.title || '未命名记录'}</h2>
          </div>
        </div>

        <span
          className={`save-status save-status--${saveState}`}
          role="status"
          aria-live="polite"
        >
          {saveState === 'saving' ? (
            <LoaderCircle
              aria-hidden="true"
              className="spin"
              size={15}
            />
          ) : (
            <Check aria-hidden="true" size={15} />
          )}
          {statusLabel}
        </span>
      </header>

      <div className="editor-grid editor-grid--compact">
        <label className="field">
          <span>日期</span>
          <input
            type="date"
            value={form.lessonDate}
            onChange={(event) => updateField('lessonDate', event.target.value)}
          />
        </label>

        <label className="field">
          <span>课型</span>
          <select
            value={form.lessonType}
            onChange={(event) =>
              updateField('lessonType', event.target.value as LessonType)
            }
          >
            {lessonTypes.map((lessonType) => (
              <option key={lessonType} value={lessonType}>
                {lessonType}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>标题</span>
        <input
          value={form.title}
          placeholder="例如：函数单调性第一课时"
          onChange={(event) => updateField('title', event.target.value)}
        />
      </label>

      <label className="field">
        <span>教学总结</span>
        <textarea
          value={form.teachingSummary}
          rows={5}
          placeholder="本节课完成了哪些内容，学生掌握情况如何？"
          onChange={(event) =>
            updateField('teachingSummary', event.target.value)
          }
        />
      </label>

      <label className="field">
        <span>教学反思</span>
        <textarea
          value={form.teachingReflection}
          rows={5}
          placeholder="哪些环节有效，哪些处理需要调整？"
          onChange={(event) =>
            updateField('teachingReflection', event.target.value)
          }
        />
      </label>

      <label className="field field--warning">
        <span>学生易错点</span>
        <textarea
          value={form.studentMistakes}
          rows={5}
          placeholder="记录典型错误、混淆点和思维障碍。"
          onChange={(event) =>
            updateField('studentMistakes', event.target.value)
          }
        />
      </label>

      <label className="field">
        <span>改进措施</span>
        <textarea
          value={form.improvementActions}
          rows={4}
          placeholder="下一次教学准备怎样调整？"
          onChange={(event) =>
            updateField('improvementActions', event.target.value)
          }
        />
      </label>

      <label className="field">
        <span>标签</span>
        <input
          value={tagsInput}
          placeholder="使用逗号分隔，例如：函数，定义域"
          onChange={(event) => {
            setTagsInput(event.target.value)
            setDirty(true)
          }}
        />
      </label>

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
