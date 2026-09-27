import { describe, expect, it } from 'vitest'
import { validateCredentials } from './authValidation'

describe('validateCredentials', () => {
  it('requires a valid email', () => {
    expect(validateCredentials('not-an-email', '12345678')).toBe(
      '请输入有效的邮箱地址',
    )
  })

  it('requires at least eight password characters', () => {
    expect(validateCredentials('teacher@example.com', '1234567')).toBe(
      '密码至少需要 8 位',
    )
  })

  it('accepts valid credentials', () => {
    expect(
      validateCredentials('teacher@example.com', 'secure-pass'),
    ).toBe('')
  })
})
