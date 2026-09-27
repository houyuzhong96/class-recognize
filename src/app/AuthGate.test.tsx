import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { AuthGate } from './AuthGate'

it('uses local mode without requiring an account when cloud is not configured', () => {
  render(
    <AuthGate>
      {() => <div>本机工作区</div>}
    </AuthGate>,
  )

  expect(screen.getByText('本机工作区')).toBeInTheDocument()
})
