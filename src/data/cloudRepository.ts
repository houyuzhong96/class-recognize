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
