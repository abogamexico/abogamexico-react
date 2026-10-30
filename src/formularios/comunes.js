// Secciones que comparten todos los expedientes. Cada rama les pasa sus propias opciones.
// Los ids (asuntos, viabilidad, via, docs_pendientes, acciones…) son los mismos en todas
// las ramas porque el borrador del resumen para el cliente los usa.
import { ESTADOS_MX } from '../lib/catalogos'
import { ESPECIALIDADES } from '../components/EspecialidadesPicker'

export const SINO_NS = [['si', 'Sí'], ['no', 'No'], ['ns', 'No sé']]
export const ESTADOS = ESTADOS_MX.map(e => [e, e]).concat([['extranjero', 'Fuera de México']])

export function asunto({ asuntos, objetivos }) {
  return {
    id: 'asunto', titulo: '1. ¿De qué trata el caso?',
    campos: [
      { id: 'asuntos', tipo: 'multi', etiqueta: 'Tipo de asunto (marca todos los que apliquen)', opciones: [...asuntos, ['otro', 'Otro asunto']] },
      { id: 'asunto_otro', tipo: 'texto', etiqueta: '¿Cuál otro asunto?', si: { campo: 'asuntos', incluye: 'otro' } },
      { id: 'resumen_cliente_dice', tipo: 'parrafo', etiqueta: 'En palabras del cliente: ¿qué está pasando?', ayuda: 'Anota lo que cuenta el cliente tal cual.' },
      { id: 'objetivo', tipo: 'multi', etiqueta: '¿Qué quiere lograr el cliente?', opciones: [...objetivos, ['orientacion', 'Solo orientación por ahora']] },
      { id: 'urgencia', tipo: 'opcion', etiqueta: 'Urgencia', opciones: [['alta', 'Alta: hay un plazo, audiencia o riesgo inmediato'], ['media', 'Media'], ['baja', 'Baja: solo quiere informarse']] },
      { id: 'fecha_limite', tipo: 'fecha', etiqueta: 'Fecha límite o audiencia próxima', si: { campo: 'urgencia', igual: 'alta' } },
    ],
  }
}

export function cliente(extra = []) {
  return {
    id: 'cliente', titulo: '2. Situación del cliente',
    campos: [
      { id: 'reside', tipo: 'opcion', etiqueta: '¿Dónde vive el cliente?', opciones: [['eeuu', 'Estados Unidos'], ['mexico', 'México'], ['otro_pais', 'Otro país']] },
      { id: 'reside_estado_eeuu', tipo: 'texto', etiqueta: 'Estado y ciudad en EE.UU.', si: { campo: 'reside', igual: 'eeuu' } },
      { id: 'puede_viajar', tipo: 'opcion', etiqueta: '¿Puede viajar a México si hace falta?', opciones: [['si', 'Sí'], ['no', 'No'], ['dificil', 'Con dificultad']] },
      { id: 'identificacion', tipo: 'multi', etiqueta: 'Identificación mexicana vigente con la que cuenta', opciones: [['ine', 'INE'], ['pasaporte', 'Pasaporte mexicano'], ['matricula', 'Matrícula consular'], ['ninguna', 'Ninguna vigente']] },
      ...extra,
      { id: 'requiere_poder', tipo: 'sino', etiqueta: '¿Necesitará otorgar un poder para que alguien lo represente en México?', opciones: SINO_NS },
      { id: 'poder_via', tipo: 'opcion', etiqueta: '¿Cómo se otorgaría el poder?', si: { campo: 'requiere_poder', igual: 'si' }, opciones: [['consulado', 'En el consulado de México'], ['notario_apostilla', 'Ante notario en EE.UU. con apostilla'], ['notario_mx', 'Ante notario en México (viajando)']] },
      { id: 'apoderado', tipo: 'texto', etiqueta: 'Persona de confianza en México (nombre y relación)', si: { campo: 'requiere_poder', igual: 'si' } },
    ],
  }
}

export function partes({ roles, relaciones, contraparteEtiqueta = 'Nombre de la otra parte (persona, empresa o autoridad)', extra = [] }) {
  return {
    id: 'partes', titulo: '3. Las partes',
    campos: [
      { id: 'rol', tipo: 'opcion', etiqueta: 'El cliente es…', opciones: roles },
      { id: 'contraparte', tipo: 'texto', etiqueta: contraparteEtiqueta },
      ...(relaciones ? [{ id: 'relacion', tipo: 'opcion', etiqueta: 'Relación con la otra parte', opciones: relaciones }] : []),
      { id: 'contraparte_estado', tipo: 'opcion', etiqueta: '¿Dónde está la otra parte?', opciones: ESTADOS },
      ...extra,
      { id: 'otros_involucrados', tipo: 'parrafo', etiqueta: 'Otras personas involucradas' },
    ],
  }
}

export function hechos({ estadoEtiqueta = 'Estado donde ocurrieron los hechos', conMonto = true, intentos, extra = [] } = {}) {
  return {
    id: 'hechos', titulo: '4. Hechos',
    campos: [
      { id: 'estado_hechos', tipo: 'opcion', etiqueta: estadoEtiqueta, opciones: ESTADOS },
      { id: 'municipio', tipo: 'texto', etiqueta: 'Municipio o alcaldía' },
      { id: 'fecha_inicio', tipo: 'fecha', etiqueta: '¿Cuándo empezó el problema?' },
      ...(conMonto ? [{ id: 'monto', tipo: 'dinero', etiqueta: 'Monto involucrado (aproximado)' }] : []),
      ...(intentos ? [{ id: 'intentos', tipo: 'multi', etiqueta: '¿Qué ha intentado el cliente?', opciones: [...intentos, ['nada', 'Nada aún']] }] : []),
      ...extra,
      { id: 'cronologia', tipo: 'parrafo', etiqueta: 'Cronología de los hechos', ayuda: 'Fechas y lo que pasó en cada una.' },
    ],
  }
}

export function documentos(docs) {
  return {
    id: 'documentos', titulo: '5. Documentos con los que cuenta el cliente',
    campos: [
      { id: 'docs_tiene', tipo: 'multi', etiqueta: 'Tiene', opciones: docs },
      { id: 'docs_notas', tipo: 'parrafo', etiqueta: 'Notas sobre los documentos (quién los tiene, en qué estado están)' },
    ],
  }
}

export function procesal({ situaciones, autoridadEtiqueta = 'Autoridad, juzgado o tribunal (y ciudad)', etapas, codigos, extra = [] }) {
  return {
    id: 'procesal', titulo: '6. ¿Ya hay un juicio o trámite?',
    campos: [
      { id: 'juicio', tipo: 'opcion', etiqueta: 'Situación', opciones: [['no', 'No, aún no'], ...situaciones, ['ns', 'No sabe']] },
      { id: 'juzgado', tipo: 'texto', etiqueta: autoridadEtiqueta, si: { campo: 'juicio', distinto: 'no' } },
      { id: 'expediente_num', tipo: 'texto', etiqueta: 'Número de expediente, carpeta o folio', si: { campo: 'juicio', distinto: 'no' } },
      ...(etapas ? [{ id: 'etapa', tipo: 'opcion', etiqueta: 'Etapa', si: { campo: 'juicio', distinto: 'no' }, opciones: [...etapas, ['ns', 'No sabe']] }] : []),
      { id: 'abogado_previo', tipo: 'sino', etiqueta: '¿Tiene otro abogado en el asunto?', opciones: SINO_NS, si: { campo: 'juicio', distinto: 'no' } },
      ...(codigos ? [{ id: 'codigo', tipo: 'opcion', etiqueta: 'Legislación aplicable', opciones: [...codigos, ['por_definir', 'Por determinar']] }] : []),
      ...extra,
    ],
  }
}

export function evaluacion({ especialidad, vias, extra = [] }) {
  const otras = ESPECIALIDADES.filter(e => e !== especialidad).map(e => [e, e.replace('Derecho ', '')])
  return {
    id: 'evaluacion', titulo: '7. Evaluación del abogado',
    campos: [
      { id: 'viabilidad', tipo: 'opcion', etiqueta: 'Viabilidad del caso', opciones: [['alta', 'Alta'], ['media', 'Media'], ['baja', 'Baja'], ['falta_info', 'Falta información para evaluar']] },
      { id: 'prescripcion', tipo: 'sino', etiqueta: '¿Riesgo de que venza un plazo legal (prescripción, caducidad, término para recurrir)?', opciones: SINO_NS },
      { id: 'prescripcion_fecha', tipo: 'fecha', etiqueta: 'Fecha estimada en que vence', si: { campo: 'prescripcion', igual: 'si' } },
      { id: 'via', tipo: 'multi', etiqueta: 'Vía recomendada', opciones: [...vias, ['canalizar', 'Canalizar a otra especialidad']] },
      { id: 'canalizar_a', tipo: 'opcion', etiqueta: 'Canalizar a', si: { campo: 'via', incluye: 'canalizar' }, opciones: otras },
      ...extra,
      { id: 'riesgos', tipo: 'parrafo', etiqueta: 'Riesgos y puntos débiles' },
      { id: 'requiere_presencia', tipo: 'sino', etiqueta: '¿El cliente tendrá que presentarse en México?', opciones: SINO_NS },
      { id: 'duracion', tipo: 'opcion', etiqueta: 'Duración estimada', opciones: [['semanas', 'Semanas'], ['1a6m', '1 a 6 meses'], ['6a12m', '6 a 12 meses'], ['mas_1a', 'Más de 1 año']] },
    ],
  }
}

export function pasos({ docs, acciones }) {
  return {
    id: 'pasos', titulo: '8. Siguientes pasos',
    campos: [
      { id: 'docs_pendientes', tipo: 'multi', etiqueta: 'Documentos que el cliente debe enviar', opciones: docs },
      { id: 'acciones', tipo: 'multi', etiqueta: 'Acciones acordadas', opciones: [
        ['enviar_docs', 'El cliente enviará documentos'], ...acciones,
        ['cotizacion', 'Enviar cotización de servicios'], ['segunda_consulta', 'Agendar segunda consulta'], ['sin_accion', 'No se requiere más acción'],
      ] },
      { id: 'servicio_adicional', tipo: 'sino', etiqueta: '¿El caso requiere servicios adicionales del abogado?', opciones: SINO_NS },
      { id: 'cotizacion', tipo: 'dinero', etiqueta: 'Honorarios estimados', si: { campo: 'servicio_adicional', igual: 'si' } },
      { id: 'seguimiento', tipo: 'fecha', etiqueta: 'Fecha de seguimiento' },
    ],
  }
}

// Documentos que piden casi todas las ramas
export const DOCS_BASE = [
  ['identificacion', 'Identificación oficial'], ['curp', 'CURP'], ['acta_nacimiento', 'Acta de nacimiento'],
  ['comprobante_domicilio', 'Comprobante de domicilio'],
]
export const DOCS_FIN = [
  ['fotos', 'Fotos o videos'], ['mensajes', 'Mensajes o correos'], ['notificacion', 'Notificación o documento recibido de una autoridad'],
]
