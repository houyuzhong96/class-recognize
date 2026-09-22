import type { LessonRecord } from './types'

export interface ReflectionExport {
  version: 1
  exportedAt: string
  records: LessonRecord[]
}

export function recordsToJson(records: LessonRecord[]): string {
  const payload: ReflectionExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    records,
  }

  return JSON.stringify(payload, null, 2)
}

export function recordsToMarkdown(records: LessonRecord[]): string {
  if (records.length === 0) return '# 数学教学反思\n\n暂无记录。\n'

  return [
    '# 数学教学反思',
    '',
    ...records.map((record) =>
      [
        `## ${record.lessonDate} ${record.title || record.lessonType}`,
        '',
        `- 课型：${record.lessonType}`,
        `- 标签：${record.tags.join('、') || '无'}`,
        '',
        '### 教学总结',
        record.teachingSummary || '未填写',
        '',
        '### 教学反思',
        record.teachingReflection || '未填写',
        '',
        '### 学生易错点',
        record.studentMistakes || '未填写',
        '',
        '### 改进措施',
        record.improvementActions || '未填写',
      ].join('\n'),
    ),
  ].join('\n\n---\n\n')
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
