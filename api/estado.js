// GET /api/estado — diagnóstico de configuración.
// Solo responde sí/no y mensajes de error; nunca muestra llaves ni datos personales.

import { supabaseAdmin, googleConfigurado, resendConfigurado, stripe } from './_lib.js'

export default async function handler(req, res) {
  const r = {
    publicado: new Date().toISOString(),
    variables: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'sí (modo prueba)' : process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') ? 'sí (modo real)' : 'sí (formato raro)') : 'NO',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? (process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_') ? 'sí' : 'sí (no empieza con whsec_)') : 'NO',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'sí' : 'NO',
      SITE_URL: process.env.SITE_URL || 'NO',
      RESEND_API_KEY: resendConfigurado() ? (process.env.RESEND_API_KEY.startsWith('re_') ? 'sí' : 'sí (no empieza con re_)') : 'NO',
      GOOGLE: googleConfigurado() ? 'sí (las 3)' : 'NO (falta alguna de las 3)',
    },
    pruebas: {},
  }

  // Base de datos
  try {
    const sb = supabaseAdmin()
    const { data, error } = await sb.from('consultas')
      .select('created_at, pagado, abogado_id, meet_link, confirmacion_enviada')
      .order('created_at', { ascending: false }).limit(3)
    if (error) throw error
    r.pruebas.supabase = 'ok'
    r.ultimasConsultas = data.map(c => ({
      creada: c.created_at, pagada: c.pagado, conAbogado: !!c.abogado_id, conMeet: !!c.meet_link, correoEnviado: c.confirmacion_enviada,
    }))
  } catch (e) { r.pruebas.supabase = 'ERROR: ' + (e.message || e) }

  // Stripe
  try { await stripe('balance', null, 'GET'); r.pruebas.stripe = 'ok' } catch (e) { r.pruebas.stripe = 'ERROR: ' + e.message }

  // Stripe: ¿el webhook apunta a este sitio y está activo?
  try {
    const wh = await stripe('webhook_endpoints?limit=20', null, 'GET')
    r.pruebas.webhooks = wh.data.map(w => ({ url: w.url, estado: w.status, eventos: w.enabled_events }))
  } catch (e) { r.pruebas.webhooks = 'ERROR: ' + e.message }

  // Google
  if (googleConfigurado()) {
    try {
      const t = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, refresh_token: process.env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' }).toString(),
      }).then(x => x.json())
      if (!t.access_token) throw new Error(t.error_description || t.error || 'sin token')
      r.pruebas.google_token = 'ok' + (t.scope ? ' · permisos: ' + t.scope : '')
      const cal = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', { headers: { Authorization: 'Bearer ' + t.access_token } }).then(x => x.json())
      r.pruebas.google_calendario = cal.id ? 'ok · ' + cal.id : 'ERROR: ' + (cal.error?.message || 'sin acceso')
    } catch (e) { r.pruebas.google_token = 'ERROR: ' + e.message }
  }

  // Resend
  if (resendConfigurado()) {
    try {
      const d = await fetch('https://api.resend.com/domains', { headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY } })
      const j = await d.json().catch(() => ({}))
      // Las llaves de solo envío no pueden listar dominios (401/403): eso es normal y significa que la llave es válida
      r.pruebas.resend = d.ok ? 'ok · ' + (j.data || []).map(x => x.name + ' ' + x.status).join(', ')
        : (j.name === 'restricted_api_key' ? 'ok (llave de solo envío)' : 'ERROR: ' + (j.message || d.status))
    } catch (e) { r.pruebas.resend = 'ERROR: ' + e.message }
  }

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json(r)
}
