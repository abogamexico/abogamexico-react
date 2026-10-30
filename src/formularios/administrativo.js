// Expediente · Derecho Administrativo
import { SINO_NS, asunto, cliente, partes, hechos, documentos, procesal, evaluacion, pasos, DOCS_BASE, DOCS_FIN } from './comunes'

export default {
  id: 'administrativo',
  especialidad: 'Derecho Administrativo',
  titulo: 'Expediente · Derecho Administrativo',
  secciones: [
    asunto({
      asuntos: [
        ['permisos', 'Permisos y licencias (construcción, negocio, uso de suelo)'], ['multas', 'Multas e infracciones (tránsito, municipales)'],
        ['clausura', 'Clausura o suspensión de un negocio u obra'], ['tramite_negado', 'Trámite negado o sin respuesta'], ['peticion', 'Derecho de petición'],
        ['transparencia', 'Solicitud de información pública'], ['responsabilidad_estado', 'Daño causado por una autoridad'], ['licitaciones', 'Licitaciones o contratos con gobierno'],
        ['servidor_publico', 'Problema como servidor público'], ['expropiacion', 'Expropiación o afectación de un inmueble'], ['concesiones', 'Concesiones (agua, transporte)'],
      ],
      objetivos: [
        ['obtener_permiso', 'Obtener un permiso o licencia'], ['anular_multa', 'Anular o reducir una multa'], ['reabrir', 'Reabrir su negocio u obra'],
        ['respuesta', 'Que la autoridad le responda'], ['indemnizacion', 'Recibir una indemnización'], ['informacion', 'Obtener información'],
      ],
    }),
    cliente(),
    partes({
      roles: [['particular', 'Particular'], ['empresa', 'Empresa'], ['servidor', 'Servidor público']],
      contraparteEtiqueta: 'Autoridad o dependencia',
      extra: [{ id: 'nivel_gobierno', tipo: 'opcion', etiqueta: 'Nivel de gobierno', opciones: [['federal', 'Federal'], ['estatal', 'Estatal'], ['municipal', 'Municipal']] }],
    }),
    hechos({ intentos: [['solicitud', 'Presentó solicitud'], ['queja', 'Presentó queja'], ['pago', 'Pagó la multa o derechos'], ['recurso', 'Presentó un recurso']] }),
    {
      id: 'acto', titulo: 'El acto de la autoridad',
      campos: [
        { id: 'acto_tipo', tipo: 'opcion', etiqueta: '¿Qué hizo la autoridad?', opciones: [['resolucion', 'Emitió una resolución'], ['multa', 'Impuso una multa'], ['clausura', 'Clausuró o suspendió'], ['negativa', 'Negó un trámite'], ['silencio', 'No respondió'], ['dano', 'Causó un daño'], ['otro', 'Otro']] },
        { id: 'acto_fecha_notificacion', tipo: 'fecha', etiqueta: 'Fecha en que se notificó o se enteró', ayuda: 'Importante para calcular el plazo para impugnar.' },
        { id: 'acto_fundamento', tipo: 'texto', etiqueta: 'Fundamento que cita la autoridad (ley o reglamento)' },
        { id: 'acto_dias_sin_respuesta', tipo: 'numero', etiqueta: 'Días sin respuesta', si: { campo: 'acto_tipo', igual: 'silencio' } },
        { id: 'acto_irregularidad', tipo: 'multi', etiqueta: 'Posibles irregularidades', opciones: [['sin_fundamento', 'Sin fundamento o motivo'], ['sin_notificacion', 'No se notificó bien'], ['incompetente', 'Autoridad sin facultades'], ['sin_audiencia', 'No lo escucharon antes'], ['desproporcion', 'Sanción desproporcionada']] },
      ],
    },
    documentos([
      ...DOCS_BASE, ['resolucion', 'Resolución, multa o acta de clausura'], ['solicitud', 'Solicitud presentada (con sello)'], ['licencia', 'Licencias o permisos anteriores'],
      ['pagos', 'Comprobantes de pago de derechos'], ['planos', 'Planos o proyecto'], ['uso_suelo', 'Constancia de uso de suelo'], ...DOCS_FIN,
    ]),
    procesal({
      situaciones: [['recurso', 'Se presentó recurso administrativo'], ['nulidad', 'Hay juicio de nulidad o contencioso'], ['amparo', 'Hay amparo'], ['queja', 'Hay queja en derechos humanos o contraloría']],
      autoridadEtiqueta: 'Autoridad o tribunal (y ciudad)',
      etapas: [['presentado', 'Presentado'], ['admitido', 'Admitido'], ['suspension', 'Con suspensión'], ['pruebas', 'Pruebas'], ['sentencia', 'Sentencia'], ['cumplimiento', 'Cumplimiento']],
      codigos: [['lfpa', 'Ley Federal de Procedimiento Administrativo'], ['ley_estatal', 'Ley de procedimiento administrativo del estado'], ['reglamento_municipal', 'Reglamento municipal'], ['lfpca', 'Ley Federal de Procedimiento Contencioso Administrativo']],
    }),
    evaluacion({
      especialidad: 'Derecho Administrativo',
      vias: [
        ['gestion', 'Gestión directa ante la dependencia'], ['peticion', 'Escrito de petición'], ['recurso_revision', 'Recurso de revisión o inconformidad'],
        ['nulidad', 'Juicio de nulidad o contencioso administrativo'], ['amparo', 'Amparo'], ['transparencia', 'Solicitud o recurso de transparencia'],
        ['responsabilidad_patrimonial', 'Reclamación de responsabilidad patrimonial'], ['queja_dh', 'Queja ante derechos humanos'], ['contraloria', 'Denuncia ante contraloría'],
      ],
      extra: [{ id: 'suspension', tipo: 'sino', etiqueta: '¿Conviene pedir suspensión del acto?', opciones: SINO_NS }],
    }),
    pasos({
      docs: [...DOCS_BASE, ['resolucion', 'Copia de la resolución o multa'], ['solicitud', 'Acuse de la solicitud'], ['licencia', 'Licencias anteriores'], ['pagos', 'Comprobantes de pago'], ['fotos', 'Fotos']],
      acciones: [['escrito_peticion', 'Redactar escrito de petición'], ['solicitud_info', 'Solicitar información por transparencia'], ['calcular_plazo', 'Calcular plazo para impugnar'], ['otorgar_poder', 'Otorgar poder en el consulado']],
    }),
  ],
}
