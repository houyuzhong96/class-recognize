import { describe, expect, it } from 'vitest'
import type { LessonRecord } from '../domain/types'
import { mergeRecords } from './syncMerge'

function record(overrides: Partial<LessonRecord>): LessonRecord {
  return {
    id: 'record-1',
    sectionId: 'section-1-1-1',
    teachingSummary: '<p>本地总结</p>',
    studentMistakes: '',
    teachingReflection: '',
    classicExample: '',
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
      [record({ teachingSummary: '<p>本地总结</p>' })],
      [
        record({
          teachingSummary: '<p>云端总结</p>',
          updatedAt: '2026-09-22T02:00:00.000Z',
        }),
      ],
    )

    expect(merged).toHaveLength(1)
    expect(merged[0].teachingSummary).toBe('<p>云端总结</p>')
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
