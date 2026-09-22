import { useState } from 'react'
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { seedCatalog } from '../data/catalog'

interface BookTreeProps {
  onSelect(sectionId: string): void
  selectedSectionId?: string
  recordCounts?: Record<string, number>
}

export function BookTree({
  onSelect,
  selectedSectionId,
  recordCounts = {},
}: BookTreeProps) {
  const [expandedBooks, setExpandedBooks] = useState<string[]>([])
  const [expandedChapters, setExpandedChapters] = useState<string[]>([])

  function toggleBook(bookId: string) {
    setExpandedBooks((current) =>
      current.includes(bookId)
        ? current.filter((id) => id !== bookId)
        : [...current, bookId],
    )
  }

  function toggleChapter(chapterId: string) {
    setExpandedChapters((current) =>
      current.includes(chapterId)
        ? current.filter((id) => id !== chapterId)
        : [...current, chapterId],
    )
  }

  return (
    <div className="book-tree" aria-label="教材目录">
      {seedCatalog.map((book) => {
        const bookOpen = expandedBooks.includes(book.id)
        const BookChevron = bookOpen ? ChevronDown : ChevronRight

        return (
          <section className="book-group" key={book.id}>
            <button
              type="button"
              className="tree-button tree-button--book"
              aria-expanded={bookOpen}
              onClick={() => toggleBook(book.id)}
            >
              <BookChevron aria-hidden="true" size={17} />
              <BookOpen aria-hidden="true" size={17} />
              <span>{book.name}</span>
            </button>

            {bookOpen && (
              <div className="tree-children">
                {book.chapters.map((chapter) => {
                  const chapterOpen = expandedChapters.includes(chapter.id)
                  const ChapterChevron = chapterOpen
                    ? ChevronDown
                    : ChevronRight

                  return (
                    <div className="chapter-group" key={chapter.id}>
                      <button
                        type="button"
                        className="tree-button tree-button--chapter"
                        aria-expanded={chapterOpen}
                        onClick={() => toggleChapter(chapter.id)}
                      >
                        <ChapterChevron aria-hidden="true" size={16} />
                        <span>{chapter.name}</span>
                      </button>

                      {chapterOpen && (
                        <div className="tree-children">
                          {chapter.sections.map((section) => (
                            <button
                              key={section.id}
                              type="button"
                              className="tree-button tree-button--section"
                              aria-current={
                                selectedSectionId === section.id
                                  ? 'page'
                                  : undefined
                              }
                              onClick={() => onSelect(section.id)}
                            >
                              <FileText aria-hidden="true" size={15} />
                              <span>{section.name}</span>
                              {recordCounts[section.id] ? (
                                <span className="tree-count">
                                  {recordCounts[section.id]}
                                </span>
                              ) : null}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
