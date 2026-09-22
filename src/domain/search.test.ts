import { describe, expect, it } from 'vitest'
import type { LessonRecord } from './types'
import { matchesRecord, normalizeSearchText } from './search'

const record: LessonRecord = {
  id: 'record-1',
  sectionId: 'section-3-1-1',
  lessonDate: '2026-09-22',
  lessonType: '新授课',
  title: '函数单调性',
  teachingSummary: '完成定义证明',
  teachingReflection: '数形结合的演示还可以更清晰',
  studentMistakes: '忽略定义域',
  improvementActions: '增加区间判断练习',
  tags: ['函数', '单调性'],
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

  it('searches across title, reflection and tags', () => {
    expect(matchesRecord(record, '单调性')).toBe(true)
    expect(matchesRecord(record, '数形结合')).toBe(true)
    expect(matchesRecord(record, '导数')).toBe(false)
  })
})
