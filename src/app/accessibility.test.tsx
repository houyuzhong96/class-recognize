import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { App } from '../App'

it('exposes navigation, main content and sync status', async () => {
  render(<App />)

  expect(
    screen.getByRole('navigation', { name: '桌面导航' }),
  ).toBeInTheDocument()
  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(await screen.findByRole('status')).toHaveTextContent('已保存')
})
