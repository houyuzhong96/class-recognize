import { describe, expect, it } from 'vitest'
import { seedCatalog } from './catalog'

describe('seedCatalog', () => {
  it('contains all five required textbooks', () => {
    expect(seedCatalog.map((book) => book.name)).toEqual([
      '必修第一册',
      '必修第二册',
      '选择性必修第一册',
      '选择性必修第二册',
      '选择性必修第三册',
    ])
  })

  it('contains the first and last standard sections', () => {
    const firstBook = seedCatalog[0]
    const lastBook = seedCatalog.at(-1)

    expect(firstBook.chapters[0].name).toBe('第一章 集合与常用逻辑用语')
    expect(firstBook.chapters[0].sections[0].name).toBe('1.1 集合的概念')
    expect(lastBook?.chapters.at(-1)?.sections.at(-1)?.name).toBe(
      '8.3 列联表与独立性检验',
    )
  })

  it('uses stable and unique catalog ids', () => {
    const ids = seedCatalog.flatMap((book) => [
      book.id,
      ...book.chapters.flatMap((chapter) => [
        chapter.id,
        ...chapter.sections.map((section) => section.id),
      ]),
    ])

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids[0]).toBe('book-1')
    expect(ids.at(-1)).toBe('section-5-3-3')
  })
})
