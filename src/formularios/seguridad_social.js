// Expediente · Seguridad Social (IMSS, ISSSTE, Afore, Infonavit)
import { SINO_NS, asunto, cliente, partes, hechos, documentos, procesal, evaluacion, pasos, DOCS_BASE, DOCS_FIN } from './comunes'

export default {
  id: 'seguridad_social',
  especialidad: 'Seguridad Social',
  titulo: 'Expediente · Seguridad Social',
  secciones: [
    asunto({
      asuntos: [
        ['pension_vejez', 'Pensión por vejez o cesantía'], ['modalidad_40', 'Seguir cotizando desde EE.UU. (Modalidad 40)'], ['semanas', 'Revisar o corregir semanas cotizadas'],
        ['afore', 'Retiro de Afore'], ['viudez', 'Pensión de viudez, orfandad o ascendientes'], ['invalidez', 'Invalidez o incapacidad'],
        ['riesgo_trabajo', 'Accidente o enfermedad de trabajo'], ['infonavit_devolucion', 'Devolución del ahorro de vivienda (Infonavit)'],
        ['cobrar_extranjero', 'Cobrar la pensión viviendo en EE.UU.'], ['negativa', 'El IMSS o ISSSTE le negó la pensión'], ['beneficiarios', 'Designar o corregir beneficiarios'],
      ],
      objetivos: [
        ['pensionarse', 'Pensionarse'], ['aumentar_pension', 'Mejorar el monto de su pensión'], ['retirar_ahorro', 'Retirar su ahorro'],
        ['pension_familiar', 'Que su familia reciba la pensión'], ['corregir_datos', 'Corregir sus datos o semanas'],
      ],
    }),
    cliente(),
    partes({
      roles: [['asegurado', 'Asegurado o trabajador'], ['pensionado', 'Pensionado'], ['beneficiario', 'Beneficiario (viuda, hijo, padre)']],
      contraparteEtiqueta: 'Institución (IMSS, ISSSTE, Afore, Infonavit)',
    }),
    hechos({ conMonto: false, intentos: [['acudio', 'Acudió a la clínica o subdelegación'], ['afore', 'Fue a su Afore'], ['solicitud', 'Presentó solicitud de pensión'], ['queja', 'Presentó queja']] }),
    {
      id: 'cotizacion', titulo: 'Historial de cotización',
      campos: [
        { id: 'cot_institucion', tipo: 'opcion', etiqueta: 'Institución', opciones: [['imss', 'IMSS'], ['issste', 'ISSSTE'], ['ambos', 'Ambos']] },
        { id: 'cot_regimen', tipo: 'opcion', etiqueta: 'Régimen', opciones: [['ley73', 'IMSS Ley 73 (cotizó antes del 1 de julio de 1997)'], ['ley97', 'IMSS Ley 97'], ['issste_decimo', 'ISSSTE décimo transitorio'], ['issste_cuentas', 'ISSSTE cuentas individuales'], ['ns', 'Por determinar']] },
        { id: 'cot_nss', tipo: 'texto', etiqueta: 'Número de Seguridad Social (NSS)' },
        { id: 'cot_semanas', tipo: 'numero', etiqueta: 'Semanas cotizadas (aproximado)' },
        { id: 'cot_nacimiento', tipo: 'fecha', etiqueta: 'Fecha de nacimiento del asegurado' },
        { id: 'cot_ultima', tipo: 'fecha', etiqueta: 'Fecha de su última cotización' },
        { id: 'cot_salario', tipo: 'dinero', etiqueta: 'Último salario diario registrado' },
        { id: 'cot_afore', tipo: 'texto', etiqueta: 'Afore donde está' },
        { id: 'cot_errores', tipo: 'multi', etiqueta: 'Problemas en sus datos', opciones: [['nombre', 'Nombre distinto'], ['curp', 'CURP equivocada'], ['dos_nss', 'Tiene dos NSS'], ['semanas_faltan', 'Faltan semanas'], ['fecha_nacimiento', 'Fecha de nacimiento equivocada']] },
      ],
    },
    {
      id: 'viudez', titulo: 'Pensión para beneficiarios', si: { campo: 'asuntos', incluye: 'viudez' },
      campos: [
        { id: 'viu_fallecido', tipo: 'texto', etiqueta: 'Nombre del asegurado fallecido' },
        { id: 'viu_fecha', tipo: 'fecha', etiqueta: 'Fecha de fallecimiento' },
        { id: 'viu_parentesco', tipo: 'opcion', etiqueta: 'Parentesco del cliente', opciones: [['conyuge', 'Cónyuge'], ['concubino', 'Concubino'], ['hijo', 'Hijo'], ['padre', 'Padre o madre']] },
        { id: 'viu_otros', tipo: 'sino', etiqueta: '¿Hay otros posibles beneficiarios (otra pareja, hijos)?', opciones: SINO_NS },
        { id: 'viu_pensionado', tipo: 'sino', etiqueta: '¿El fallecido ya estaba pensionado?', opciones: SINO_NS },
      ],
    },
    {
      id: 'invalidez', titulo: 'Invalidez o riesgo de trabajo', si: { campo: 'asuntos', incluyeAlguno: ['invalidez', 'riesgo_trabajo'] },
      campos: [
        { id: 'inv_origen', tipo: 'opcion', etiqueta: 'Origen', opciones: [['enfermedad_general', 'Enfermedad general'], ['accidente_trabajo', 'Accidente de trabajo'], ['enfermedad_trabajo', 'Enfermedad de trabajo'], ['trayecto', 'Accidente en el trayecto']] },
        { id: 'inv_fecha', tipo: 'fecha', etiqueta: 'Fecha del accidente o diagnóstico' },
        { id: 'inv_dictamen', tipo: 'sino', etiqueta: '¿Tiene dictamen del IMSS o ISSSTE?', opciones: SINO_NS },
        { id: 'inv_porcentaje', tipo: 'texto', etiqueta: 'Porcentaje de incapacidad dictaminado', si: { campo: 'inv_dictamen', igual: 'si' } },
      ],
    },
    {
      id: 'extranjero', titulo: 'Desde EE.UU.', si: { campo: 'asuntos', incluyeAlguno: ['modalidad_40', 'cobrar_extranjero'] },
      campos: [
        { id: 'ext_quiere', tipo: 'opcion', etiqueta: 'Necesita', opciones: [['inscribirse_m40', 'Inscribirse a Modalidad 40'], ['pagar_m40', 'Pagar Modalidad 40 desde EE.UU.'], ['cobrar', 'Recibir la pensión en EE.UU.'], ['supervivencia', 'Comprobar supervivencia (fe de vida)']] },
        { id: 'ext_cuenta_mx', tipo: 'sino', etiqueta: '¿Tiene cuenta bancaria en México?', opciones: SINO_NS },
        { id: 'ext_baja', tipo: 'fecha', etiqueta: 'Fecha de su baja del IMSS', si: { campo: 'ext_quiere', igual: 'inscribirse_m40' } },
      ],
    },
    documentos([
      ...DOCS_BASE, ['nss', 'Constancia de NSS'], ['semanas', 'Reporte de semanas cotizadas'], ['estado_afore', 'Estado de cuenta de la Afore'],
      ['acta_matrimonio', 'Acta de matrimonio'], ['acta_defuncion', 'Acta de defunción'], ['dictamen', 'Dictamen médico'], ['resolucion', 'Resolución o negativa'],
      ['constancia_laboral', 'Constancias laborales o recibos de nómina'], ...DOCS_FIN,
    ]),
    procesal({
      situaciones: [['solicitud', 'Hay una solicitud en trámite'], ['inconformidad', 'Se presentó recurso de inconformidad'], ['juicio', 'Hay demanda ante el tribunal laboral'], ['amparo', 'Hay amparo']],
      autoridadEtiqueta: 'Subdelegación, Afore o tribunal (y ciudad)',
      etapas: [['solicitud', 'Solicitud'], ['resolucion', 'Resolución'], ['recurso', 'Recurso'], ['demanda', 'Demanda'], ['audiencia', 'Audiencia'], ['laudo', 'Sentencia'], ['ejecucion', 'Ejecución']],
      codigos: [['lss73', 'Ley del Seguro Social de 1973'], ['lss97', 'Ley del Seguro Social de 1997'], ['lissste', 'Ley del ISSSTE'], ['lsar', 'Ley de los Sistemas de Ahorro para el Retiro'], ['lft', 'Ley Federal del Trabajo (proceso)']],
    }),
    evaluacion({
      especialidad: 'Seguridad Social',
      vias: [
        ['solicitud', 'Solicitud de pensión'], ['modalidad_40', 'Continuación voluntaria (Modalidad 40)'], ['correccion', 'Corrección de datos o unificación de NSS'],
        ['retiro_afore', 'Retiro de recursos de la Afore'], ['devolucion_infonavit', 'Devolución de subcuenta de vivienda'], ['inconformidad', 'Recurso de inconformidad'],
        ['demanda', 'Demanda ante el tribunal laboral'], ['amparo', 'Amparo'], ['queja_consar', 'Queja ante CONSAR o CONDUSEF'],
      ],
      extra: [{ id: 'monto_estimado', tipo: 'dinero', etiqueta: 'Pensión mensual estimada' }],
    }),
    pasos({
      docs: [...DOCS_BASE, ['nss', 'Número de Seguridad Social'], ['semanas', 'Reporte de semanas cotizadas'], ['estado_afore', 'Estado de cuenta de Afore'], ['acta_matrimonio', 'Acta de matrimonio'], ['acta_defuncion', 'Acta de defunción'], ['resolucion', 'Resolución o negativa']],
      acciones: [['pedir_semanas', 'Pedir reporte de semanas (IMSS Digital)'], ['unificar', 'Unificar NSS o corregir datos'], ['inscribir_m40', 'Inscribirse a Modalidad 40'], ['cita_afore', 'Cita en la Afore'], ['otorgar_poder', 'Otorgar poder en el consulado']],
    }),
  ],
}
