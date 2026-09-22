export interface ImageSize {
  width: number
  height: number
}

export function calculateImageSize(
  width: number,
  height: number,
  maxDimension = 1600,
): ImageSize {
  const largestSide = Math.max(width, height)
  if (largestSide <= maxDimension) return { width, height }

  const ratio = maxDimension / largestSide
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('加载图片失败'))
    image.src = source
  })
}

export async function compressImageFile(
  file: File,
  maxDimension = 1600,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件')
  }

  const source = await readFileAsDataUrl(file)
  const image = await loadImage(source)
  const size = calculateImageSize(
    image.naturalWidth,
    image.naturalHeight,
    maxDimension,
  )

  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('当前浏览器无法处理图片')

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, size.width, size.height)

  return canvas.toDataURL('image/webp', 0.86)
}
