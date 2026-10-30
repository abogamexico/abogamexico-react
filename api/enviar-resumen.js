// POST /api/enviar-resumen  { consulta_id }
// El abogado asignado envía al cliente el resumen guardado en el expediente.

import { supabaseAdmin, resendConfigurado, enviarCorreo, fechaLarga, siteUrl } from './_lib.js'

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    const sb = supabaseAdmin()
    const { data: { user } = {}, error: authErr } = await sb.auth.getUser(token)
    if (authErr || !user) return res.status(401).json({ error: 'Tu sesión expiró. Vuelve a iniciar sesión.', detalle: authErr?.message })

    const id = req.body?.consulta_id
    const { data: c } = await sb.from('consultas').select('*').eq('id', id).maybeSingle()
    if (!c || c.abogado_id !== user.id) return res.status(403).json({ error: 'Esta consulta no está asignada a ti.' })
    const { data: exp } = await sb.from('expedientes').select('resumen_cliente').eq('consulta_id', c.id).maybeSingle()
    const resumen = (exp?.resumen_cliente || '').trim()
    if (!resumen) return res.status(400).json({ error: 'El resumen está vacío.' })

    const ahora = new Date().toISOString()
    const { error } = await sb.from('consultas').update({ resumen_cliente: resumen, resumen_enviado_at: ahora }).eq('id', c.id)
    if (error) throw error
    await sb.from('expedientes').update({ estado: 'completado' }).eq('consulta_id', c.id)

    if (resendConfigurado()) {
      const { data: cliente } = await sb.from('usuarios').select('nombre, email').eq('id', c.cliente_id).maybeSingle()
      if (cliente?.email) {
        await enviarCorreo({
          para: cliente.email,
          copiaOculta: 'abogamexicoconsultoria@gmail.com',
          asunto: `Resumen de tu consulta · ${c.especialidad} · ${c.fecha}`,
          html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1c2a44">
  <img src="https://www.abogamexico.com/logo-correo.png" width="232" height="60" alt="AbogaMéxico · Consultorio Jurídico Virtual" style="display:block;border:0;margin:0 0 28px">
  <h3 style="color:#00183D;margin:0 0 6px">Resumen de tu consulta</h3>
  <p style="color:#5a6782;margin:0 0 20px;font-size:14px">${esc(c.especialidad)} · ${esc(fechaLarga(c.fecha))}${c.abogado_nombre ? ' · Lic. ' + esc(c.abogado_nombre) : ''}</p>
  <div style="white-space:pre-wrap;line-height:1.7;font-size:15px;background:#f6f8fb;border-radius:10px;padding:18px 20px">${esc(resumen)}</div>
  <p style="font-size:14px;margin:20px 0 0">También lo puedes ver en tu panel: <a href="${siteUrl()}/dashboard" style="color:#00183D">${siteUrl().replace('https://', '')}/dashboard</a></p>
  <hr style="border:none;border-top:1px solid #e3e8f0;margin:28px 0 16px">
  <p style="font-size:12px;color:#8a94a8">AbogaMéxico · abogamexicoconsultoria@gmail.com · www.abogamexico.com</p>
</div>`,
        })
      }
    }
    return res.status(200).json({ ok: true, enviado_at: ahora })
  } catch (e) {
    console.error('enviar-resumen', e)
    return res.status(500).json({ error: 'No se pudo enviar el resumen.' })
  }
}
