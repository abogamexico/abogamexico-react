// Expediente · Derecho Penal (sistema acusatorio, CNPP)
import { SINO_NS, ESTADOS, asunto, cliente, partes, hechos, documentos, procesal, evaluacion, pasos, DOCS_BASE, DOCS_FIN } from './comunes'

export default {
  id: 'penal',
  especialidad: 'Derecho Penal',
  titulo: 'Expediente · Derecho Penal',
  secciones: [
    asunto({
      asuntos: [
        ['victima', 'Fue víctima de un delito'], ['acusado', 'Lo acusan o investigan'], ['detenido', 'Familiar detenido'],
        ['orden', 'Posible orden de aprehensión'], ['citatorio', 'Recibió un citatorio de la Fiscalía'], ['reparacion', 'Reparación del daño'],
        ['amparo', 'Amparo contra un acto penal'], ['antecedentes', 'Antecedentes penales o constancias'], ['ejecucion', 'Persona sentenciada (beneficios, traslado)'],
        ['extradicion', 'Extradición'],
      ],
      objetivos: [
        ['denunciar', 'Denunciar'], ['recuperar', 'Recuperar dinero o bienes'], ['defenderse', 'Defenderse de una acusación'],
        ['libertad', 'Lograr la libertad de un familiar'], ['regresar_mx', 'Saber si puede regresar a México sin problema'],
        ['acuerdo', 'Llegar a un acuerdo con la otra parte'], ['limpiar', 'Limpiar antecedentes o cerrar el caso'],
      ],
    }),
    cliente([
      { id: 'temor_viajar', tipo: 'sino', etiqueta: '¿Teme ser detenido si viaja a México?', opciones: SINO_NS },
    ]),
    partes({
      roles: [['victima', 'Víctima u ofendido'], ['imputado', 'Persona investigada o acusada'], ['familiar_imputado', 'Familiar de la persona acusada'], ['familiar_victima', 'Familiar de la víctima'], ['testigo', 'Testigo']],
      relaciones: [['familiar', 'Familiar'], ['pareja', 'Pareja o ex pareja'], ['conocido', 'Conocido'], ['socio', 'Socio o empleador'], ['autoridad', 'Autoridad'], ['desconocido', 'Desconocido']],
      contraparteEtiqueta: 'Nombre de la otra parte (si se conoce)',
    }),
    hechos({ estadoEtiqueta: 'Estado donde ocurrieron los hechos', intentos: [['denuncia', 'Presentó denuncia'], ['hablar', 'Habló con la otra parte'], ['otro_abogado', 'Contrató otro abogado'], ['pago', 'Hizo algún pago']] }),
    {
      id: 'delito', titulo: 'El delito',
      campos: [
        { id: 'delito_tipo', tipo: 'multi', etiqueta: 'Delito (según el cliente)', opciones: [
          ['fraude', 'Fraude'], ['robo', 'Robo'], ['abuso_confianza', 'Abuso de confianza'], ['despojo', 'Despojo'], ['extorsion', 'Extorsión'],
          ['lesiones', 'Lesiones'], ['homicidio', 'Homicidio'], ['violencia_familiar', 'Violencia familiar'], ['alimentos', 'Incumplimiento de obligación alimentaria'],
          ['amenazas', 'Amenazas'], ['sexual', 'Delito sexual'], ['narcomenudeo', 'Narcomenudeo'], ['armas', 'Armas'], ['falsificacion', 'Falsificación de documentos'],
          ['secuestro', 'Privación de la libertad'], ['transito', 'Hechos de tránsito'], ['otro', 'Otro'],
        ] },
        { id: 'delito_fecha', tipo: 'fecha', etiqueta: 'Fecha de los hechos' },
        { id: 'delito_flagrancia', tipo: 'sino', etiqueta: '¿Hubo detención en el momento (flagrancia)?', opciones: SINO_NS },
        { id: 'delito_oficio', tipo: 'opcion', etiqueta: 'Se persigue…', opciones: [['querella', 'Por querella (requiere denuncia de la víctima)'], ['oficio', 'De oficio'], ['ns', 'Por determinar']] },
      ],
    },
    {
      id: 'victima', titulo: 'Si el cliente es víctima', si: { campo: 'rol', en: ['victima', 'familiar_victima'] },
      campos: [
        { id: 'vic_denuncio', tipo: 'sino', etiqueta: '¿Ya denunció?', opciones: SINO_NS },
        { id: 'vic_carpeta', tipo: 'texto', etiqueta: 'Número de carpeta de investigación y fiscalía', si: { campo: 'vic_denuncio', igual: 'si' } },
        { id: 'vic_dano', tipo: 'dinero', etiqueta: 'Daño económico sufrido' },
        { id: 'vic_riesgo', tipo: 'sino', etiqueta: '¿Corre riesgo actualmente?', opciones: SINO_NS },
        { id: 'vic_asesor', tipo: 'sino', etiqueta: '¿Tiene asesor jurídico de víctimas?', opciones: SINO_NS },
      ],
    },
    {
      id: 'imputado', titulo: 'Si el cliente o su familiar es acusado', si: { campo: 'rol', en: ['imputado', 'familiar_imputado'] },
      campos: [
        { id: 'imp_situacion', tipo: 'opcion', etiqueta: 'Situación', opciones: [['libre', 'En libertad, sin orden'], ['citado', 'Citado a declarar'], ['orden', 'Con orden de aprehensión'], ['detenido', 'Detenido'], ['prision_preventiva', 'En prisión preventiva'], ['sentenciado', 'Sentenciado']] },
        { id: 'imp_lugar', tipo: 'texto', etiqueta: 'Dónde está detenido', si: { campo: 'imp_situacion', igual: 'detenido' } },
        { id: 'imp_fecha_detencion', tipo: 'fecha', etiqueta: 'Fecha de la detención', si: { campo: 'imp_situacion', igual: 'detenido' } },
        { id: 'imp_audiencia_inicial', tipo: 'sino', etiqueta: '¿Ya tuvo audiencia inicial?', opciones: SINO_NS, si: { campo: 'imp_situacion', distinto: 'libre' } },
        { id: 'imp_vinculado', tipo: 'sino', etiqueta: '¿Fue vinculado a proceso?', opciones: SINO_NS, si: { campo: 'imp_audiencia_inicial', igual: 'si' } },
        { id: 'imp_medida', tipo: 'multi', etiqueta: 'Medidas cautelares', opciones: [['prision', 'Prisión preventiva'], ['firma', 'Firma periódica'], ['garantia', 'Garantía económica'], ['localizador', 'Localizador'], ['prohibicion_salir', 'Prohibición de salir del país'], ['ninguna', 'Ninguna']], si: { campo: 'imp_vinculado', igual: 'si' } },
        { id: 'imp_defensor', tipo: 'opcion', etiqueta: 'Defensor actual', opciones: [['publico', 'Defensor público'], ['privado', 'Abogado particular'], ['ninguno', 'Ninguno']] },
      ],
    },
    documentos([
      ...DOCS_BASE, ['denuncia', 'Copia de la denuncia'], ['carpeta', 'Copia de la carpeta de investigación'], ['citatorio', 'Citatorio'],
      ['resoluciones', 'Resoluciones o actas de audiencia'], ['comprobantes', 'Comprobantes del daño (facturas, recibos)'], ['dictamen', 'Dictamen médico o pericial'],
      ['testigos', 'Testigos'], ...DOCS_FIN,
    ]),
    procesal({
      situaciones: [['investigacion', 'Hay una investigación en la Fiscalía'], ['proceso', 'Hay un proceso ante juez'], ['sentencia', 'Ya hay sentencia']],
      autoridadEtiqueta: 'Fiscalía o juzgado (y ciudad)',
      etapas: [['inicial', 'Investigación inicial'], ['complementaria', 'Investigación complementaria'], ['intermedia', 'Etapa intermedia'], ['juicio', 'Juicio oral'], ['sentencia', 'Sentencia'], ['apelacion', 'Apelación'], ['amparo', 'Amparo'], ['ejecucion', 'Ejecución de la pena']],
      codigos: [['cnpp', 'Código Nacional de Procedimientos Penales'], ['codigo_penal_estado', 'Código penal del estado'], ['codigo_penal_federal', 'Código penal federal']],
    }),
    evaluacion({
      especialidad: 'Derecho Penal',
      vias: [
        ['denuncia', 'Presentar denuncia o querella'], ['coadyuvar', 'Coadyuvar con la Fiscalía como víctima'], ['acuerdo_reparatorio', 'Acuerdo reparatorio'],
        ['suspension', 'Suspensión condicional del proceso'], ['abreviado', 'Procedimiento abreviado'], ['defensa_juicio', 'Defensa en juicio oral'],
        ['amparo', 'Amparo (contra orden de aprehensión u otro acto)'], ['cambio_medida', 'Revisión de medida cautelar'], ['apelacion', 'Apelación'],
        ['no_ejercicio', 'Solicitar no ejercicio de la acción penal o archivo'], ['beneficios', 'Beneficios en ejecución de pena'],
      ],
    }),
    pasos({
      docs: [...DOCS_BASE, ['denuncia', 'Copia de la denuncia'], ['carpeta', 'Número y copia de la carpeta'], ['citatorio', 'Citatorio'], ['comprobantes', 'Comprobantes del daño'], ['dictamen', 'Dictamen médico'], ['testigos', 'Datos de testigos']],
      acciones: [['denunciar', 'Acudir a denunciar'], ['consultar_carpeta', 'Consultar la carpeta en la Fiscalía'], ['verificar_orden', 'Verificar si hay orden de aprehensión'], ['amparo', 'Presentar amparo'], ['proteccion_consular', 'Contactar protección consular']],
    }),
  ],
}
