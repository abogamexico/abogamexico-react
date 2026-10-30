// GET /api/horarios?especialidad=Derecho%20Civil&fecha=2026-11-03
// Qué horas de ese día tienen al menos un abogado libre de esa especialidad.
// No revela datos de nadie: solo sí/no por hora.

import { supabaseAdmin, HORAS, esFechaValida, abogadosDe, ocupadosDelDia } from './_lib.js'

export default async function handler(req, res) {
  const { especialidad, fecha } = req.query || {}
  if (!especialidad || !/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) return res.status(400).json({ error: 'Faltan especialidad o fecha.' })
  try {
    const sb = supabaseAdmin()
    const [abogados, ocupados] = await Promise.all([abogadosDe(sb, especialidad), ocupadosDelDia(sb, fecha)])
    const horas = HORAS.map(hora => {
      if (!esFechaValida(fecha, hora)) return { hora, disponible: false, motivo: 'pasada' }
      // Sin abogados todavía en esa rama: se permite agendar y el administrador asigna
      if (abogados.length === 0) return { hora, disponible: true }
      const libre = abogados.some(a => !ocupados.has(a.id + '|' + hora))
      return { hora, disponible: libre, motivo: libre ? undefined : 'ocupada' }
    })
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ fecha, especialidad, horas, conAbogados: abogados.length > 0 })
  } catch (e) {
    console.error('horarios', e)
    return res.status(500).json({ error: 'No pudimos consultar los horarios.' })
  }
}
