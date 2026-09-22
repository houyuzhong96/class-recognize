import { useState } from 'react'
import { ArrowLeft, BookOpenText, FileText } from 'lucide-react'
import { BookTree } from '../components/BookTree'
import { EmptyState } from '../components/EmptyState'
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

export function WorkbenchPage() {
  const { records, saveRecord, syncState } = useWorkspace()
  const [selectedSectionId, setSelectedSectionId] = useState<string>()
  const [activeRecordId, setActiveRecordId] = useState<string>()
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
  }

  async function createRecord() {
    if (!selectedSectionId) return

    const saved = await saveRecord({
      sectionId: selectedSectionId,
      lessonDate: new Date().toISOString().slice(0, 10),
      lessonType: '新授课',
      title: '',
      teachingReflection: '',
      teachingSummary: '',
      studentMistakes: '',
      improvementActions: '',
      tags: [],
    })
    setActiveRecordId(saved.id)
  }

  return (
    <div
      className={`workbench-layout ${
        selectedSectionId ? 'workbench-layout--has-section' : ''
      }`}
      data-sync-state={syncState}
      data-record-active={Boolean(activeRecordId)}
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
          onCreate={() => void createRecord()}
          onOpen={(record) => setActiveRecordId(record.id)}
        />
      </section>

      <section className="editor-panel">
        {activeRecordId ? (
          <div className="editor-placeholder">
            <FileText aria-hidden="true" size={28} strokeWidth={1.7} />
            <strong>记录编辑器</strong>
            <p>记录已创建，编辑器将在下一步接入。</p>
          </div>
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
