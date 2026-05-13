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
