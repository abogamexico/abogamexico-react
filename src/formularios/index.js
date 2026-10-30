import civil from './civil'
import familiar from './familiar'
import migratorio from './migratorio'
import penal from './penal'
import inmobiliario from './inmobiliario'
import mercantil from './mercantil'
import fiscal from './fiscal'
import seguridadSocial from './seguridad_social'
import administrativo from './administrativo'
import agrario from './agrario'

// Formulario por especialidad. Para agregar otra rama: crear su archivo
// (copiando la forma de civil.js) y registrarla aquí.
export const FORMULARIOS = Object.fromEntries(
  [civil, familiar, migratorio, penal, inmobiliario, mercantil, fiscal, seguridadSocial, administrativo, agrario].map(f => [f.especialidad, f])
)

// Formulario básico para las ramas que aún no tienen el suyo
const basico = especialidad => ({
  id: 'basico',
  especialidad,
  titulo: `Expediente · ${especialidad}`,
  secciones: [{
    id: 'general', titulo: 'Notas de la consulta',
    campos: [
      { id: 'resumen_cliente_dice', tipo: 'parrafo', etiqueta: 'En palabras del cliente: ¿qué está pasando?' },
      { id: 'cronologia', tipo: 'parrafo', etiqueta: 'Hechos y fechas importantes' },
      { id: 'evaluacion_libre', tipo: 'parrafo', etiqueta: 'Evaluación del abogado' },
      { id: 'pasos_libre', tipo: 'parrafo', etiqueta: 'Siguientes pasos' },
    ],
  }],
})

export function formularioPara(especialidad) {
  return FORMULARIOS[especialidad] || basico(especialidad || 'Consulta')
}

// ¿Se debe mostrar este campo o sección con las respuestas actuales?
export function visible(cond, datos) {
  if (!cond) return true
  const v = datos[cond.campo]
  if ('incluye' in cond) return Array.isArray(v) && v.includes(cond.incluye)
  if ('incluyeAlguno' in cond) return Array.isArray(v) && cond.incluyeAlguno.some(x => v.includes(x))
  if ('en' in cond) return cond.en.includes(v)
  if ('igual' in cond) return v === cond.igual
  if ('distinto' in cond) return v !== undefined && v !== '' && v !== cond.distinto
  return true
}

const etiquetaDe = (campo, valor) => (campo.opciones || []).find(o => o[0] === valor)?.[1] || valor

// Borrador del resumen para el cliente, a partir de lo marcado en el formulario
export function borradorResumen(form, datos, { nombreCliente, nombreAbogado }) {
  const campos = Object.fromEntries(form.secciones.flatMap(s => s.campos).map(c => [c.id, c]))
  const lista = id => (Array.isArray(datos[id]) ? datos[id] : []).map(v => etiquetaDe(campos[id], v))
  const uno = id => datos[id] ? etiquetaDe(campos[id], datos[id]) : null
  const L = []
  L.push(`Hola ${nombreCliente || ''}, gracias por tu consulta. Este es el resumen de lo que platicamos:`)
  const asuntos = lista('asuntos')
  if (asuntos.length) L.push(`\nTema: ${asuntos.join(', ')}.`)
  if (uno('viabilidad')) L.push(`Valoración inicial: viabilidad ${uno('viabilidad').toLowerCase()}.`)
  const via = lista('via')
  if (via.length) L.push(`Camino recomendado: ${via.join('; ')}.`)
  if (uno('duracion')) L.push(`Tiempo estimado: ${uno('duracion').toLowerCase()}.`)
  if (datos.prescripcion === 'si') L.push(`Importante: hay un plazo legal que corre${datos.prescripcion_fecha ? ' (fecha estimada: ' + datos.prescripcion_fecha + ')' : ''}; conviene no dejar pasar el tiempo.`)
  const docs = lista('docs_pendientes')
  if (docs.length) L.push(`\nDocumentos que necesito que me envíes:\n${docs.map(d => '• ' + d).join('\n')}`)
  const acc = lista('acciones')
  if (acc.length) L.push(`\nSiguientes pasos:\n${acc.map(a => '• ' + a).join('\n')}`)
  if (datos.servicio_adicional === 'si') L.push(`\nTu caso requiere servicios adicionales${datos.cotizacion?.monto ? `; honorarios estimados: $${datos.cotizacion.monto} ${datos.cotizacion.moneda || 'MXN'}` : ''}. Te enviaré la propuesta por separado.`)
  if (datos.seguimiento) L.push(`\nNos volvemos a contactar el ${datos.seguimiento}.`)
  if (datos.pasos_libre) L.push(`\n${datos.pasos_libre}`)
  L.push(`\nCualquier duda, responde a este correo.\n\nLic. ${nombreAbogado || ''}`)
  L.push(`\nEsta orientación se basa en la información que compartiste en la consulta.`)
  return L.join('\n')
}
