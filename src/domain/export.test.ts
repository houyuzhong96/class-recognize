import { describe, expect, it } from 'vitest'
import type { LessonRecord } from './types'
import { recordsToJson, recordsToMarkdown } from './export'

const record: LessonRecord = {
  id: 'record-1',
  sectionId: 'section-3-1-1',
  teachingSummary: '<p>完成定义证明</p>',
  studentMistakes: '<p>忽略定义域</p>',
  teachingReflection: '例题顺序需要调整',
  classicExample: '<p>判断函数在区间上的单调性</p>',
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
    expect(exported.records[0].studentMistakes).toBe('<p>忽略定义域</p>')
  })

  it('renders readable markdown sections', () => {
    const markdown = recordsToMarkdown([record])

    expect(markdown).toContain('## 完成定义证明')
    expect(markdown).toContain('### 学生易错点')
    expect(markdown).toContain('忽略定义域')
    expect(markdown).toContain('### 经典例题')
  })
})
