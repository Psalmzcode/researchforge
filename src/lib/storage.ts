import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadFile(buffer: Buffer, key: string, _mimeType: string): Promise<string> {
  if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'xxxxxxxxxxxx') {
    console.log(`[STORAGE MOCK] Would upload: ${key}`)
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/files/${encodeURIComponent(key)}`
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: key, resource_type: 'auto', folder: 'researchforge', overwrite: true },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'))
        resolve(result.secure_url)
      },
    )
    stream.end(buffer)
  })
}

export function generateFileKey(folder: string, filename: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 50)
  return `${folder}/${Date.now()}-${safe}`
}
