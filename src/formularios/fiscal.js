// Expediente · Derecho Fiscal
import { SINO_NS, asunto, cliente, partes, hechos, documentos, procesal, evaluacion, pasos, DOCS_BASE, DOCS_FIN } from './comunes'

export default {
  id: 'fiscal',
  especialidad: 'Derecho Fiscal',
  titulo: 'Expediente · Derecho Fiscal',
  secciones: [
    asunto({
      asuntos: [
        ['rfc', 'RFC, e.firma o contraseña del SAT desde el extranjero'], ['declaraciones', 'Declaraciones atrasadas u omitidas'],
        ['venta_inmueble', 'ISR por vender una casa o terreno'], ['herencia_donacion', 'Impuestos por herencia o donación'],
        ['requerimiento', 'Carta invitación o requerimiento del SAT'], ['credito_fiscal', 'Crédito fiscal o multa'], ['embargo', 'Embargo o cuentas congeladas por el SAT'],
        ['auditoria', 'Revisión o auditoría'], ['devolucion', 'Devolución de saldo a favor'], ['residencia_fiscal', 'Residencia fiscal en México o EE.UU. (doble tributación)'],
        ['regimen', 'Elegir régimen o facturar (CFDI)'], ['locales', 'Predial, tenencia u otro impuesto local'],
      ],
      objetivos: [
        ['regularizar', 'Ponerse al corriente con el SAT'], ['pagar_menos', 'Pagar solo lo correcto'], ['quitar_embargo', 'Liberar cuentas o bienes'],
        ['impugnar', 'Impugnar una multa o crédito'], ['recuperar', 'Recuperar un saldo a favor'], ['vender_bien', 'Vender sin sorpresas de impuestos'],
      ],
    }),
    cliente([
      { id: 'residencia_fiscal_actual', tipo: 'opcion', etiqueta: '¿Dónde paga impuestos hoy?', opciones: [['mexico', 'Solo México'], ['eeuu', 'Solo EE.UU.'], ['ambos', 'En ambos'], ['ninguno', 'En ninguno'], ['ns', 'No sabe']] },
    ]),
    partes({
      roles: [['contribuyente', 'Contribuyente'], ['representante', 'Representante de una empresa'], ['heredero', 'Heredero o vendedor']],
      contraparteEtiqueta: 'Autoridad (SAT, tesorería estatal o municipal)',
    }),
    hechos({ intentos: [['sat_cita', 'Sacó cita en el SAT'], ['contador', 'Habló con un contador'], ['pago', 'Hizo algún pago'], ['prodecon', 'Fue a PRODECON']] }),
    {
      id: 'sat', titulo: 'Situación ante el SAT',
      campos: [
        { id: 'sat_rfc', tipo: 'opcion', etiqueta: 'RFC', opciones: [['activo', 'Activo'], ['suspendido', 'Suspendido'], ['no_tiene', 'No tiene'], ['ns', 'No sabe']] },
        { id: 'sat_efirma', tipo: 'opcion', etiqueta: 'e.firma', opciones: [['vigente', 'Vigente'], ['vencida', 'Vencida'], ['no_tiene', 'No tiene']] },
        { id: 'sat_regimen', tipo: 'opcion', etiqueta: 'Régimen', opciones: [['sueldos', 'Sueldos y salarios'], ['resico', 'RESICO'], ['empresarial', 'Actividad empresarial'], ['arrendamiento', 'Arrendamiento'], ['sin_obligaciones', 'Sin obligaciones'], ['ns', 'No sabe']] },
        { id: 'sat_opinion', tipo: 'opcion', etiqueta: 'Opinión de cumplimiento', opciones: [['positiva', 'Positiva'], ['negativa', 'Negativa'], ['ns', 'No sabe']] },
        { id: 'sat_buzon', tipo: 'sino', etiqueta: '¿Revisa su buzón tributario?', opciones: SINO_NS },
      ],
    },
    {
      id: 'requerimiento', titulo: 'Requerimiento, crédito o embargo', si: { campo: 'asuntos', incluyeAlguno: ['requerimiento', 'credito_fiscal', 'embargo', 'auditoria'] },
      campos: [
        { id: 'req_documento', tipo: 'opcion', etiqueta: 'Documento recibido', opciones: [['carta_invitacion', 'Carta invitación'], ['requerimiento', 'Requerimiento de obligaciones'], ['multa', 'Multa'], ['determinacion', 'Resolución que determina un crédito'], ['embargo', 'Acta de embargo'], ['auditoria', 'Orden de visita o revisión']] },
        { id: 'req_fecha_notificacion', tipo: 'fecha', etiqueta: 'Fecha de notificación', ayuda: 'Importante para calcular plazos de defensa.' },
        { id: 'req_monto', tipo: 'dinero', etiqueta: 'Monto determinado' },
        { id: 'req_ejercicio', tipo: 'texto', etiqueta: 'Ejercicios o periodos revisados' },
        { id: 'req_cuentas', tipo: 'sino', etiqueta: '¿Le inmovilizaron cuentas?', opciones: SINO_NS },
      ],
    },
    {
      id: 'venta', titulo: 'Venta, herencia o donación', si: { campo: 'asuntos', incluyeAlguno: ['venta_inmueble', 'herencia_donacion'] },
      campos: [
        { id: 'ven_operacion', tipo: 'opcion', etiqueta: 'Operación', opciones: [['venta', 'Venta'], ['herencia', 'Herencia'], ['donacion', 'Donación']] },
        { id: 'ven_precio', tipo: 'dinero', etiqueta: 'Precio o valor' },
        { id: 'ven_adquisicion', tipo: 'texto', etiqueta: 'Cómo y cuándo se adquirió el bien' },
        { id: 'ven_casa_habitacion', tipo: 'sino', etiqueta: '¿Era su casa habitación?', opciones: SINO_NS },
        { id: 'ven_residente_extranjero', tipo: 'sino', etiqueta: '¿El vendedor es residente en el extranjero para efectos fiscales?', opciones: SINO_NS },
        { id: 'ven_parentesco', tipo: 'texto', etiqueta: 'Parentesco entre las partes (donación)', si: { campo: 'ven_operacion', igual: 'donacion' } },
      ],
    },
    documentos([
      ...DOCS_BASE, ['constancia_fiscal', 'Constancia de situación fiscal'], ['efirma', 'Archivos de e.firma'], ['declaraciones', 'Declaraciones presentadas'],
      ['documento_sat', 'Requerimiento o resolución del SAT'], ['cfdi', 'Facturas (CFDI)'], ['estados_cuenta', 'Estados de cuenta bancarios'],
      ['escritura', 'Escritura del bien vendido o heredado'], ['impuestos_eeuu', 'Declaraciones de impuestos en EE.UU.'], ...DOCS_FIN,
    ]),
    procesal({
      situaciones: [['sat', 'Hay un procedimiento con el SAT'], ['revocacion', 'Se presentó recurso de revocación'], ['nulidad', 'Hay juicio de nulidad (TFJA)'], ['prodecon', 'Hay queja o acuerdo en PRODECON'], ['amparo', 'Hay amparo']],
      autoridadEtiqueta: 'Autoridad o tribunal (y ciudad)',
      etapas: [['requerimiento', 'Requerimiento'], ['revision', 'Revisión o auditoría'], ['resolucion', 'Resolución'], ['recurso', 'Recurso en trámite'], ['juicio', 'Juicio en trámite'], ['sentencia', 'Sentencia'], ['cobro', 'Cobro coactivo']],
      codigos: [['cff', 'Código Fiscal de la Federación'], ['lisr', 'Ley del ISR'], ['liva', 'Ley del IVA'], ['tratado', 'Tratado México–EE.UU. para evitar la doble tributación'], ['local', 'Ley de hacienda del estado o municipio']],
    }),
    evaluacion({
      especialidad: 'Derecho Fiscal',
      vias: [
        ['regularizacion', 'Regularización voluntaria'], ['aclaracion', 'Aclaración ante el SAT'], ['autocorreccion', 'Autocorrección'],
        ['convenio_pagos', 'Pago en parcialidades'], ['acuerdo_conclusivo', 'Acuerdo conclusivo en PRODECON'], ['queja_prodecon', 'Queja en PRODECON'],
        ['revocacion', 'Recurso de revocación'], ['nulidad', 'Juicio de nulidad ante el TFJA'], ['amparo', 'Amparo'],
        ['devolucion', 'Solicitud de devolución'], ['planeacion', 'Planeación de la operación (venta o herencia)'],
      ],
    }),
    pasos({
      docs: [...DOCS_BASE, ['constancia_fiscal', 'Constancia de situación fiscal'], ['documento_sat', 'Copia del documento del SAT'], ['declaraciones', 'Declaraciones anteriores'], ['estados_cuenta', 'Estados de cuenta'], ['escritura', 'Escritura del bien'], ['impuestos_eeuu', 'Declaraciones de EE.UU.']],
      acciones: [['cita_sat', 'Sacar cita en el SAT'], ['renovar_efirma', 'Renovar e.firma (en consulado o SAT)'], ['revisar_buzon', 'Revisar buzón tributario'], ['contador', 'Coordinar con su contador'], ['prodecon', 'Acudir a PRODECON']],
    }),
  ],
}
