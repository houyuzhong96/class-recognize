import { useState } from 'react'
import { ArrowLeft, BookOpenText } from 'lucide-react'
import { BookTree } from '../components/BookTree'
import { EmptyState } from '../components/EmptyState'
import { RecordEditor } from '../components/RecordEditor'
import { RecordList } from '../components/RecordList'
import { seedCatalog } from '../data/catalog'
import { useWorkspace } from '../app/useWorkspace'

function findSection(sectionId?: string) {
  if (!sectionId) return undefined

  for (const book of seedCatalog) {
    for (const chapter of book.chapters) {
      const section = chapter.sections.find((item) => item.id === sectionId)
      if (section) {
        return {
          book,
          chapter,
          section,
        }
      }
    }
  }

  return undefined
}

interface WorkbenchPageProps {
  targetRecordId?: string
}

export function WorkbenchPage({ targetRecordId }: WorkbenchPageProps) {
  const { records, saveRecord, setArchived, syncState } = useWorkspace()
  const targetSectionId = findSection(targetRecordId)?.section.id
  const [selectedSectionId, setSelectedSectionId] =
    useState<string | undefined>(targetSectionId)
  const [activeRecordId, setActiveRecordId] = useState<string | undefined>(
    targetRecordId,
  )
  const [isCreating, setIsCreating] = useState(false)
  const selected = findSection(selectedSectionId)
  const sectionRecords = records.filter(
    (record) => record.sectionId === selectedSectionId && !record.isArchived,
  )
  const recordCounts = records.reduce<Record<string, number>>((counts, record) => {
    if (!record.isArchived) {
      counts[record.sectionId] = (counts[record.sectionId] ?? 0) + 1
    }
    return counts
  }, {})

  function selectSection(sectionId: string) {
    setSelectedSectionId(sectionId)
    setActiveRecordId(undefined)
    setIsCreating(false)
  }

  const activeRecord = records.find((record) => record.id === activeRecordId)

  return (
    <div
      className={`workbench-layout ${
        selectedSectionId ? 'workbench-layout--has-section' : ''
      }`}
      data-sync-state={syncState}
      data-record-active={Boolean(activeRecordId || isCreating)}
    >
      <aside className="book-panel">
        <div className="panel-heading panel-heading--compact">
          <div>
            <span>课程目录</span>
            <h2>人教A版2019</h2>
          </div>
        </div>
        <BookTree
          onSelect={selectSection}
          selectedSectionId={selectedSectionId}
          recordCounts={recordCounts}
        />
      </aside>

      <section className="records-panel">
        <button
          type="button"
          className="mobile-back"
          onClick={() => setSelectedSectionId(undefined)}
        >
          <ArrowLeft aria-hidden="true" size={18} />
          返回目录
        </button>
        <RecordList
          records={sectionRecords}
          sectionName={selected?.section.name}
          onCreate={() => {
            setActiveRecordId(undefined)
            setIsCreating(true)
          }}
          onOpen={(record) => {
            setActiveRecordId(record.id)
            setIsCreating(false)
          }}
        />
      </section>

      <section className="editor-panel">
        {selectedSectionId && (activeRecord || isCreating) ? (
          <RecordEditor
            key={activeRecord?.id ?? 'new-record'}
            sectionId={selectedSectionId}
            record={activeRecord}
            onClose={() => {
              setActiveRecordId(undefined)
              setIsCreating(false)
            }}
            onArchive={async (id) => {
              await setArchived(id, true)
              setActiveRecordId(undefined)
              setIsCreating(false)
            }}
            onSave={async (recordInput) => {
              const saved = await saveRecord(recordInput)
              setActiveRecordId(saved.id)
              setIsCreating(false)
              return saved
            }}
          />
        ) : (
          <EmptyState
            icon={<BookOpenText size={28} strokeWidth={1.7} />}
            title={selected ? '选择一条记录' : '开始记录'}
            description={
              selected
                ? '从中间列表打开已有记录，或新建一条课次记录。'
                : '先在目录中选择教材章节。'
            }
          />
        )}
      </section>
    </div>
  )
}
