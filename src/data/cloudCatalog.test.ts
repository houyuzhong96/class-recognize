import { describe, expect, it } from 'vitest'
import { catalogToCloudRows } from './cloudCatalog'

describe('catalogToCloudRows', () => {
  it('flattens the complete textbook tree for cloud seeding', () => {
    const rows = catalogToCloudRows()

    expect(rows.textbooks).toHaveLength(5)
    expect(rows.chapters).toHaveLength(18)
    expect(rows.sections).toHaveLength(73)
    expect(rows.textbooks[0]).toMatchObject({
      id: 'book-1',
      name: '必修第一册',
      display_order: 1,
    })
    expect(rows.sections.at(-1)).toMatchObject({
      id: 'section-5-3-3',
      chapter_id: 'chapter-5-3',
      display_order: 3,
    })
  })
})
