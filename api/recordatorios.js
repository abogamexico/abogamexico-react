// GET /api/recordatorios
// Lo llama Supabase cada 15 minutos (ver supabase/007_horarios_recordatorios.sql).
// Manda, una sola vez por cita, un recordatorio 24 h antes y otro 1 h antes
// al cliente y al abogado. Es seguro llamarlo de más: solo envía lo que ya toca.

import { supabaseAdmin, inicioYFin, resendConfigurado, enviarCorreo, htmlConfirmacion, linkGoogleCalendar, nombreDe, siteUrl } from './_lib.js'

// Inicio de la cita en UTC (CDMX = UTC-6 todo el año)
const inicioUtc = c => { const r = inicioYFin(c.fecha, c.hora); return r ? new Date(new Date(r.inicio + 'Z').getTime() + 6 * 3600000) : null }

export default async function handler(req, res) {
  if (!resendConfigurado()) return res.status(200).json({ omitido: 'Falta RESEND_API_KEY' })
  const sb = supabaseAdmin()
  const ahora = new Date()
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(ahora)
  const pasado = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date(ahora.getTime() + 2 * 864e5))

  const { data: citas, error } = await sb.from('consultas').select('*').eq('pagado', true).gte('fecha', hoy).lte('fecha', pasado)
  if (error) return res.status(500).json({ error: error.message })

  const enviados = []
  for (const c of citas || []) {
    const ini = inicioUtc(c); if (!ini) continue
    const faltaMin = (ini - ahora) / 60000
    if (faltaMin <= 0) continue
    let tipo = null
    if (faltaMin <= 75 && !c.recordatorio_1h_at) tipo = '1h'
    else if (faltaMin <= 24 * 60 && faltaMin > 75 && !c.recordatorio_24h_at) {
      // Solo si la cita se agendó con más de 24 h de anticipación (si no, el correo de confirmación basta)
      if (ini - new Date(c.created_at) > 24 * 3600000) tipo = '24h'
    }
    if (!tipo) continue

    // Marcar primero para que dos llamadas seguidas no manden dos correos
    const campo = tipo === '1h' ? 'recordatorio_1h_at' : 'recordatorio_24h_at'
    const { data: marcada } = await sb.from('consultas').update({ [campo]: ahora.toISOString() }).eq('id', c.id).is(campo, null).select('id')
    if (!marcada?.length) continue

    try {
      const [{ data: cliente }, { data: abogado }] = await Promise.all([
        sb.from('usuarios').select('nombre, apellido, email').eq('id', c.cliente_id).maybeSingle(),
        c.abogado_id ? sb.from('abogados').select('nombre, apellido, email').eq('id', c.abogado_id).maybeSingle() : Promise.resolve({ data: null }),
      ])
      const titulo = tipo === '1h' ? 'Tu consulta empieza en 1 hora' : 'Tu consulta es mañana'
      const cal = { titulo: `Consulta AbogaMéxico · ${c.especialidad}`, fecha: c.fecha, hora: c.hora, detalles: 'Consulta legal por videollamada de hasta 60 minutos.', meetLink: c.meet_link }
      const base = { especialidad: c.especialidad, fecha: c.fecha, hora: c.hora, meetLink: c.meet_link, linkCalendario: tipo === '24h' ? linkGoogleCalendar(cal) : undefined }
      if (cliente?.email) {
        await enviarCorreo({
          para: cliente.email,
          asunto: `${tipo === '1h' ? 'En 1 hora' : 'Mañana'}: tu consulta de ${c.especialidad} · ${c.hora}`,
          html: htmlConfirmacion({ ...base, nombre: nombreDe(cliente) || 'cliente', titulo, abogado: nombreDe(abogado) || c.abogado_nombre,
            intro: tipo === '1h' ? 'te recordamos que tu consulta empieza en una hora. Ten a la mano tus documentos y entra unos minutos antes.' : 'te recordamos tu consulta de mañana. Si necesitas cambiar el horario, respóndenos hoy.',
            panelUrl: siteUrl() + '/dashboard' }),
        })
      }
      if (abogado?.email) {
        await enviarCorreo({
          para: abogado.email,
          asunto: `${tipo === '1h' ? 'En 1 hora' : 'Mañana'}: consulta de ${c.especialidad} · ${c.hora}`,
          html: htmlConfirmacion({ ...base, nombre: 'Lic. ' + (abogado.nombre || ''), paraAbogado: true, cliente: nombreDe(cliente) || 'Cliente', descripcion: c.descripcion, titulo: tipo === '1h' ? 'Tu consulta empieza en 1 hora' : 'Tienes una consulta mañana',
            intro: c.aceptada_at ? 'aquí tienes los datos de la consulta y el enlace al expediente.' : 'aún no has aceptado esta cita. Entra a tu panel para aceptarla.',
            panelUrl: siteUrl() + '/abogado/consulta/' + c.id }),
        })
      }
      enviados.push({ id: c.id, tipo })
    } catch (e) {
      console.error('recordatorios', c.id, e)
      await sb.from('consultas').update({ [campo]: null }).eq('id', c.id) // reintentar en la próxima vuelta
    }
  }
  return res.status(200).json({ revisadas: (citas || []).length, enviados })
}
