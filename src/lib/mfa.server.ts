// Server-only MFA helpers. Imported dynamically from .functions handlers.
export async function hashCode(code: string): Promise<string> {
  const enc = new TextEncoder().encode(code)
  const buf = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
