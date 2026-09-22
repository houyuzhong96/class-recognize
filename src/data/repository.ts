import type { LessonRecord } from '../domain/types'

export type LessonRecordInput = Omit<
  LessonRecord,
  'id' | 'version' | 'isArchived' | 'createdAt' | 'updatedAt'
>

export type LessonRecordDraft = LessonRecordInput &
  Partial<
    Pick<
      LessonRecord,
      'id' | 'version' | 'isArchived' | 'createdAt' | 'updatedAt'
    >
  >

export interface ReflectionRepository {
  listRecords(): Promise<LessonRecord[]>
  getRecord(id: string): Promise<LessonRecord | undefined>
  saveRecord(input: LessonRecordDraft): Promise<LessonRecord>
  setArchived(id: string, isArchived: boolean): Promise<void>
  replaceRecords(records: LessonRecord[]): Promise<void>
}
