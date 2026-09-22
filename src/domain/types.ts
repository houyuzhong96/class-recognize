export type LessonType = '新授课' | '习题课' | '复习课' | '讲评课' | '其他'

export interface Section {
  id: string
  chapterId: string
  name: string
  order: number
}

export interface Chapter {
  id: string
  textbookId: string
  name: string
  order: number
  sections: Section[]
}

export interface Textbook {
  id: string
  name: string
  edition: '人教A版2019'
  order: number
  chapters: Chapter[]
}

export interface LessonRecord {
  id: string
  sectionId: string
  lessonDate: string
  lessonType: LessonType
  title: string
  teachingReflection: string
  teachingSummary: string
  studentMistakes: string
  improvementActions: string
  tags: string[]
  version: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export type SyncState = 'saved' | 'saving' | 'offline' | 'error'
