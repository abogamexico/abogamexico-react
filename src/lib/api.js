import { supabase } from './supabase'

// Llama a una función del servidor (/api/...) con la sesión del usuario.
// Si la sesión caducó, la renueva y reintenta una vez.
export async function apiPost(path, body) {
  async function token(forzar) {
    if (forzar) {
      const { data } = await supabase.auth.refreshSession()
      return data.session?.access_token || ''
    }
    const { data: { session } } = await supabase.auth.getSession()
    // Renovar si vence en menos de 60 segundos
    if (session && session.expires_at && session.expires_at * 1000 - Date.now() < 60000) return token(true)
    return session?.access_token || ''
  }
  async function llamar(t) {
    const r = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t },
      body: JSON.stringify(body),
    })
    return { r, j: await r.json().catch(() => ({})) }
  }
  let { r, j } = await llamar(await token(false))
  if (r.status === 401) ({ r, j } = await llamar(await token(true)))
  if (!r.ok) throw new Error((j.error || 'Algo salió mal.') + (j.detalle ? ' (' + j.detalle + ')' : ''))
  return j
}
