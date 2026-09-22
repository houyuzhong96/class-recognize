import { describe, expect, it } from 'vitest'
import { createLocalRepository } from './localRepository'

describe('localRepository', () => {
  it('persists and reloads a lesson record', async () => {
    const repository = createLocalRepository(`test-${crypto.randomUUID()}`)
    const saved = await repository.saveRecord({
      sectionId: 'section-1-1-1',
      lessonDate: '2026-09-22',
      lessonType: '新授课',
      title: '集合概念',
      teachingReflection: '例子需要更贴近生活',
      teachingSummary: '完成集合定义和元素特性',
      studentMistakes: '混淆空集和含零集合',
      improvementActions: '增加反例辨析',
      tags: ['集合'],
    })

    await expect(repository.getRecord(saved.id)).resolves.toMatchObject({
      title: '集合概念',
      studentMistakes: '混淆空集和含零集合',
      version: 1,
    })
  })

  it('increments version and archives without deleting', async () => {
    const repository = createLocalRepository(`test-${crypto.randomUUID()}`)
    const saved = await repository.saveRecord({
      sectionId: 'section-1-1-1',
      lessonDate: '2026-09-22',
      lessonType: '新授课',
      title: '集合概念',
      teachingReflection: '',
      teachingSummary: '',
      studentMistakes: '',
      improvementActions: '',
      tags: [],
    })

    const updated = await repository.saveRecord({
      ...saved,
      title: '集合概念辨析',
    })
    await repository.setArchived(updated.id, true)

    await expect(repository.getRecord(updated.id)).resolves.toMatchObject({
      title: '集合概念辨析',
      version: 3,
      isArchived: true,
    })
  })
})
