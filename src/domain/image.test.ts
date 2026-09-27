import { describe, expect, it } from 'vitest'
import { calculateImageSize } from './image'

describe('calculateImageSize', () => {
  it('scales wide images without distortion', () => {
    expect(calculateImageSize(3200, 1800, 1600)).toEqual({
      width: 1600,
      height: 900,
    })
  })

  it('does not enlarge small images', () => {
    expect(calculateImageSize(800, 600, 1600)).toEqual({
      width: 800,
      height: 600,
    })
  })
})
