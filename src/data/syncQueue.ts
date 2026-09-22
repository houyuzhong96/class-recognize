import { openDB, type DBSchema, type IDBPDatabase } from 'idb'

export interface SyncOperation {
  recordId: string
  operation: 'upsert' | 'archive' | 'restore'
  updatedAt: string
}

export interface SyncQueue {
  put(operation: Omit<SyncOperation, 'updatedAt'>): Promise<void>
  list(): Promise<SyncOperation[]>
  remove(recordId: string): Promise<void>
  clear(): Promise<void>
}

interface SyncQueueDatabase extends DBSchema {
  queue: {
    key: string
    value: SyncOperation
  }
}

const databasePromises = new Map<
  string,
  Promise<IDBPDatabase<SyncQueueDatabase>>
>()

function openQueueDatabase(databaseName: string) {
  const existing = databasePromises.get(databaseName)
  if (existing) return existing

  const promise = openDB<SyncQueueDatabase>(
    `math-reflection-sync-${databaseName}`,
    1,
    {
      upgrade(database) {
        database.createObjectStore('queue', { keyPath: 'recordId' })
      },
    },
  )
  databasePromises.set(databaseName, promise)
  return promise
}

export function createSyncQueue(databaseName = 'default'): SyncQueue {
  return {
    async put(operation) {
      const database = await openQueueDatabase(databaseName)
      await database.put('queue', {
        ...operation,
        updatedAt: new Date().toISOString(),
      })
    },

    async list() {
      const database = await openQueueDatabase(databaseName)
      const operations = await database.getAll('queue')
      return operations.sort((a, b) =>
        a.updatedAt.localeCompare(b.updatedAt),
      )
    },

    async remove(recordId) {
      const database = await openQueueDatabase(databaseName)
      await database.delete('queue', recordId)
    },

    async clear() {
      const database = await openQueueDatabase(databaseName)
      await database.clear('queue')
    },
  }
}
