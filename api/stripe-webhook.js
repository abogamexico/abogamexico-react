// POST /api/stripe-webhook
// Stripe nos avisa aquí cuando un pago se completa. Entonces:
//   1) guardamos la consulta como pagada (una sola vez, aunque Stripe reintente)
//   2) asignamos un abogado verificado que atienda esa especialidad, si hay
//   3) creamos el evento de Google Calendar con enlace de Meet e invitamos
//      al cliente y al abogado por correo

import {
  supabaseAdmin, verificarFirmaStripe, leerCuerpoCrudo,
  googleConfigurado, crearEventoMeet, inicioYFin,
  resendConfigurado, enviarCorreo, htmlConfirmacion, linkGoogleCalendar, archivoIcs, siteUrl, abogadosLibres,
} from './_lib.js'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método no permitido')

  const raw = await leerCuerpoCrudo(req)
  if (!verificarFirmaStripe(raw, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)) {
    return res.status(400).send('Firma inválida')
  }

  const evento = JSON.parse(raw)
  const tipos = ['checkout.session.completed', 'checkout.session.async_payment_succeeded']
  if (!tipos.includes(evento.type)) return res.status(200).json({ ignorado: evento.type })

  const s = evento.data.object
  if (s.payment_status !== 'paid') return res.status(200).json({ pendiente: true })

  const m = s.metadata || {}
  const sb = supabaseAdmin()

  // 1) Guardar la consulta (idempotente por stripe_session_id)
  let consulta
  try {
    const { data: existente } = await sb.from('consultas').select('*').eq('stripe_session_id', s.id).maybeSingle()
    consulta = existente
    if (!consulta) {
      // 2) Elegir abogado: verificado, de esa especialidad, LIBRE en ese horario y con menos consultas
      const { libres } = await abogadosLibres(sb, m.especialidad, m.fecha, m.hora)
      let abogado = libres[0] || null

      const registro = {
        cliente_id: m.cliente_id || s.client_reference_id || null,
        abogado_id: abogado?.id || null,
        abogado_nombre: abogado ? [abogado.nombre, abogado.apellido].filter(Boolean).join(' ') : null,
        especialidad: m.especialidad || null,
        fecha: m.fecha || null,
        hora: m.hora || null,
        descripcion: m.descripcion || null,
        monto: (s.amount_total ?? 4999) / 100,
        pagado: true,
        stripe_session_id: s.id,
        stripe_payment_id: s.payment_intent || null,
      }
      const { data, error } = await sb.from('consultas').insert(registro).select().single()
      let fila = data
      if (error && error.code === '23505' && /horario/i.test(error.message || '')) {
        // Otro pago ganó ese horario con el mismo abogado al mismo tiempo: guardar sin abogado (lo asigna el administrador)
        const r = await sb.from('consultas').insert({ ...registro, abogado_id: null, abogado_nombre: null }).select().single()
        if (r.error) throw r.error
        fila = r.data
      } else if (error) {
        // Si Stripe mandó el mismo aviso dos veces al mismo tiempo, el índice único lo frena
        if (error.code === '23505') return res.status(200).json({ duplicado: true })
        throw error
      }
      consulta = fila

      // Caso abierto para el expediente del cliente y del abogado
      await sb.from('casos').insert({
        cliente_id: consulta.cliente_id,
        abogado_id: consulta.abogado_id,
        especialidad: consulta.especialidad,
        descripcion: consulta.descripcion,
        estado: 'abierto',
      }).then(({ error: e }) => e && console.warn('casos insert', e.message))
    }
  } catch (e) {
    console.error('webhook: no se pudo guardar la consulta', e)
    return res.status(500).send('Error guardando consulta') // Stripe reintentará
  }

  // 3) Google Meet (si está configurado y aún no se creó)
  if (googleConfigurado() && !consulta.meet_link) {
    try {
      const horario = inicioYFin(consulta.fecha, consulta.hora)
      let abogado = null
      if (consulta.abogado_id) {
        const { data } = await sb.from('abogados').select('email, nombre, apellido').eq('id', consulta.abogado_id).maybeSingle()
        abogado = data
      }
      const { data: cliente } = await sb.from('usuarios').select('nombre, apellido, email').eq('id', consulta.cliente_id).maybeSingle()
      const correoCliente = s.customer_details?.email || s.customer_email || cliente?.email
      const nombreCliente = [cliente?.nombre, cliente?.apellido].filter(Boolean).join(' ') || s.customer_details?.name || 'Cliente'

      if (horario) {
        const { eventId, meetLink } = await crearEventoMeet({
          id: s.id,
          titulo: `Consulta AbogaMéxico · ${consulta.especialidad}`,
          descripcion: [
            `Consulta legal por videollamada de hasta 60 minutos.`,
            `Cliente: ${nombreCliente}`,
            abogado ? `Abogado: Lic. ${[abogado.nombre, abogado.apellido].filter(Boolean).join(' ')}` : `Abogado: por asignar`,
            consulta.descripcion ? `\nAsunto: ${consulta.descripcion}` : '',
            `\nPara cambiar el horario (hasta 24 h antes) escribe a abogamexicoconsultoria@gmail.com.`,
            `La sesión no se graba.`,
          ].filter(Boolean).join('\n'),
          inicio: horario.inicio,
          fin: horario.fin,
          invitados: [correoCliente, abogado?.email],
        })
        await sb.from('consultas').update({ meet_link: meetLink, google_event_id: eventId }).eq('id', consulta.id)
      }
    } catch (e) {
      // El pago ya quedó guardado; el enlace se puede crear a mano si falla Google
      console.error('webhook: no se pudo crear el Meet', e)
    }
  }

  // 4) Correo de confirmación con el enlace de Meet (una sola vez)
  if (resendConfigurado()) {
    try {
      const { data: c } = await sb.from('consultas').select('*').eq('id', consulta.id).maybeSingle()
      if (c && !c.confirmacion_enviada) {
        const { data: cliente } = await sb.from('usuarios').select('nombre, apellido, email').eq('id', c.cliente_id).maybeSingle()
        const { data: abogado } = c.abogado_id
          ? await sb.from('abogados').select('nombre, apellido, email').eq('id', c.abogado_id).maybeSingle()
          : { data: null }
        const nombreCliente = [cliente?.nombre, cliente?.apellido].filter(Boolean).join(' ') || s.customer_details?.name || ''
        const nombreAbogado = abogado ? [abogado.nombre, abogado.apellido].filter(Boolean).join(' ') : null
        const titulo = `Consulta AbogaMéxico · ${c.especialidad}`
        const detalles = `Consulta legal por videollamada de hasta 60 minutos.${nombreAbogado ? ' Abogado: Lic. ' + nombreAbogado + '.' : ''}`
        const cal = { titulo, fecha: c.fecha, hora: c.hora, detalles, meetLink: c.meet_link }
        const ics = archivoIcs({ ...cal, uid: 'consulta-' + c.id })
        const datos = { especialidad: c.especialidad, fecha: c.fecha, hora: c.hora, meetLink: c.meet_link, descripcion: c.descripcion, linkCalendario: linkGoogleCalendar(cal) }
        const correoCliente = s.customer_details?.email || s.customer_email || cliente?.email

        await enviarCorreo({
          para: correoCliente,
          copiaOculta: 'abogamexicoconsultoria@gmail.com',
          asunto: `Consulta confirmada · ${c.especialidad} · ${c.fecha} ${c.hora}`,
          html: htmlConfirmacion({ ...datos, nombre: nombreCliente || 'cliente', abogado: nombreAbogado, panelUrl: siteUrl() + '/dashboard' }),
          adjuntos: ics ? [ics] : undefined,
        })
        if (abogado?.email) {
          await enviarCorreo({
            para: abogado.email,
            asunto: `Nueva consulta asignada · ${c.especialidad} · ${c.fecha} ${c.hora}`,
            html: htmlConfirmacion({ ...datos, nombre: 'Lic. ' + (abogado.nombre || ''), paraAbogado: true, cliente: nombreCliente || 'Cliente', panelUrl: siteUrl() + '/abogado' }),
            adjuntos: ics ? [ics] : undefined,
          })
        }
        await sb.from('consultas').update({ confirmacion_enviada: true }).eq('id', c.id)
      }
    } catch (e) {
      console.error('webhook: no se pudo enviar el correo de confirmación', e)
    }
  }

  return res.status(200).json({ ok: true })
}
