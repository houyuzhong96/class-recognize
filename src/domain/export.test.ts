import { describe, expect, it } from 'vitest'
import type { LessonRecord } from './types'
import { recordsToJson, recordsToMarkdown } from './export'

const record: LessonRecord = {
  id: 'record-1',
  sectionId: 'section-3-1-1',
  lessonDate: '2026-09-22',
  lessonType: '新授课',
  title: '函数单调性',
  teachingSummary: '完成定义证明',
  teachingReflection: '例题顺序需要调整',
  studentMistakes: '忽略定义域',
  improvementActions: '增加区间判断练习',
  tags: ['函数'],
  version: 1,
  isArchived: false,
  createdAt: '2026-09-22T00:00:00.000Z',
  updatedAt: '2026-09-22T00:00:00.000Z',
}

describe('data export', () => {
  it('exports a versioned JSON object', () => {
    const exported = JSON.parse(recordsToJson([record])) as {
      version: number
      records: LessonRecord[]
    }

    expect(exported.version).toBe(1)
    expect(exported.records[0].studentMistakes).toBe('忽略定义域')
  })

  it('renders readable markdown sections', () => {
    const markdown = recordsToMarkdown([record])

    expect(markdown).toContain('## 2026-09-22 函数单调性')
    expect(markdown).toContain('### 学生易错点')
    expect(markdown).toContain('忽略定义域')
  })
})
