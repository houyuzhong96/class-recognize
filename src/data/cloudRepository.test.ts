import { describe, expect, it } from 'vitest'
import {
  fromCloudRecord,
  toCloudRecord,
  type CloudLessonRecord,
} from './cloudRepository'

const cloudRecord: CloudLessonRecord = {
  id: 'edda5f57-a68c-46c3-ae20-7b5f8e47c867',
  owner_id: '1a987614-b64e-47e9-92e9-34e076d39c87',
  section_id: 'section-3-1-1',
  teaching_summary: '<p>完成定义证明</p>',
  student_mistakes: '<p>忽略定义域</p>',
  teaching_reflection: '例题顺序需要调整',
  classic_example: '<p>判断函数单调性</p>',
  version: 1,
  is_archived: false,
  created_at: '2026-09-22T00:00:00.000Z',
  updated_at: '2026-09-22T00:00:00.000Z',
}

describe('cloud record mapping', () => {
  it('maps snake case cloud fields to local fields', () => {
    expect(fromCloudRecord(cloudRecord)).toMatchObject({
      id: cloudRecord.id,
      sectionId: 'section-3-1-1',
      teachingReflection: '例题顺序需要调整',
      studentMistakes: '<p>忽略定义域</p>',
      classicExample: '<p>判断函数单调性</p>',
      version: 1,
      isArchived: false,
    })
  })

  it('maps local fields back without owner metadata', () => {
    const local = fromCloudRecord(cloudRecord)
    const cloudInput = toCloudRecord(local)

    expect(cloudInput).toMatchObject({
      id: cloudRecord.id,
      section_id: 'section-3-1-1',
      teaching_summary: '<p>完成定义证明</p>',
      is_archived: false,
    })
    expect('owner_id' in cloudInput).toBe(false)
  })
})
