import { describe, expect, it, vi } from 'vitest'
import type { LessonRecord } from '../domain/types'
import { flushSyncQueue } from './cloudSync'

const record: LessonRecord = {
  id: 'record-1',
  sectionId: 'section-1-1-1',
  teachingSummary: '<p>集合概念</p>',
  studentMistakes: '',
  teachingReflection: '',
  classicExample: '',
  version: 1,
  isArchived: false,
  createdAt: '2026-09-22T00:00:00.000Z',
  updatedAt: '2026-09-22T00:00:00.000Z',
}

describe('flushSyncQueue', () => {
  it('keeps failed operations queued', async () => {
    const queue = {
      list: vi.fn().mockResolvedValue([
        {
          recordId: 'record-1',
          operation: 'upsert',
          updatedAt: '2026-09-22T00:00:00Z',
        },
      ]),
      remove: vi.fn(),
    }
    const cloud = {
      getRecord: vi.fn().mockResolvedValue(record),
      saveRecord: vi.fn().mockRejectedValue(new Error('network')),
      setArchived: vi.fn(),
    }

    await expect(flushSyncQueue(queue, cloud)).resolves.toEqual({
      synced: 0,
      failed: 1,
    })
    expect(queue.remove).not.toHaveBeenCalled()
  })

  it('removes operations that upload successfully', async () => {
    const queue = {
      list: vi.fn().mockResolvedValue([
        {
          recordId: 'record-1',
          operation: 'upsert',
          updatedAt: '2026-09-22T00:00:00Z',
        },
      ]),
      remove: vi.fn(),
    }
    const cloud = {
      getRecord: vi.fn().mockResolvedValue(record),
      saveRecord: vi.fn().mockResolvedValue(record),
      setArchived: vi.fn(),
    }

    await expect(flushSyncQueue(queue, cloud)).resolves.toEqual({
      synced: 1,
      failed: 0,
    })
    expect(queue.remove).toHaveBeenCalledWith('record-1')
  })
})
