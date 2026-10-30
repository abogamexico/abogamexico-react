// POST /api/aceptar  { consulta_id }
// El abogado asignado confirma la cita. Se guarda la hora de aceptación
// y se avisa al cliente por correo.

import { supabaseAdmin, resendConfigurado, enviarCorreo, htmlConfirmacion, linkGoogleCalendar, siteUrl } from './_lib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    const sb = supabaseAdmin()
    const { data: { user } = {}, error: authErr } = await sb.auth.getUser(token)
    if (authErr || !user) return res.status(401).json({ error: 'Tu sesión expiró. Vuelve a iniciar sesión.', detalle: authErr?.message || (token ? 'sin usuario' : 'sin token') })

    const id = req.body?.consulta_id
    const { data: c } = await sb.from('consultas').select('*').eq('id', id).maybeSingle()
    if (!c || c.abogado_id !== user.id) return res.status(403).json({ error: 'Esta consulta no está asignada a ti.' })
    if (c.aceptada_at) return res.status(200).json({ ok: true, aceptada_at: c.aceptada_at })

    const { data: abogado } = await sb.from('abogados').select('nombre, apellido').eq('id', user.id).maybeSingle()
    const nombreAbogado = [abogado?.nombre, abogado?.apellido].filter(Boolean).join(' ')
    const ahora = new Date().toISOString()
    const { error } = await sb.from('consultas').update({ aceptada_at: ahora, abogado_nombre: nombreAbogado || c.abogado_nombre }).eq('id', c.id)
    if (error) throw error

    // Aviso al cliente
    if (resendConfigurado()) {
      try {
        const { data: cliente } = await sb.from('usuarios').select('nombre, apellido, email').eq('id', c.cliente_id).maybeSingle()
        if (cliente?.email) {
          const titulo = `Consulta AbogaMéxico · ${c.especialidad}`
          await enviarCorreo({
            para: cliente.email,
            asunto: `Tu abogado confirmó tu cita · ${c.fecha} ${c.hora}`,
            html: htmlConfirmacion({
              nombre: [cliente.nombre, cliente.apellido].filter(Boolean).join(' ') || 'cliente',
              titulo: 'Tu abogado confirmó tu cita',
              intro: `el Lic. ${nombreAbogado} aceptó tu consulta y te espera a la hora indicada.`,
              especialidad: c.especialidad, fecha: c.fecha, hora: c.hora, abogado: nombreAbogado, meetLink: c.meet_link,
              linkCalendario: linkGoogleCalendar({ titulo, fecha: c.fecha, hora: c.hora, detalles: 'Consulta legal por videollamada de hasta 60 minutos.', meetLink: c.meet_link }),
              panelUrl: siteUrl() + '/dashboard',
            }),
          })
        }
      } catch (e) { console.error('aceptar: correo al cliente', e) }
    }
    return res.status(200).json({ ok: true, aceptada_at: ahora })
  } catch (e) {
    console.error('aceptar', e)
    return res.status(500).json({ error: 'No se pudo aceptar. Intenta de nuevo.' })
  }
}
