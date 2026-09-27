import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { BookTree } from './BookTree'

it('opens a book and selects a section', async () => {
  const onSelect = vi.fn()
  render(<BookTree onSelect={onSelect} selectedSectionId={undefined} />)

  await userEvent.click(screen.getByRole('button', { name: '必修第一册' }))
  await userEvent.click(
    screen.getByRole('button', { name: /第一章 集合与常用逻辑用语/ }),
  )
  await userEvent.click(
    screen.getByRole('button', { name: /1.1 集合的概念/ }),
  )

  expect(onSelect).toHaveBeenCalledWith('section-1-1-1')
})
