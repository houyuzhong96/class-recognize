import { describe, expect, it } from 'vitest'
import type { LessonRecord } from './types'
import { matchesRecord, normalizeSearchText } from './search'

const record: LessonRecord = {
  id: 'record-1',
  sectionId: 'section-3-1-1',
  teachingSummary: '<p>完成定义证明</p>',
  studentMistakes: '<p>忽略定义域</p>',
  teachingReflection: '数形结合的演示还可以更清晰',
  classicExample: '<p>判断函数在区间上的单调性</p>',
  version: 1,
  isArchived: false,
  createdAt: '2026-09-22T00:00:00.000Z',
  updatedAt: '2026-09-22T00:00:00.000Z',
}

describe('search', () => {
  it('matches full-width input and removes whitespace', () => {
    expect(normalizeSearchText('  定义 域 ')).toBe('定义域')
    expect(matchesRecord(record, '定义域')).toBe(true)
  })

  it('searches across summary, mistakes and classic examples', () => {
    expect(matchesRecord(record, '单调性')).toBe(true)
    expect(matchesRecord(record, '数形结合')).toBe(true)
    expect(matchesRecord(record, '经典例题')).toBe(false)
    expect(matchesRecord(record, '导数')).toBe(false)
  })
})
