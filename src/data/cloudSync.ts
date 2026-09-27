import type { LessonRecord } from '../domain/types'
import type { SyncOperation } from './syncQueue'

export interface QueuePort {
  list(): Promise<SyncOperation[]>
  remove(recordId: string): Promise<void>
}

export interface SyncPort {
  getRecord(id: string): Promise<LessonRecord | undefined>
  saveRecord(record: LessonRecord): Promise<LessonRecord>
  setArchived(id: string, value: boolean): Promise<void>
}

export interface SyncResult {
  synced: number
  failed: number
}

export async function flushSyncQueue(
  queue: QueuePort,
  sync: SyncPort,
): Promise<SyncResult> {
  const operations = await queue.list()
  let synced = 0
  let failed = 0

  for (const operation of operations) {
    const record = await sync.getRecord(operation.recordId)
    if (!record) {
      await queue.remove(operation.recordId)
      synced += 1
      continue
    }

    try {
      if (operation.operation === 'upsert') {
        await sync.saveRecord(record)
      } else {
        await sync.setArchived(record.id, operation.operation === 'archive')
      }
      await queue.remove(operation.recordId)
      synced += 1
    } catch {
      failed += 1
    }
  }

  return { synced, failed }
}
