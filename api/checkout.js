// POST /api/checkout
// El cliente (con sesión iniciada) manda especialidad, fecha, hora y descripción.
// Respondemos con la URL de pago de Stripe. La consulta NO se guarda aquí:
// se crea en /api/stripe-webhook cuando Stripe confirma el pago.

import { supabaseAdmin, stripe, siteUrl, PRECIO_CENTAVOS, HORAS, esFechaValida, abogadosLibres } from './_lib.js'

const ESPECIALIDADES = ['Derecho Civil', 'Derecho Migratorio', 'Derecho Familiar', 'Derecho Penal', 'Derecho Inmobiliario',
  'Derecho Mercantil', 'Derecho Fiscal', 'Seguridad Social', 'Derecho Administrativo', 'Derecho Agrario']

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })
  try {
    // 1) ¿Quién es? Validamos su sesión de Supabase.
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ error: 'Inicia sesión para agendar.' })
    const sb = supabaseAdmin()
    const { data: { user } = {}, error: authErr } = await sb.auth.getUser(token)
    if (authErr || !user) return res.status(401).json({ error: 'Tu sesión expiró. Vuelve a iniciar sesión.', detalle: authErr?.message || (token ? 'sin usuario' : 'sin token') })

    // 2) Validar los datos de la cita
    const { especialidad, fecha, hora, descripcion = '' } = req.body || {}
    if (!ESPECIALIDADES.includes(especialidad)) return res.status(400).json({ error: 'Especialidad no válida.' })
    if (!HORAS.includes(hora)) return res.status(400).json({ error: 'Horario no válido.' })
    if (!esFechaValida(fecha, hora)) return res.status(400).json({ error: 'Elige una fecha y hora con al menos 2 horas de anticipación.' })
    const { total, libres } = await abogadosLibres(sb, especialidad, fecha, hora)
    if (total > 0 && libres.length === 0) return res.status(409).json({ error: 'Ese horario se acaba de ocupar. Elige otro, por favor.' })

    // 3) Asegurar que el cliente tenga perfil (cuentas creadas antes del ajuste de la base)
    const m = user.user_metadata || {}
    await sb.from('usuarios').upsert(
      { id: user.id, email: user.email, nombre: m.nombre || null, apellido: m.apellido || null },
      { onConflict: 'id', ignoreDuplicates: true }
    )

    // 4) Crear la sesión de pago en Stripe
    const meta = {
      cliente_id: user.id,
      especialidad,
      fecha,
      hora,
      descripcion: String(descripcion).slice(0, 450),
    }
    const lineItem = {
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: PRECIO_CENTAVOS,
        product_data: {
          name: `Consulta legal por videollamada — ${especialidad}`,
          description: `${fecha} a las ${hora} (hora del Centro de México) · hasta 60 minutos`,
        },
      },
    }
    // Impuestos: automáticos con Stripe Tax (STRIPE_AUTOMATIC_TAX=true)
    // o una tasa fija (STRIPE_TAX_RATE_ID=txr_...). Si no hay ninguna, no se suman.
    const impuestoAuto = process.env.STRIPE_AUTOMATIC_TAX === 'true'
    if (impuestoAuto) {
      lineItem.price_data.tax_behavior = 'exclusive' // el impuesto se suma a los $49.99
      lineItem.price_data.product_data.tax_code = process.env.STRIPE_TAX_CODE || 'txcd_20060054' // Legal Services
    } else if (process.env.STRIPE_TAX_RATE_ID) {
      lineItem.tax_rates = [process.env.STRIPE_TAX_RATE_ID]
    }

    const session = await stripe('checkout/sessions', {
      mode: 'payment',
      locale: 'es-419',
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [lineItem],
      automatic_tax: impuestoAuto ? { enabled: true } : undefined,
      billing_address_collection: impuestoAuto ? 'required' : undefined, // Stripe necesita el domicilio para calcularlo
      metadata: meta,
      payment_intent_data: { metadata: meta, description: `AbogaMéxico · ${especialidad} · ${fecha} ${hora}` },
      success_url: siteUrl() + '/dashboard?pago=ok&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: siteUrl() + '/dashboard?pago=cancelado',
    })

    return res.status(200).json({ url: session.url })
  } catch (e) {
    console.error('checkout', e)
    return res.status(500).json({ error: 'No pudimos iniciar el pago. Intenta de nuevo en un momento.' })
  }
}
