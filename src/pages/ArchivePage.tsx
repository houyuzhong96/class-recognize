import { ArchiveRestore, ArchiveX } from 'lucide-react'
import { useWorkspace } from '../app/useWorkspace'
import { EmptyState } from '../components/EmptyState'
import type { LessonRecord } from '../domain/types'
import { richTextToPlainText } from '../domain/richText'

interface ArchivePageProps {
  onOpen(record: LessonRecord): void
}

export function ArchivePage({ onOpen }: ArchivePageProps) {
  const { records, setArchived } = useWorkspace()
  const archivedRecords = records.filter((record) => record.isArchived)

  return (
    <div className="page-surface">
      <header className="page-heading">
        <div>
          <span>可恢复的历史记录</span>
          <h1>归档</h1>
        </div>
        <ArchiveX aria-hidden="true" size={22} strokeWidth={1.7} />
      </header>

      {archivedRecords.length === 0 ? (
        <EmptyState
          icon={<ArchiveX size={26} strokeWidth={1.7} />}
          title="归档为空"
          description="归档后的记录会保留在这里，可随时恢复。"
        />
      ) : (
        <div className="archive-list">
          {archivedRecords.map((record) => (
            <article className="archive-item" key={record.id}>
              <button
                type="button"
                className="archive-item__main"
                onClick={() => onOpen(record)}
              >
                <strong>
                  {richTextToPlainText(record.teachingSummary).slice(0, 58) ||
                    '未填写教学总结'}
                </strong>
                <p>
                  {richTextToPlainText(record.studentMistakes).slice(0, 90) ||
                    '未填写学生易错点'}
                </p>
              </button>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => void setArchived(record.id, false)}
              >
                <ArchiveRestore aria-hidden="true" size={17} />
                恢复
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
