import type { LessonRecord } from './types'

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('zh-CN')
    .replace(/\s+/g, '')
}

export function matchesRecord(record: LessonRecord, query: string): boolean {
  const needle = normalizeSearchText(query)
  if (!needle) return true

  const searchableText = [
    record.title,
    record.lessonType,
    record.teachingReflection,
    record.teachingSummary,
    record.studentMistakes,
    record.improvementActions,
    record.tags.join(' '),
  ].join(' ')

  return normalizeSearchText(searchableText).includes(needle)
}
