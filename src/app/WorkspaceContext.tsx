import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createLocalRepository,
} from '../data/localRepository'
import {
  createCloudRepository,
} from '../data/cloudRepository'
import { ensureCloudCatalog } from '../data/cloudCatalog'
import {
  flushSyncQueue,
  type SyncPort,
} from '../data/cloudSync'
import type {
  LessonRecordDraft,
  ReflectionRepository,
} from '../data/repository'
import { supabase } from '../data/supabase'
import { mergeRecords } from '../data/syncMerge'
import { createSyncQueue } from '../data/syncQueue'
import {
  downloadTextFile,
  recordsToJson,
  recordsToMarkdown,
} from '../domain/export'
import type { LessonRecord, SyncState } from '../domain/types'
import { WorkspaceContext, type WorkspaceValue } from './workspaceContextValue'

interface WorkspaceProviderProps {
  children: ReactNode
  databaseName?: string
  cloudEnabled?: boolean
  repository?: ReflectionRepository
}

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
  const cloudRepository = useMemo(
    () => (cloudEnabled && supabase ? createCloudRepository(supabase) : undefined),
    [cloudEnabled],
  )
  const syncPort = useMemo<SyncPort | undefined>(
    () =>
      cloudRepository
        ? {
            getRecord: (id) => repository.getRecord(id),
            saveRecord: (record) => cloudRepository.saveRecord(record),
            setArchived: (id, value) =>
              cloudRepository.setArchived(id, value),
          }
        : undefined,
    [cloudRepository, repository],
  )
  const [records, setRecords] = useState<LessonRecord[]>([])
  const [syncState, setSyncState] = useState<SyncState>(
    currentSyncState(cloudEnabled),
  )

  const refresh = useCallback(async () => {
    const localRecords = await repository.listRecords()

    if (!cloudRepository || !supabase || !syncPort) {
      setRecords(localRecords)
      setSyncState(
        typeof navigator !== 'undefined' && !navigator.onLine
          ? 'offline'
          : 'saved',
      )
      return
    }

    setSyncState('saving')

    try {
      await ensureCloudCatalog(supabase)
      const cloudRecords = await cloudRepository.listRecords()
      const merged = mergeRecords(localRecords, cloudRecords)
      await repository.replaceRecords(merged)
      setRecords(merged)

      const result = await flushSyncQueue(queue, syncPort)
      setSyncState(result.failed > 0 ? 'error' : 'saved')
    } catch {
      setRecords(localRecords)
      setSyncState(
        typeof navigator !== 'undefined' && !navigator.onLine
          ? 'offline'
          : 'error',
      )
    }
  }, [cloudRepository, queue, repository, syncPort])

  useEffect(() => {
    // Initial loading reads from IndexedDB and optionally Supabase.
    // oxlint-disable-next-line react/set-state-in-effect
    void refresh()

    const handleOffline = () => setSyncState('offline')
    const handleOnline = () => {
      void refresh()
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [refresh])

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

      if (
        cloudRepository &&
        syncPort &&
        typeof navigator !== 'undefined' &&
        navigator.onLine
      ) {
        try {
          await cloudRepository.saveRecord(saved)
          await queue.remove(saved.id)
          setSyncState('saved')
        } catch {
          setSyncState('error')
        }
      } else {
        setSyncState(
          typeof navigator !== 'undefined' && !navigator.onLine
            ? 'offline'
            : 'saved',
        )
      }

      return saved
    },
    [cloudEnabled, cloudRepository, queue, repository, syncPort],
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

      if (
        cloudRepository &&
        typeof navigator !== 'undefined' &&
        navigator.onLine
      ) {
        try {
          await cloudRepository.setArchived(id, value)
          await queue.remove(id)
          setSyncState('saved')
        } catch {
          setSyncState('error')
        }
      } else {
        setSyncState(
          typeof navigator !== 'undefined' && !navigator.onLine
            ? 'offline'
            : 'saved',
        )
      }
    },
    [cloudEnabled, cloudRepository, queue, repository],
  )

  const value = useMemo<WorkspaceValue>(
    () => ({
      records,
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
    [records, refresh, saveRecord, setArchived, syncState],
  )

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}
