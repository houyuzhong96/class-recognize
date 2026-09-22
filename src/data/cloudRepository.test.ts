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
  lesson_date: '2026-09-22',
  lesson_type: '新授课',
  title: '函数单调性',
  teaching_reflection: '例题顺序需要调整',
  teaching_summary: '完成定义证明',
  student_mistakes: '忽略定义域',
  improvement_actions: '增加区间判断练习',
  tags: ['函数'],
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
      lessonDate: '2026-09-22',
      teachingReflection: '例题顺序需要调整',
      studentMistakes: '忽略定义域',
      tags: ['函数'],
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
      lesson_type: '新授课',
      is_archived: false,
    })
    expect('owner_id' in cloudInput).toBe(false)
  })
})
