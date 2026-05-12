import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadFile, generateFileKey } from '@/lib/storage'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const folder = (formData.get('folder') as string) || 'uploads'

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const key = generateFileKey(folder, file.name)
  const url = await uploadFile(buffer, key, file.type)

  return NextResponse.json({ url, name: file.name, size: file.size, type: file.type, key })
}
