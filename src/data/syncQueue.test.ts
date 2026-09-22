import { describe, expect, it } from 'vitest'
import { createSyncQueue } from './syncQueue'

describe('syncQueue', () => {
  it('preserves an offline draft until flushed', async () => {
    const queue = createSyncQueue(`queue-${crypto.randomUUID()}`)
    await queue.put({ recordId: 'r1', operation: 'upsert' })

    await expect(queue.list()).resolves.toEqual([
      expect.objectContaining({
        recordId: 'r1',
        operation: 'upsert',
      }),
    ])

    await queue.remove('r1')
    await expect(queue.list()).resolves.toEqual([])
  })

  it('updates an existing operation for the same record', async () => {
    const queue = createSyncQueue(`queue-${crypto.randomUUID()}`)
    await queue.put({ recordId: 'r1', operation: 'upsert' })
    await queue.put({ recordId: 'r1', operation: 'archive' })

    await expect(queue.list()).resolves.toEqual([
      expect.objectContaining({ recordId: 'r1', operation: 'archive' }),
    ])
  })
})
