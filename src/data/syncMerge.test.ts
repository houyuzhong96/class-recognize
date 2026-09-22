import { describe, expect, it } from 'vitest'
import type { LessonRecord } from '../domain/types'
import { mergeRecords } from './syncMerge'

function record(overrides: Partial<LessonRecord>): LessonRecord {
  return {
    id: 'record-1',
    sectionId: 'section-1-1-1',
    lessonDate: '2026-09-22',
    lessonType: '新授课',
    title: '本地标题',
    teachingReflection: '',
    teachingSummary: '',
    studentMistakes: '',
    improvementActions: '',
    tags: [],
    version: 1,
    isArchived: false,
    createdAt: '2026-09-22T00:00:00.000Z',
    updatedAt: '2026-09-22T01:00:00.000Z',
    ...overrides,
  }
}

describe('mergeRecords', () => {
  it('keeps the most recently updated version of the same record', () => {
    const merged = mergeRecords(
      [record({ title: '本地标题' })],
      [
        record({
          title: '云端标题',
          updatedAt: '2026-09-22T02:00:00.000Z',
        }),
      ],
    )

    expect(merged).toHaveLength(1)
    expect(merged[0].title).toBe('云端标题')
  })

  it('keeps records that exist on only one side', () => {
    const merged = mergeRecords(
      [record({ id: 'local-only' })],
      [record({ id: 'cloud-only' })],
    )

    expect(merged.map((item) => item.id).sort()).toEqual([
      'cloud-only',
      'local-only',
    ])
  })
})
