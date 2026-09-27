import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { RecordEditor } from './RecordEditor'

it('submits the four rich content sections', async () => {
  const onSave = vi.fn().mockResolvedValue(undefined)
  render(
    <RecordEditor
      sectionId="section-1-1-1"
      onSave={onSave}
      onArchive={vi.fn()}
    />,
  )

  expect(screen.getByLabelText('教学总结')).toBeInTheDocument()
  expect(screen.getByLabelText('学生易错点')).toBeInTheDocument()
  expect(screen.getByLabelText('教学反思')).toBeInTheDocument()
  expect(screen.getByLabelText('经典例题')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '保存记录' }))

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      sectionId: 'section-1-1-1',
      teachingSummary: '',
      studentMistakes: '',
      teachingReflection: '',
      classicExample: '',
    }),
  )
})
