import type { LessonRecord } from './types'
import { richTextToPlainText } from './richText'

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
    richTextToPlainText(record.teachingSummary),
    richTextToPlainText(record.studentMistakes),
    richTextToPlainText(record.teachingReflection),
    richTextToPlainText(record.classicExample),
  ].join(' ')

  return normalizeSearchText(searchableText).includes(needle)
}
