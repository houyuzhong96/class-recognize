import { describe, expect, it } from 'vitest'
import { richTextToPlainText, sanitizeRichText } from './richText'

describe('rich text helpers', () => {
  it('extracts readable text and latex from editor HTML', () => {
    const text = richTextToPlainText(
      '<p>方程</p><span data-type="inline-math" data-latex="x^2+y^2=1">x²+y²=1</span>',
    )

    expect(text).toContain('方程')
    expect(text).toContain('x^2+y^2=1')
  })

  it('removes scripts while preserving images and math metadata', () => {
    const sanitized = sanitizeRichText(
      '<p>图</p><img src="data:image/webp;base64,abc" alt="图形"><script>alert(1)</script><span data-latex="a+b"></span>',
    )

    expect(sanitized).toContain('<img')
    expect(sanitized).toContain('data-latex="a+b"')
    expect(sanitized).not.toContain('<script')
  })
})
