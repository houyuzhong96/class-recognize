import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import type { LessonRecord } from '../domain/types'
import { SearchPage } from './SearchPage'

const record: LessonRecord = {
  id: 'record-1',
  sectionId: 'section-3-1-1',
  lessonDate: '2026-09-22',
  lessonType: '新授课',
  title: '函数单调性',
  teachingSummary: '完成定义证明',
  teachingReflection: '数形结合',
  studentMistakes: '忽略定义域',
  improvementActions: '',
  tags: ['函数'],
  version: 1,
  isArchived: false,
  createdAt: '2026-09-22T00:00:00.000Z',
  updatedAt: '2026-09-22T00:00:00.000Z',
}

it('filters records by Chinese keyword', async () => {
  const onOpen = vi.fn()
  render(<SearchPage records={[record]} onOpen={onOpen} />)

  await userEvent.type(screen.getByRole('searchbox'), '定义域')
  expect(screen.getByText('函数单调性')).toBeInTheDocument()
  await userEvent.click(screen.getByText('函数单调性'))
  expect(onOpen).toHaveBeenCalledWith(record)
})
