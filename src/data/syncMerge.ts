import type { LessonRecord } from '../domain/types'

export function mergeRecords(
  localRecords: LessonRecord[],
  cloudRecords: LessonRecord[],
): LessonRecord[] {
  const merged = new Map<string, LessonRecord>()

  for (const record of [...localRecords, ...cloudRecords]) {
    const current = merged.get(record.id)
    if (!current || record.updatedAt >= current.updatedAt) {
      merged.set(record.id, record)
    }
  }

  return [...merged.values()].sort(
    (a, b) => b.lessonDate.localeCompare(a.lessonDate),
  )
}
