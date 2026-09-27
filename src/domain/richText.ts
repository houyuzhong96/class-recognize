import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  's',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'blockquote',
  'code',
  'pre',
  'img',
  'span',
]

const ALLOWED_ATTRIBUTES = [
  'src',
  'alt',
  'class',
  'style',
  'data-type',
  'data-latex',
]

export function sanitizeRichText(value: string): string {
  if (!value) return ''

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
  })
}

export function richTextToPlainText(value: string): string {
  if (!value) return ''

  const document = new DOMParser().parseFromString(value, 'text/html')
  const latex = [...document.querySelectorAll<HTMLElement>('[data-latex]')]
    .map((element) => element.dataset.latex ?? '')
    .filter(Boolean)

  return [document.body.textContent ?? '', ...latex]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
