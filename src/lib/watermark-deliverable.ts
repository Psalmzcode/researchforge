import { PDFDocument, degrees, rgb } from 'pdf-lib'
import sharp from 'sharp'

export async function buildWatermarkedBuffer(
  url: string,
  mime: string,
): Promise<{ buffer: Buffer; contentType: string; filenameSuffix: string } | null> {
  const res = await fetch(url)
  if (!res.ok) return null
  const raw = Buffer.from(await res.arrayBuffer())
  const lower = mime.toLowerCase()

  if (lower.includes('pdf') || lower === 'application/pdf') {
    const pdfDoc = await PDFDocument.load(raw)
    const pages = pdfDoc.getPages()
    for (const page of pages) {
      const { width, height } = page.getSize()
      page.drawText('PREVIEW — ResearchForge', {
        x: width * 0.15,
        y: height * 0.5,
        size: 28,
        rotate: degrees(-32),
        color: rgb(0.72, 0.72, 0.72),
        opacity: 0.4,
      })
    }
    const out = await pdfDoc.save()
    return { buffer: Buffer.from(out), contentType: 'application/pdf', filenameSuffix: '-preview.pdf' }
  }

  if (lower.startsWith('image/')) {
    const meta = await sharp(raw).metadata()
    const w = meta.width || 1200
    const h = meta.height || 800
    const svg = `
      <svg width="${w}" height="${h}">
        <style>
          .w { fill: rgba(200,200,200,0.45); font: bold 42px sans-serif; }
        </style>
        <text x="50%" y="50%" text-anchor="middle" class="w" transform="rotate(-30 ${w / 2} ${h / 2})">PREVIEW — ResearchForge</text>
      </svg>`
    const overlay = Buffer.from(svg)
    const buf = await sharp(raw).composite([{ input: overlay, gravity: 'center' }]).png({ quality: 85 }).toBuffer()
    return { buffer: buf, contentType: 'image/png', filenameSuffix: '-preview.png' }
  }

  return null
}
