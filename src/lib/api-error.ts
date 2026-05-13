import { NextResponse } from 'next/server'
import type { z } from 'zod'

/** Best-effort message from JSON API error bodies. */
export async function getJsonError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (data && typeof data.error === 'string') return data.error
    if (data && typeof data.message === 'string') return data.message
  } catch {
    /* non-JSON body */
  }
  return `Request failed (${res.status})`
}

export type ParseJsonBodyResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse }

/** Validate JSON body; on failure return `{ ok: false, response }` with HTTP 400. */
export function parseJsonBody<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, body: unknown): ParseJsonBodyResult<T> {
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message || 'Invalid request data'
    return { ok: false, response: NextResponse.json({ error: msg }, { status: 400 }) }
  }
  return { ok: true, data: parsed.data }
}
