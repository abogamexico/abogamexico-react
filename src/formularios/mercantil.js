// Expediente · Derecho Mercantil
import { SINO_NS, asunto, cliente, partes, hechos, documentos, procesal, evaluacion, pasos, DOCS_BASE, DOCS_FIN } from './comunes'

export default {
  id: 'mercantil',
  especialidad: 'Derecho Mercantil',
  titulo: 'Expediente · Derecho Mercantil',
  secciones: [
    asunto({
      asuntos: [
        ['constituir', 'Abrir una empresa en México'], ['socios', 'Conflicto entre socios'], ['cobranza', 'Cobrar pagarés, cheques o facturas'],
        ['demandado', 'Lo demandan por un pagaré o crédito'], ['contratos', 'Contratos comerciales (distribución, suministro, comisión)'],
        ['marca', 'Registro o defensa de marca (IMPI)'], ['franquicia', 'Franquicia'], ['concurso', 'Empresa con deudas (concurso mercantil)'],
        ['banco', 'Problema con un banco o tarjeta'], ['invertir', 'Invertir o mandar dinero a un negocio en México'], ['cerrar', 'Cerrar o vender una empresa'],
      ],
      objetivos: [
        ['emprender', 'Abrir su negocio formal'], ['cobrar', 'Cobrar lo que le deben'], ['defenderse', 'Defenderse de un cobro'],
        ['proteger_marca', 'Proteger su marca'], ['salir_sociedad', 'Salir de una sociedad'], ['proteger_inversion', 'Proteger su inversión'],
      ],
    }),
    cliente(),
    partes({
      roles: [['acreedor', 'Acreedor'], ['deudor', 'Deudor'], ['socio', 'Socio o accionista'], ['empresa', 'Representante de la empresa'], ['titular_marca', 'Titular de la marca'], ['emprendedor', 'Emprendedor']],
      relaciones: [['socio', 'Socio'], ['cliente', 'Cliente'], ['proveedor', 'Proveedor'], ['banco', 'Banco o financiera'], ['competidor', 'Competidor'], ['otro', 'Otra']],
      contraparteEtiqueta: 'Nombre o razón social de la otra parte',
    }),
    hechos({ intentos: [['requerimiento', 'Requerimiento de pago'], ['negociacion', 'Negociación'], ['condusef', 'Queja en CONDUSEF'], ['profeco', 'Queja en PROFECO']] }),
    {
      id: 'empresa', titulo: 'La empresa', si: { campo: 'asuntos', incluyeAlguno: ['constituir', 'socios', 'concurso', 'cerrar', 'invertir'] },
      campos: [
        { id: 'emp_tipo', tipo: 'opcion', etiqueta: 'Tipo de sociedad', opciones: [['sa_cv', 'S.A. de C.V.'], ['sapi', 'S.A.P.I.'], ['srl', 'S. de R.L.'], ['sas', 'S.A.S. (por internet)'], ['persona_fisica', 'Persona física con actividad empresarial'], ['por_definir', 'Por definir']] },
        { id: 'emp_giro', tipo: 'texto', etiqueta: 'Giro o actividad' },
        { id: 'emp_socios', tipo: 'numero', etiqueta: 'Número de socios' },
        { id: 'emp_participacion', tipo: 'texto', etiqueta: 'Participación del cliente (%)' },
        { id: 'emp_administra', tipo: 'texto', etiqueta: '¿Quién administra hoy?' },
        { id: 'emp_libros', tipo: 'sino', etiqueta: '¿Tiene libros de actas y de socios al día?', opciones: SINO_NS },
        { id: 'emp_rfc', tipo: 'sino', etiqueta: '¿Está inscrita en el SAT?', opciones: SINO_NS },
      ],
    },
    {
      id: 'cobranza', titulo: 'Cobranza o deuda mercantil', si: { campo: 'asuntos', incluyeAlguno: ['cobranza', 'demandado', 'banco'] },
      campos: [
        { id: 'cob_titulo', tipo: 'multi', etiqueta: 'Documento', opciones: [['pagare', 'Pagaré'], ['cheque', 'Cheque'], ['letra', 'Letra de cambio'], ['factura', 'Factura'], ['contrato_credito', 'Contrato de crédito'], ['tarjeta', 'Tarjeta de crédito'], ['estado_cuenta', 'Estado de cuenta']] },
        { id: 'cob_monto', tipo: 'dinero', etiqueta: 'Monto principal' },
        { id: 'cob_vencimiento', tipo: 'fecha', etiqueta: 'Fecha de vencimiento' },
        { id: 'cob_intereses', tipo: 'texto', etiqueta: 'Intereses pactados' },
        { id: 'cob_firmas', tipo: 'sino', etiqueta: '¿Las firmas son auténticas y legibles?', opciones: SINO_NS },
        { id: 'cob_aval', tipo: 'sino', etiqueta: '¿Hay aval?', opciones: SINO_NS },
        { id: 'cob_embargo', tipo: 'sino', etiqueta: '¿Ya hubo embargo?', opciones: SINO_NS },
      ],
    },
    {
      id: 'marca', titulo: 'Marca', si: { campo: 'asuntos', incluyeAlguno: ['marca', 'franquicia'] },
      campos: [
        { id: 'mar_nombre', tipo: 'texto', etiqueta: 'Nombre de la marca' },
        { id: 'mar_productos', tipo: 'texto', etiqueta: 'Productos o servicios que ampara' },
        { id: 'mar_estado', tipo: 'opcion', etiqueta: 'Situación', opciones: [['sin_registro', 'Sin registrar'], ['en_tramite', 'En trámite'], ['registrada', 'Registrada en México'], ['solo_eeuu', 'Registrada solo en EE.UU.'], ['copia', 'Alguien la está copiando']] },
        { id: 'mar_uso', tipo: 'fecha', etiqueta: 'Desde cuándo la usa' },
      ],
    },
    documentos([
      ...DOCS_BASE, ['acta_constitutiva', 'Acta constitutiva'], ['actas_asamblea', 'Actas de asamblea'], ['poder', 'Poder del representante'],
      ['rfc', 'Constancia de situación fiscal'], ['pagare', 'Pagaré, cheque o letra (original)'], ['facturas', 'Facturas'], ['contrato', 'Contrato'],
      ['estado_cuenta', 'Estados de cuenta'], ['marca', 'Título o solicitud de marca'], ...DOCS_FIN,
    ]),
    procesal({
      situaciones: [['si_actor', 'El cliente demandó'], ['si_demandado', 'Al cliente lo demandaron'], ['impi', 'Hay un trámite en el IMPI'], ['condusef', 'Hay una queja en CONDUSEF'], ['concurso', 'Hay concurso mercantil']],
      etapas: [['demanda', 'Demanda'], ['emplazamiento', 'Emplazamiento y embargo'], ['contestacion', 'Contestación'], ['pruebas', 'Pruebas'], ['sentencia', 'Sentencia'], ['apelacion', 'Apelación'], ['amparo', 'Amparo'], ['remate', 'Remate']],
      codigos: [['codigo_comercio', 'Código de Comercio'], ['lgsm', 'Ley General de Sociedades Mercantiles'], ['lgtoc', 'Ley General de Títulos y Operaciones de Crédito'], ['lfppi', 'Ley Federal de Protección a la Propiedad Industrial']],
    }),
    evaluacion({
      especialidad: 'Derecho Mercantil',
      vias: [
        ['constitucion', 'Constitución ante notario o en línea (S.A.S.)'], ['negociacion', 'Negociación o reestructura de deuda'],
        ['ejecutivo', 'Juicio ejecutivo mercantil'], ['oral', 'Juicio oral mercantil'], ['ordinario', 'Juicio ordinario mercantil'],
        ['defensa', 'Contestación y excepciones'], ['asamblea', 'Convocar asamblea de socios'], ['registro_marca', 'Solicitud de registro de marca'],
        ['infraccion', 'Declaración de infracción ante el IMPI'], ['condusef', 'Reclamación ante CONDUSEF'], ['concurso', 'Concurso mercantil'], ['amparo', 'Amparo'],
      ],
    }),
    pasos({
      docs: [...DOCS_BASE, ['acta_constitutiva', 'Acta constitutiva'], ['actas_asamblea', 'Actas de asamblea'], ['rfc', 'Constancia de situación fiscal'], ['pagare', 'Copia del pagaré o título'], ['contrato', 'Contrato'], ['estado_cuenta', 'Estados de cuenta']],
      acciones: [['busqueda_marca', 'Búsqueda fonética de la marca'], ['requerimiento', 'Enviar requerimiento de pago'], ['convocar_asamblea', 'Convocar asamblea'], ['revisar_libros', 'Revisar libros corporativos'], ['otorgar_poder', 'Otorgar poder en el consulado']],
    }),
  ],
}
