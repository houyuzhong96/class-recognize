import { describe, expect, it } from 'vitest'
import { createLocalRepository } from './localRepository'

describe('localRepository', () => {
  it('persists and reloads a lesson record', async () => {
    const repository = createLocalRepository(`test-${crypto.randomUUID()}`)
    const saved = await repository.saveRecord({
      sectionId: 'section-1-1-1',
      teachingSummary: '<p>完成集合定义和元素特性</p>',
      studentMistakes: '<p>混淆空集和含零集合</p>',
      teachingReflection: '例子需要更贴近生活',
      classicExample: '<p>判断集合与元素的关系</p>',
    })

    await expect(repository.getRecord(saved.id)).resolves.toMatchObject({
      teachingSummary: '<p>完成集合定义和元素特性</p>',
      studentMistakes: '<p>混淆空集和含零集合</p>',
      classicExample: '<p>判断集合与元素的关系</p>',
      version: 1,
    })
  })

  it('increments version and archives without deleting', async () => {
    const repository = createLocalRepository(`test-${crypto.randomUUID()}`)
    const saved = await repository.saveRecord({
      sectionId: 'section-1-1-1',
      teachingSummary: '<p>集合概念</p>',
      studentMistakes: '',
      teachingReflection: '',
      classicExample: '',
    })

    const updated = await repository.saveRecord({
      ...saved,
      teachingSummary: '<p>集合概念辨析</p>',
    })
    await repository.setArchived(updated.id, true)

    await expect(repository.getRecord(updated.id)).resolves.toMatchObject({
      teachingSummary: '<p>集合概念辨析</p>',
      version: 3,
      isArchived: true,
    })
  })
})
