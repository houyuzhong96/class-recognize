import { createContext } from 'react'
import type { LessonRecordDraft } from '../data/repository'
import type { LessonRecord, SyncState } from '../domain/types'

export interface WorkspaceValue {
  records: LessonRecord[]
  syncState: SyncState
  saveRecord(input: LessonRecordDraft): Promise<LessonRecord>
  setArchived(id: string, value: boolean): Promise<void>
  refresh(): Promise<void>
  exportJson(): void
  exportMarkdown(): void
}

export const WorkspaceContext = createContext<WorkspaceValue | undefined>(
  undefined,
)
