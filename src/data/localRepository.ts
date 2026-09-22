import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { LessonRecord, SyncState } from '../domain/types'
import type {
  LessonRecordDraft,
  ReflectionRepository,
} from './repository'

interface ReflectionDatabase extends DBSchema {
  records: {
    key: string
    value: LessonRecord
  }
}

const databasePromises = new Map<
  string,
  Promise<IDBPDatabase<ReflectionDatabase>>
>()

function openDatabase(databaseName: string) {
  const existing = databasePromises.get(databaseName)
  if (existing) return existing

  const promise = openDB<ReflectionDatabase>(
    `math-reflection-${databaseName}`,
    1,
    {
      upgrade(database) {
        database.createObjectStore('records', { keyPath: 'id' })
      },
    },
  )
  databasePromises.set(databaseName, promise)
  return promise
}

function toRecord(
  input: LessonRecordDraft,
  existing: LessonRecord | undefined,
): LessonRecord {
  const now = new Date().toISOString()

  return {
    id: input.id ?? existing?.id ?? crypto.randomUUID(),
    sectionId: input.sectionId,
    teachingSummary: input.teachingSummary,
    studentMistakes: input.studentMistakes,
    teachingReflection: input.teachingReflection,
    classicExample: input.classicExample,
    version: (existing?.version ?? input.version ?? 0) + 1,
    isArchived: input.isArchived ?? existing?.isArchived ?? false,
    createdAt: existing?.createdAt ?? input.createdAt ?? now,
    updatedAt: now,
  }
}

export function createLocalRepository(
  databaseName = 'default',
): ReflectionRepository {
  return {
    async listRecords() {
      const database = await openDatabase(databaseName)
      const records = await database.getAll('records')
      return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },

    async getRecord(id) {
      const database = await openDatabase(databaseName)
      return database.get('records', id)
    },

    async saveRecord(input) {
      const database = await openDatabase(databaseName)
      const existing = input.id
        ? await database.get('records', input.id)
        : undefined
      const record = toRecord(input, existing)
      await database.put('records', record)
      return record
    },

    async setArchived(id, isArchived) {
      const database = await openDatabase(databaseName)
      const existing = await database.get('records', id)
      if (!existing) return

      await database.put('records', {
        ...existing,
        isArchived,
        version: existing.version + 1,
        updatedAt: new Date().toISOString(),
      })
    },

    async replaceRecords(records) {
      const database = await openDatabase(databaseName)
      const transaction = database.transaction('records', 'readwrite')

      await transaction.store.clear()
      await Promise.all(
        records.map((record) => transaction.store.put(record)),
      )
      await transaction.done
    },
  }
}

export function syncStateFromEnvironment(): SyncState {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline'
  return 'saved'
}
