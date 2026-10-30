// POST /api/admin  { accion, ... }
// Solo para los correos en ADMIN_EMAILS. Acciones:
//   resumen                               → números, consultas y abogados
//   verificar   { abogado_id, verificado } → aprobar o pausar a un abogado
//   asignar     { consulta_id, abogado_id } → (re)asignar una consulta
//   reprogramar { consulta_id, fecha, hora } → mover una cita

import {
  supabaseAdmin, usuarioDe, esAdmin, nombreDe, atiende, abogadosLibres, ocupadosDelDia, HORAS, inicioYFin,
  actualizarEvento, avisarAbogado, resendConfigurado, enviarCorreo, htmlConfirmacion, linkGoogleCalendar, archivoIcs, siteUrl,
} from './_lib.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  const sb = supabaseAdmin()
  const user = await usuarioDe(req, sb)
  if (!user) return res.status(401).json({ error: 'Tu sesión expiró. Vuelve a iniciar sesión.' })
  if (!esAdmin(user)) return res.status(403).json({ error: 'Tu cuenta no tiene acceso de administrador.' })

  const b = req.body || {}
  try {
    if (b.accion === 'resumen') return res.status(200).json(await resumen(sb))
    if (b.accion === 'verificar') {
      const { error } = await sb.from('abogados').update({ verificado: !!b.verificado }).eq('id', b.abogado_id)
      if (error) throw error
      return res.status(200).json({ ok: true })
    }
    if (b.accion === 'asignar') return res.status(200).json(await asignar(sb, b))
    if (b.accion === 'reprogramar') return res.status(200).json(await reprogramar(sb, b))
    return res.status(400).json({ error: 'Acción desconocida.' })
  } catch (e) {
    console.error('admin', b.accion, e)
    return res.status(e.status || 500).json({ error: e.publico || 'Algo salió mal: ' + (e.message || e) })
  }
}

const falla = (status, publico) => Object.assign(new Error(publico), { status, publico })

async function resumen(sb) {
  const [{ data: consultas }, { data: abogados }, { data: usuarios }] = await Promise.all([
    sb.from('consultas').select('*').order('created_at', { ascending: false }).limit(300),
    sb.from('abogados').select('*'),
    sb.from('usuarios').select('id, nombre, apellido, email, telefono, pais, ciudad'),
  ])
  const porUsuario = Object.fromEntries((usuarios || []).map(u => [u.id, u]))
  const porAbogado = Object.fromEntries((abogados || []).map(a => [a.id, a]))
  const hoy = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date())
  const pagadas = (consultas || []).filter(c => c.pagado)
  const cuenta = {}
  for (const c of pagadas) if (c.abogado_id) cuenta[c.abogado_id] = (cuenta[c.abogado_id] || 0) + 1

  return {
    numeros: {
      pagadas: pagadas.length,
      ingresos: pagadas.reduce((t, c) => t + Number(c.monto || 0), 0),
      proximas: pagadas.filter(c => c.fecha >= hoy).length,
      sinAbogado: pagadas.filter(c => !c.abogado_id && c.fecha >= hoy).length,
      porAceptar: pagadas.filter(c => c.abogado_id && !c.aceptada_at && c.fecha >= hoy).length,
      abogadosPendientes: (abogados || []).filter(a => !a.verificado).length,
    },
    hoy,
    consultas: pagadas.map(c => {
      const u = porUsuario[c.cliente_id] || {}
      return {
        id: c.id, fecha: c.fecha, hora: c.hora, especialidad: c.especialidad, monto: c.monto, created_at: c.created_at,
        descripcion: c.descripcion, meet_link: c.meet_link, stripe_payment_id: c.stripe_payment_id,
        cliente: nombreDe(u) || '—', cliente_email: u.email || null, cliente_lugar: [u.ciudad, u.pais].filter(Boolean).join(', '),
        abogado_id: c.abogado_id, abogado: c.abogado_id ? (nombreDe(porAbogado[c.abogado_id]) || c.abogado_nombre) : null,
        aceptada: !!c.aceptada_at, resumen_enviado: !!c.resumen_enviado_at,
      }
    }),
    abogados: (abogados || []).map(a => ({
      id: a.id, nombre: nombreDe(a) || '(sin nombre)', email: a.email, telefono: a.telefono, cedula: a.cedula,
      estado: a.estado, ciudad: a.ciudad, especialidades: a.especialidades?.length ? a.especialidades : a.especialidad ? [a.especialidad] : [],
      verificado: !!a.verificado, consultas: cuenta[a.id] || 0, created_at: a.created_at,
    })).sort((x, y) => Number(x.verificado) - Number(y.verificado) || x.nombre.localeCompare(y.nombre)),
  }
}

async function asignar(sb, { consulta_id, abogado_id }) {
  const { data: c } = await sb.from('consultas').select('*').eq('id', consulta_id).maybeSingle()
  if (!c) throw falla(404, 'No encontré la consulta.')
  const { data: a } = await sb.from('abogados').select('*').eq('id', abogado_id).maybeSingle()
  if (!a || !a.verificado) throw falla(400, 'Ese abogado no está verificado.')
  if (!atiende(a, c.especialidad)) throw falla(400, `Ese abogado no atiende ${c.especialidad}.`)
  const ocupados = await ocupadosDelDia(sb, c.fecha)
  if (ocupados.has(a.id + '|' + c.hora) && c.abogado_id !== a.id) throw falla(409, 'Ese abogado ya tiene otra cita a esa hora.')

  const anterior = c.abogado_id
  const { error } = await sb.from('consultas').update({ abogado_id: a.id, abogado_nombre: nombreDe(a), aceptada_at: null }).eq('id', c.id)
  if (error) throw error
  await sb.from('casos').update({ abogado_id: a.id }).eq('cliente_id', c.cliente_id).eq('especialidad', c.especialidad).eq('estado', 'abierto')

  // Invitado en el evento de Meet (para que entre directo), sin correos de Google
  if (c.google_event_id) {
    const { data: u } = await sb.from('usuarios').select('email').eq('id', c.cliente_id).maybeSingle()
    try { await actualizarEvento(c.google_event_id, { attendees: [u?.email, a.email].filter(Boolean).map(email => ({ email })) }) }
    catch (e) { console.warn('asignar: evento', e.message) }
  }
  try { await avisarAbogado(sb, { ...c, abogado_id: a.id }) } catch (e) { console.warn('asignar: correo', e.message) }
  return { ok: true, abogado: nombreDe(a), anterior }
}

async function reprogramar(sb, { consulta_id, fecha, hora }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !HORAS.includes(hora)) throw falla(400, 'Fecha u hora no válida.')
  const { data: c } = await sb.from('consultas').select('*').eq('id', consulta_id).maybeSingle()
  if (!c) throw falla(404, 'No encontré la consulta.')
  let abogado_id = c.abogado_id
  if (abogado_id) {
    const ocupados = await ocupadosDelDia(sb, fecha)
    if (ocupados.has(abogado_id + '|' + hora) && !(c.fecha === fecha && c.hora === hora)) {
      // Su abogado no puede: buscar otro libre de la misma rama
      const { libres } = await abogadosLibres(sb, c.especialidad, fecha, hora, { excepto: abogado_id })
      if (!libres.length) throw falla(409, 'Ningún abogado de esa rama está libre en ese horario.')
      abogado_id = libres[0].id
    }
  }
  const cambios = { fecha, hora, recordatorio_24h_at: null, recordatorio_1h_at: null }
  if (abogado_id !== c.abogado_id) {
    const { data: a } = await sb.from('abogados').select('nombre, apellido').eq('id', abogado_id).maybeSingle()
    Object.assign(cambios, { abogado_id, abogado_nombre: nombreDe(a), aceptada_at: null })
  }
  const { error } = await sb.from('consultas').update(cambios).eq('id', c.id)
  if (error) throw error
  const nueva = { ...c, ...cambios }

  const horario = inicioYFin(fecha, hora)
  if (c.google_event_id && horario) {
    try { await actualizarEvento(c.google_event_id, { start: { dateTime: horario.inicio, timeZone: 'America/Mexico_City' }, end: { dateTime: horario.fin, timeZone: 'America/Mexico_City' } }) }
    catch (e) { console.warn('reprogramar: evento', e.message) }
  }
  // Avisar al cliente y al abogado
  if (resendConfigurado()) {
    try {
      const { data: u } = await sb.from('usuarios').select('nombre, apellido, email').eq('id', c.cliente_id).maybeSingle()
      if (u?.email) {
        const titulo = `Consulta AbogaMéxico · ${c.especialidad}`
        const cal = { titulo, fecha, hora, detalles: 'Consulta legal por videollamada de hasta 60 minutos.', meetLink: c.meet_link }
        const ics = archivoIcs({ ...cal, uid: 'consulta-' + c.id })
        await enviarCorreo({
          para: u.email, copiaOculta: 'abogamexicoconsultoria@gmail.com',
          asunto: `Tu cita cambió de horario · ${fecha} ${hora}`,
          html: htmlConfirmacion({ nombre: nombreDe(u) || 'cliente', titulo: 'Tu cita tiene nuevo horario', intro: 'cambiamos tu consulta al horario que ves abajo. El enlace de la videollamada es el mismo.', especialidad: c.especialidad, fecha, hora, abogado: nueva.abogado_nombre, meetLink: c.meet_link, linkCalendario: linkGoogleCalendar(cal), panelUrl: siteUrl() + '/dashboard' }),
          adjuntos: ics ? [ics] : undefined,
        })
      }
      if (nueva.abogado_id) await avisarAbogado(sb, nueva, { motivo: abogado_id === c.abogado_id ? 'reprogramada' : 'nueva' })
    } catch (e) { console.warn('reprogramar: correos', e.message) }
  }
  return { ok: true, abogado_cambio: abogado_id !== c.abogado_id }
}
