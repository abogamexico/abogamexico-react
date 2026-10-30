// Expediente · Derecho Migratorio
// Abogados mexicanos: nacionalidad, documentos, consulados, residencia en México
// y retorno. Los trámites ante USCIS o cortes de inmigración de EE.UU. se orientan
// y se canalizan a un abogado con licencia en EE.UU.
import { SINO_NS, ESTADOS, asunto, cliente, partes, hechos, documentos, procesal, evaluacion, pasos, DOCS_BASE, DOCS_FIN } from './comunes'

export default {
  id: 'migratorio',
  especialidad: 'Derecho Migratorio',
  titulo: 'Expediente · Derecho Migratorio',
  secciones: [
    asunto({
      asuntos: [
        ['nacionalidad_hijos', 'Nacionalidad mexicana de hijos nacidos en el extranjero'], ['doble_nacionalidad', 'Doble nacionalidad'],
        ['naturalizacion', 'Naturalización mexicana de un extranjero'], ['documentos_identidad', 'Pasaporte, matrícula, CURP o INE desde el extranjero'],
        ['actas', 'Actas mexicanas (obtener, inscribir o corregir)'], ['residencia_mx', 'Residencia en México para un familiar extranjero'],
        ['retorno', 'Regreso a México (voluntario o por deportación)'], ['apostilla', 'Apostilla y legalización de documentos'],
        ['menores_viaje', 'Viaje o documentos de menores entre países'], ['estatus_eeuu', 'Situación migratoria en EE.UU. (orientación y canalización)'],
        ['detencion_eeuu', 'Familiar detenido por migración en EE.UU.'],
      ],
      objetivos: [
        ['documento', 'Obtener un documento de identidad'], ['nacionalidad', 'Que sus hijos tengan nacionalidad mexicana'],
        ['residencia', 'Que su familiar viva legalmente en México'], ['regresar', 'Regresar y establecerse en México'],
        ['validar_documentos', 'Que sus documentos sirvan en otro país'], ['estatus', 'Saber sus opciones migratorias en EE.UU.'],
      ],
    }),
    cliente([
      { id: 'estatus_cliente', tipo: 'opcion', etiqueta: 'Situación en el país donde vive (si la comparte)', opciones: [['ciudadano', 'Ciudadano'], ['residente', 'Residente permanente'], ['visa', 'Con visa vigente'], ['daca_tps', 'DACA o TPS'], ['proceso', 'En proceso o en corte'], ['sin_documentos', 'Sin documentos'], ['prefiere_no', 'Prefiere no decir']] },
      { id: 'consulado', tipo: 'texto', etiqueta: 'Consulado mexicano más cercano' },
    ]),
    partes({
      roles: [['titular', 'Titular del trámite'], ['padre_madre', 'Padre o madre del interesado'], ['familiar', 'Familiar del interesado']],
      contraparteEtiqueta: 'Persona para quien es el trámite (si no es el cliente)',
      relaciones: [['hijo', 'Hijo o hija'], ['conyuge', 'Cónyuge'], ['padre_madre', 'Padre o madre'], ['hermano', 'Hermano'], ['otro', 'Otra']],
    }),
    hechos({ estadoEtiqueta: 'Estado de origen en México', conMonto: false }),
    {
      id: 'nacionalidad', titulo: 'Nacionalidad de hijos nacidos fuera de México', si: { campo: 'asuntos', incluyeAlguno: ['nacionalidad_hijos', 'doble_nacionalidad'] },
      campos: [
        { id: 'nac_hijos', tipo: 'numero', etiqueta: 'Número de hijos' },
        { id: 'nac_lugar', tipo: 'texto', etiqueta: 'Estado y ciudad de nacimiento (EE.UU. u otro país)' },
        { id: 'nac_padres', tipo: 'opcion', etiqueta: '¿Quién es mexicano?', opciones: [['madre', 'La madre'], ['padre', 'El padre'], ['ambos', 'Ambos']] },
        { id: 'nac_acta_mx_padre', tipo: 'sino', etiqueta: '¿El padre o madre mexicano tiene su acta de nacimiento mexicana?', opciones: SINO_NS },
        { id: 'nac_acta_hijo_apostilla', tipo: 'sino', etiqueta: '¿El acta del hijo está apostillada?', opciones: SINO_NS },
        { id: 'nac_registrado', tipo: 'sino', etiqueta: '¿Ya se registró en un consulado o Registro Civil mexicano?', opciones: SINO_NS },
        { id: 'nac_via', tipo: 'opcion', etiqueta: 'Dónde se haría', opciones: [['consulado', 'Consulado de México'], ['registro_civil', 'Registro Civil en México'], ['por_definir', 'Por definir']] },
      ],
    },
    {
      id: 'naturalizacion', titulo: 'Naturalización', si: { campo: 'asuntos', incluye: 'naturalizacion' },
      campos: [
        { id: 'nat_nacionalidad', tipo: 'texto', etiqueta: 'Nacionalidad actual del interesado' },
        { id: 'nat_vinculo', tipo: 'opcion', etiqueta: 'Vínculo con México', opciones: [['conyuge', 'Casado con mexicano'], ['hijos', 'Tiene hijos mexicanos'], ['residencia', 'Residencia en México por años'], ['latino', 'Nacional latinoamericano o ibérico'], ['otro', 'Otro']] },
        { id: 'nat_residencia_anos', tipo: 'numero', etiqueta: 'Años de residencia en México' },
      ],
    },
    {
      id: 'documentos_identidad', titulo: 'Documentos de identidad', si: { campo: 'asuntos', incluyeAlguno: ['documentos_identidad', 'actas'] },
      campos: [
        { id: 'doc_necesita', tipo: 'multi', etiqueta: 'Necesita', opciones: [['pasaporte', 'Pasaporte'], ['matricula', 'Matrícula consular'], ['ine_extranjero', 'INE desde el extranjero'], ['curp', 'CURP'], ['acta', 'Acta de nacimiento mexicana'], ['correccion_acta', 'Corregir un acta']] },
        { id: 'doc_obstaculo', tipo: 'multi', etiqueta: 'Obstáculo', opciones: [['sin_acta', 'No tiene acta'], ['errores', 'Errores en datos'], ['nombres_distintos', 'Nombres distintos entre documentos'], ['doble_registro', 'Doble registro'], ['sin_identificacion', 'No tiene ninguna identificación'], ['negativa', 'El consulado se lo negó']] },
        { id: 'doc_estado_registro', tipo: 'opcion', etiqueta: 'Estado donde fue registrado', opciones: ESTADOS },
      ],
    },
    {
      id: 'residencia_mx', titulo: 'Residencia en México para un extranjero', si: { campo: 'asuntos', incluye: 'residencia_mx' },
      campos: [
        { id: 'res_nacionalidad', tipo: 'texto', etiqueta: 'Nacionalidad del extranjero' },
        { id: 'res_vinculo', tipo: 'opcion', etiqueta: 'Vínculo con el mexicano', opciones: [['conyuge', 'Cónyuge'], ['concubino', 'Concubino'], ['hijo', 'Hijo'], ['padre', 'Padre o madre'], ['otro', 'Otro']] },
        { id: 'res_tipo', tipo: 'opcion', etiqueta: 'Residencia que busca', opciones: [['temporal', 'Residencia temporal'], ['permanente', 'Residencia permanente'], ['regularizacion', 'Regularización (ya está en México sin documentos)'], ['ns', 'No sabe']] },
        { id: 'res_ubicacion', tipo: 'opcion', etiqueta: '¿Dónde está hoy el extranjero?', opciones: [['mexico', 'En México'], ['eeuu', 'En EE.UU.'], ['otro', 'Otro país']] },
      ],
    },
    {
      id: 'retorno', titulo: 'Regreso a México', si: { campo: 'asuntos', incluye: 'retorno' },
      campos: [
        { id: 'ret_tipo', tipo: 'opcion', etiqueta: 'Tipo de regreso', opciones: [['planeado', 'Planea regresar'], ['voluntario', 'Ya regresó por su cuenta'], ['deportado', 'Fue deportado']] },
        { id: 'ret_fecha', tipo: 'fecha', etiqueta: 'Fecha de regreso (o planeada)' },
        { id: 'ret_familia', tipo: 'sino', etiqueta: '¿Regresa con hijos nacidos en EE.UU.?', opciones: SINO_NS },
        { id: 'ret_necesita', tipo: 'multi', etiqueta: 'Necesita', opciones: [['identificacion', 'Identificación mexicana'], ['curp', 'CURP'], ['escuela', 'Inscribir a hijos en escuela (revalidación)'], ['salud', 'Servicios de salud'], ['menaje', 'Traer su menaje o vehículo'], ['dinero', 'Recuperar dinero o bienes en EE.UU.']] },
      ],
    },
    {
      id: 'apostilla', titulo: 'Apostilla y legalización', si: { campo: 'asuntos', incluye: 'apostilla' },
      campos: [
        { id: 'apo_documento', tipo: 'texto', etiqueta: 'Documento a apostillar o legalizar' },
        { id: 'apo_emisor', tipo: 'opcion', etiqueta: 'País que lo emitió', opciones: [['mexico', 'México'], ['eeuu', 'Estados Unidos'], ['otro', 'Otro']] },
        { id: 'apo_uso', tipo: 'texto', etiqueta: '¿Para qué trámite lo necesita?' },
        { id: 'apo_traduccion', tipo: 'sino', etiqueta: '¿Requiere traducción por perito?', opciones: SINO_NS },
      ],
    },
    {
      id: 'eeuu', titulo: 'Situación en EE.UU. (solo orientación)', si: { campo: 'asuntos', incluyeAlguno: ['estatus_eeuu', 'detencion_eeuu'] },
      campos: [
        { id: 'us_proceso', tipo: 'opcion', etiqueta: '¿Tiene un proceso abierto?', opciones: [['ninguno', 'Ninguno'], ['uscis', 'Trámite ante USCIS'], ['corte', 'Caso en corte de inmigración'], ['detenido', 'Está detenido'], ['orden', 'Tiene orden de deportación']] },
        { id: 'us_audiencia', tipo: 'fecha', etiqueta: 'Fecha de su próxima audiencia', si: { campo: 'us_proceso', igual: 'corte' } },
        { id: 'us_centro', tipo: 'texto', etiqueta: 'Centro de detención y número A', si: { campo: 'us_proceso', igual: 'detenido' } },
        { id: 'us_abogado', tipo: 'sino', etiqueta: '¿Tiene abogado de inmigración en EE.UU.?', opciones: SINO_NS },
        { id: 'us_proteccion', tipo: 'sino', etiqueta: '¿Ya contactó a la protección consular mexicana?', opciones: SINO_NS },
      ],
    },
    documentos([
      ...DOCS_BASE, ['pasaporte', 'Pasaporte'], ['matricula', 'Matrícula consular'], ['acta_eeuu', 'Acta de nacimiento de EE.UU.'],
      ['apostilla', 'Documentos apostillados'], ['acta_matrimonio', 'Acta de matrimonio'], ['documentos_migratorios', 'Documentos migratorios (visa, permiso, tarjeta)'],
      ['constancia_deportacion', 'Constancia de repatriación o deportación'], ...DOCS_FIN,
    ]),
    procesal({
      situaciones: [['consulado', 'Hay un trámite en el consulado'], ['inm', 'Hay un trámite ante el INM'], ['sre', 'Hay un trámite ante la SRE'], ['registro_civil', 'Hay un trámite en el Registro Civil'], ['eeuu', 'Hay un caso en EE.UU.']],
      autoridadEtiqueta: 'Oficina o consulado (y ciudad)',
      codigos: [['ley_nacionalidad', 'Ley de Nacionalidad'], ['ley_migracion', 'Ley de Migración'], ['codigo_civil', 'Código civil del estado (actas)']],
    }),
    evaluacion({
      especialidad: 'Derecho Migratorio',
      vias: [
        ['consulado', 'Trámite en el consulado'], ['registro_civil', 'Trámite en el Registro Civil'], ['sre', 'Trámite ante la SRE'],
        ['inm', 'Trámite ante el INM'], ['rectificacion', 'Aclaración o juicio de rectificación de acta'], ['apostilla', 'Apostilla o legalización'],
        ['amparo', 'Amparo contra una negativa'], ['abogado_eeuu', 'Canalizar a abogado de inmigración en EE.UU.'], ['proteccion_consular', 'Protección consular'],
      ],
    }),
    pasos({
      docs: [...DOCS_BASE, ['acta_eeuu', 'Acta de EE.UU. apostillada'], ['acta_padres', 'Actas mexicanas de los padres'], ['pasaporte', 'Pasaporte'], ['acta_matrimonio', 'Acta de matrimonio'], ['fotos_infantil', 'Fotografías tamaño infantil'], ['traduccion', 'Traducción por perito']],
      acciones: [['cita_consulado', 'Sacar cita en el consulado (MiConsulado)'], ['apostillar', 'Apostillar documentos'], ['traducir', 'Traducir documentos'], ['canalizar_eeuu', 'Contactar abogado de inmigración en EE.UU.'], ['proteccion_consular', 'Llamar a protección consular']],
    }),
  ],
}
