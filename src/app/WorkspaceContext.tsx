import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createLocalRepository,
} from '../data/localRepository'
import type {
  LessonRecordDraft,
  ReflectionRepository,
} from '../data/repository'
import { createSyncQueue } from '../data/syncQueue'
import {
  downloadTextFile,
  recordsToJson,
  recordsToMarkdown,
} from '../domain/export'
import type { LessonRecord, SyncState } from '../domain/types'

export interface WorkspaceValue {
  records: LessonRecord[]
  isLoading: boolean
  syncState: SyncState
  saveRecord(input: LessonRecordDraft): Promise<LessonRecord>
  setArchived(id: string, value: boolean): Promise<void>
  refresh(): Promise<void>
  exportJson(): void
  exportMarkdown(): void
}

interface WorkspaceProviderProps {
  children: ReactNode
  databaseName?: string
  cloudEnabled?: boolean
  repository?: ReflectionRepository
}

export const WorkspaceContext = createContext<WorkspaceValue | undefined>(
  undefined,
)

function currentSyncState(cloudEnabled: boolean): SyncState {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline'
  return cloudEnabled ? 'saving' : 'saved'
}

export function WorkspaceProvider({
  children,
  databaseName = 'default',
  cloudEnabled = false,
  repository: providedRepository,
}: WorkspaceProviderProps) {
  const repository = useMemo(
    () => providedRepository ?? createLocalRepository(databaseName),
    [databaseName, providedRepository],
  )
  const queue = useMemo(() => createSyncQueue(databaseName), [databaseName])
  const [records, setRecords] = useState<LessonRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncState, setSyncState] = useState<SyncState>(
    currentSyncState(cloudEnabled),
  )

  const refresh = useCallback(async () => {
    const loaded = await repository.listRecords()
    setRecords(loaded)
  }, [repository])

  useEffect(() => {
    let active = true

    void repository.listRecords().then((loaded) => {
      if (!active) return
      setRecords(loaded)
      setIsLoading(false)
      setSyncState(
        typeof navigator !== 'undefined' && !navigator.onLine
          ? 'offline'
          : 'saved',
      )
    })

    const handleOffline = () => setSyncState('offline')
    const handleOnline = () => {
      setSyncState(cloudEnabled ? 'saving' : 'saved')
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      active = false
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [cloudEnabled, repository])

  const saveRecord = useCallback(
    async (input: LessonRecordDraft) => {
      setSyncState(currentSyncState(cloudEnabled))
      const saved = await repository.saveRecord(input)
      setRecords((current) => {
        const withoutSaved = current.filter((record) => record.id !== saved.id)
        return [saved, ...withoutSaved].sort((a, b) =>
          b.lessonDate.localeCompare(a.lessonDate),
        )
      })

      await queue.put({ recordId: saved.id, operation: 'upsert' })
      setSyncState(
        typeof navigator !== 'undefined' && !navigator.onLine
          ? 'offline'
          : 'saved',
      )
      return saved
    },
    [cloudEnabled, queue, repository],
  )

  const setArchived = useCallback(
    async (id: string, value: boolean) => {
      setSyncState(currentSyncState(cloudEnabled))
      await repository.setArchived(id, value)
      const refreshed = await repository.listRecords()
      setRecords(refreshed)
      await queue.put({
        recordId: id,
        operation: value ? 'archive' : 'restore',
      })
      setSyncState(
        typeof navigator !== 'undefined' && !navigator.onLine
          ? 'offline'
          : 'saved',
      )
    },
    [cloudEnabled, queue, repository],
  )

  const value = useMemo<WorkspaceValue>(
    () => ({
      records,
      isLoading,
      syncState,
      saveRecord,
      setArchived,
      refresh,
      exportJson() {
        downloadTextFile(
          `数学教学反思-${new Date().toISOString().slice(0, 10)}.json`,
          recordsToJson(records),
          'application/json',
        )
      },
      exportMarkdown() {
        downloadTextFile(
          `数学教学反思-${new Date().toISOString().slice(0, 10)}.md`,
          recordsToMarkdown(records),
          'text/markdown',
        )
      },
    }),
    [isLoading, records, refresh, saveRecord, setArchived, syncState],
  )

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}
