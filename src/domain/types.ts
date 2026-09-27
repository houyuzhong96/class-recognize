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
  teachingSummary: string
  studentMistakes: string
  teachingReflection: string
  classicExample: string
  version: number
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export type SyncState = 'saved' | 'saving' | 'offline' | 'error'
