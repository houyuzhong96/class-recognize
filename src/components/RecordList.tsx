import { AlertCircle, Clock3, FilePlus2 } from 'lucide-react'
import type { LessonRecord } from '../domain/types'
import { richTextToPlainText } from '../domain/richText'
import { EmptyState } from './EmptyState'

interface RecordListProps {
  records: LessonRecord[]
  sectionName?: string
  onOpen(record: LessonRecord): void
  onCreate(): void
}

function excerpt(value: string, fallback: string) {
  const normalized = richTextToPlainText(value)
  if (!normalized) return fallback
  return normalized.length > 60 ? `${normalized.slice(0, 60)}...` : normalized
}

export function RecordList({
  records,
  sectionName,
  onOpen,
  onCreate,
}: RecordListProps) {
  if (!sectionName) {
    return (
      <EmptyState
        icon={<Clock3 size={26} strokeWidth={1.7} />}
        title="选择章节"
        description="从左侧目录进入任意一节，查看或补充记录。"
      />
    )
  }

  return (
    <div className="record-list">
      <div className="panel-heading">
        <div>
          <span>当前章节</span>
          <h2>{sectionName}</h2>
        </div>
        <button type="button" className="button button--primary" onClick={onCreate}>
          <FilePlus2 aria-hidden="true" size={18} />
          新建记录
        </button>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={<Clock3 size={26} strokeWidth={1.7} />}
          title="还没有记录"
          description="记录本节课的总结、反思和学生易错点。"
        />
      ) : (
        <div className="record-items">
          {records.map((record) => (
            <button
              type="button"
              className="record-item"
              key={record.id}
              onClick={() => onOpen(record)}
            >
              <strong>
                {excerpt(record.teachingSummary, '未填写教学总结')}
              </strong>
              <p>{excerpt(record.teachingReflection, '暂未填写教学反思')}</p>
              {record.studentMistakes ? (
                <span className="record-mistake">
                  <AlertCircle aria-hidden="true" size={15} />
                  {excerpt(record.studentMistakes, '')}
                </span>
              ) : null}
              {record.classicExample ? (
                <span className="record-example">
                  <FilePlus2 aria-hidden="true" size={15} />
                  {excerpt(record.classicExample, '')}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
