// Utilidades compartidas por las funciones del servidor (carpeta /api).
// Los archivos que empiezan con "_" no se publican como rutas en Vercel.
//
// Variables de entorno (Vercel → Settings → Environment Variables):
//   STRIPE_SECRET_KEY           llave secreta de Stripe (sk_test_... o sk_live_...)
//   STRIPE_WEBHOOK_SECRET       secreto del webhook (whsec_...)
//   STRIPE_TAX_RATE_ID          (opcional) txr_... para cobrar impuestos aparte
//   SUPABASE_SERVICE_ROLE_KEY   llave secreta de Supabase (service_role / sb_secret_...)
//   SITE_URL                    https://www.abogamexico.com
//   GOOGLE_CLIENT_ID            ┐
//   GOOGLE_CLIENT_SECRET        ├ (opcionales) para crear Google Meet automáticamente
//   GOOGLE_REFRESH_TOKEN        ┘

import crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rqppqpkwzatrnaymsymc.supabase.co'
export const PRECIO_CENTAVOS = 4999 // $49.99 USD
export const DURACION_MIN = 60
export const ZONA_HORARIA = 'America/Mexico_City'

export function siteUrl() {
  return (process.env.SITE_URL || 'https://www.abogamexico.com').replace(/\/$/, '')
}

// Cliente de Supabase con permisos de servidor (salta las reglas RLS).
// Nunca se usa en el navegador.
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY')
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

// ── Stripe (API REST, sin librerías extra) ──────────────────────────
function toForm(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    const key = prefix ? `${prefix}[${k}]` : k
    if (typeof v === 'object') toForm(v, key, out)
    else out.append(key, String(v))
  }
  return out
}

export async function stripe(path, params, method = 'POST') {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Falta STRIPE_SECRET_KEY')
  const res = await fetch('https://api.stripe.com/v1/' + path, {
    method,
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : toForm(params || {}).toString(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error('Stripe: ' + (json.error?.message || res.status))
  return json
}

// Verifica que el webhook realmente venga de Stripe (firma HMAC-SHA256).
export function verificarFirmaStripe(rawBody, header, secret, toleranciaSeg = 300) {
  if (!header || !secret) return false
  const t = header.split(',').find(p => p.startsWith('t='))?.slice(2)
  const firmas = header.split(',').filter(p => p.startsWith('v1=')).map(p => p.slice(3))
  if (!t || firmas.length === 0) return false
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranciaSeg) return false
  const esperada = crypto.createHmac('sha256', secret).update(`${t}.${rawBody}`, 'utf8').digest('hex')
  return firmas.some(f => f.length === esperada.length &&
    crypto.timingSafeEqual(Buffer.from(f, 'hex'), Buffer.from(esperada, 'hex')))
}

export async function leerCuerpoCrudo(req) {
  const chunks = []
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c)
  return Buffer.concat(chunks).toString('utf8')
}

// ── Horarios ────────────────────────────────────────────────────────
export const HORAS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']

// "02:00 PM" → "14:00"
export function hora24(h) {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(h).trim())
  if (!m) return null
  let hh = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') hh += 12
  return String(hh).padStart(2, '0') + ':' + m[2]
}

// Fecha y hora "de pared" en CDMX → ISO local sin zona, para Google Calendar.
export function inicioYFin(fecha, hora) {
  const h = hora24(hora)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !h) return null
  const [Y, M, D] = fecha.split('-').map(Number)
  const [hh, mm] = h.split(':').map(Number)
  const ini = new Date(Date.UTC(Y, M - 1, D, hh, mm))
  const fin = new Date(ini.getTime() + DURACION_MIN * 60000)
  const fmt = d => d.toISOString().slice(0, 19)
  return { inicio: fmt(ini), fin: fmt(fin) }
}

// ¿La cita es al menos 2 horas después de "ahora" en CDMX?
export function esFechaValida(fecha, hora, ahora = new Date()) {
  const r = inicioYFin(fecha, hora)
  if (!r) return false
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA_HORARIA, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(ahora).map(x => [x.type, x.value]))
  const ahoraCdmx = `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:00`
  const limite = new Date(new Date(ahoraCdmx + 'Z').getTime() + 2 * 3600000).toISOString().slice(0, 19)
  return r.inicio >= limite
}

// ── Google Calendar + Meet ──────────────────────────────────────────
export function googleConfigurado() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN)
}

async function googleToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }).toString(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error('Google token: ' + (json.error_description || json.error || res.status))
  return json.access_token
}

export async function crearEventoMeet({ id, titulo, descripcion, inicio, fin, invitados }) {
  const token = await googleToken()
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all'
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: titulo,
      description: descripcion,
      start: { dateTime: inicio, timeZone: ZONA_HORARIA },
      end: { dateTime: fin, timeZone: ZONA_HORARIA },
      attendees: invitados.filter(Boolean).map(email => ({ email })),
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: true,
      reminders: { useDefault: false, overrides: [{ method: 'email', minutes: 24 * 60 }, { method: 'popup', minutes: 30 }] },
      conferenceData: { createRequest: { requestId: String(id).slice(-60), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error('Google Calendar: ' + (json.error?.message || res.status))
  const meet = json.hangoutLink || json.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri
  return { eventId: json.id, meetLink: meet || null }
}
