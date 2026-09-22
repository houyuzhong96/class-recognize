import type { SupabaseClient } from '@supabase/supabase-js'
import type { LessonRecord, LessonType } from '../domain/types'

export interface CloudLessonRecord {
  id: string
  owner_id: string
  section_id: string
  lesson_date: string
  lesson_type: LessonType
  title: string
  teaching_reflection: string
  teaching_summary: string
  student_mistakes: string
  improvement_actions: string
  tags: string[]
  version: number
  is_archived: boolean
  created_at: string
  updated_at: string
}

export type CloudLessonRecordInput = Omit<CloudLessonRecord, 'owner_id'>

export function fromCloudRecord(record: CloudLessonRecord): LessonRecord {
  return {
    id: record.id,
    sectionId: record.section_id,
    lessonDate: record.lesson_date,
    lessonType: record.lesson_type,
    title: record.title,
    teachingReflection: record.teaching_reflection,
    teachingSummary: record.teaching_summary,
    studentMistakes: record.student_mistakes,
    improvementActions: record.improvement_actions,
    tags: record.tags,
    version: record.version,
    isArchived: record.is_archived,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

export function toCloudRecord(
  record: LessonRecord,
): CloudLessonRecordInput {
  return {
    id: record.id,
    section_id: record.sectionId,
    lesson_date: record.lessonDate,
    lesson_type: record.lessonType,
    title: record.title,
    teaching_reflection: record.teachingReflection,
    teaching_summary: record.teachingSummary,
    student_mistakes: record.studentMistakes,
    improvement_actions: record.improvementActions,
    tags: record.tags,
    version: record.version,
    is_archived: record.isArchived,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  }
}

export interface CloudRecordRepository {
  listRecords(): Promise<LessonRecord[]>
  getRecord(id: string): Promise<LessonRecord | undefined>
  saveRecord(record: LessonRecord): Promise<LessonRecord>
  setArchived(id: string, value: boolean): Promise<void>
}

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

export function createCloudRepository(
  client: SupabaseClient,
): CloudRecordRepository {
  return {
    async listRecords() {
      const response = await client
        .from('lesson_records')
        .select('*')
        .order('lesson_date', { ascending: false })
      throwIfError(response.error)

      return ((response.data ?? []) as CloudLessonRecord[]).map(fromCloudRecord)
    },

    async getRecord(id) {
      const response = await client
        .from('lesson_records')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      throwIfError(response.error)

      return response.data
        ? fromCloudRecord(response.data as CloudLessonRecord)
        : undefined
    },

    async saveRecord(record) {
      const response = await client
        .from('lesson_records')
        .upsert(toCloudRecord(record), { onConflict: 'id' })
        .select('*')
        .single()
      throwIfError(response.error)

      return fromCloudRecord(response.data as CloudLessonRecord)
    },

    async setArchived(id, value) {
      const existing = await this.getRecord(id)
      if (!existing) return

      const response = await client
        .from('lesson_records')
        .update({
          is_archived: value,
          version: existing.version + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      throwIfError(response.error)
    },
  }
}
