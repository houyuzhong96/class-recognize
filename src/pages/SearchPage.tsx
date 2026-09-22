import { useState } from 'react'
import { FileSearch, SlidersHorizontal } from 'lucide-react'
import { EmptyState } from '../components/EmptyState'
import { seedCatalog } from '../data/catalog'
import { matchesRecord } from '../domain/search'
import { richTextToPlainText } from '../domain/richText'
import type { LessonRecord } from '../domain/types'

interface SearchPageProps {
  records: LessonRecord[]
  onOpen(record: LessonRecord): void
}

interface SectionLocation {
  bookId: string
  bookName: string
  chapterId: string
  chapterName: string
  sectionName: string
}

function buildSectionLookup() {
  const lookup = new Map<string, SectionLocation>()

  for (const book of seedCatalog) {
    for (const chapter of book.chapters) {
      for (const section of chapter.sections) {
        lookup.set(section.id, {
          bookId: book.id,
          bookName: book.name,
          chapterId: chapter.id,
          chapterName: chapter.name,
          sectionName: section.name,
        })
      }
    }
  }

  return lookup
}

const sectionLookup = buildSectionLookup()

export function SearchPage({ records, onOpen }: SearchPageProps) {
  const [query, setQuery] = useState('')
  const [bookId, setBookId] = useState('')
  const [chapterId, setChapterId] = useState('')

  const chapters = seedCatalog.find((book) => book.id === bookId)?.chapters ?? []

  const results = records
    .filter((record) => !record.isArchived)
    .filter((record) => matchesRecord(record, query))
    .filter((record) => {
      const location = sectionLookup.get(record.sectionId)
      if (bookId && location?.bookId !== bookId) return false
      if (chapterId && location?.chapterId !== chapterId) return false
      return true
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div className="page-surface">
      <header className="page-heading">
        <div>
          <span>检索全部课次</span>
          <h1>搜索记录</h1>
        </div>
        <SlidersHorizontal aria-hidden="true" size={22} strokeWidth={1.7} />
      </header>

      <div className="filter-bar">
        <label className="field field--search">
          <span>关键词</span>
          <input
            type="search"
            value={query}
            placeholder="搜索总结、易错点、反思或经典例题"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label className="field">
          <span>教材</span>
          <select
            value={bookId}
            onChange={(event) => {
              setBookId(event.target.value)
              setChapterId('')
            }}
          >
            <option value="">全部教材</option>
            {seedCatalog.map((book) => (
              <option key={book.id} value={book.id}>
                {book.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>章节</span>
          <select
            value={chapterId}
            disabled={!bookId}
            onChange={(event) => setChapterId(event.target.value)}
          >
            <option value="">全部章节</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.name}
              </option>
            ))}
          </select>
        </label>

      </div>

      <div className="result-heading">
        <strong>{results.length} 条记录</strong>
        <span>按最近更新排序</span>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<FileSearch size={26} strokeWidth={1.7} />}
          title="没有找到记录"
          description="尝试减少筛选条件，或换一个关键词。"
        />
      ) : (
        <div className="search-results">
          {results.map((record) => {
            const location = sectionLookup.get(record.sectionId)
            return (
              <button
                key={record.id}
                type="button"
                className="search-result"
                onClick={() => onOpen(record)}
              >
                <span className="search-result__content">
                  <strong>
                    {richTextToPlainText(record.teachingSummary).slice(0, 58) ||
                      '未填写教学总结'}
                  </strong>
                  <span>
                    {location
                      ? `${location.bookName} / ${location.chapterName} / ${location.sectionName}`
                      : '未知章节'}
                  </span>
                  {record.studentMistakes ? (
                    <span className="search-result__excerpt">
                      易错点：
                      {richTextToPlainText(record.studentMistakes).slice(0, 70)}
                    </span>
                  ) : null}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
