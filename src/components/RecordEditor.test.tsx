import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { RecordEditor } from './RecordEditor'

it('submits all reflection fields', async () => {
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(
    <RecordEditor
      sectionId="section-1-1-1"
      onSave={onSave}
      onArchive={vi.fn()}
    />,
  )

  await userEvent.type(screen.getByLabelText('学生易错点'), '忽略定义域')
  await userEvent.type(screen.getByLabelText('教学总结'), '完成概念讲解')
  await userEvent.click(screen.getByRole('button', { name: '保存记录' }))

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      studentMistakes: '忽略定义域',
      teachingSummary: '完成概念讲解',
      sectionId: 'section-1-1-1',
    }),
  )
})
