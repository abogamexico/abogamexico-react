// Expediente · Derecho Familiar
import { SINO_NS, ESTADOS, asunto, cliente, partes, hechos, documentos, procesal, evaluacion, pasos, DOCS_BASE, DOCS_FIN } from './comunes'

const HIJOS_VIVEN = [['cliente', 'Con el cliente'], ['otro_padre', 'Con el otro padre o madre'], ['familiar', 'Con un familiar'], ['ambos', 'Con ambos (alternado)'], ['otro', 'Otro']]

export default {
  id: 'familiar',
  especialidad: 'Derecho Familiar',
  titulo: 'Expediente · Derecho Familiar',
  secciones: [
    asunto({
      asuntos: [
        ['divorcio', 'Divorcio'], ['pension', 'Pensión alimenticia'], ['custodia', 'Guarda y custodia de hijos'],
        ['convivencia', 'Convivencias (visitas)'], ['patria_potestad', 'Patria potestad'], ['sustraccion', 'Traslado o retención ilícita de menores entre países'],
        ['paternidad', 'Reconocimiento o desconocimiento de paternidad'], ['adopcion', 'Adopción'], ['violencia', 'Violencia familiar'],
        ['bienes', 'Bienes del matrimonio (sociedad conyugal)'], ['concubinato', 'Concubinato'], ['sentencia_extranjera', 'Divorcio o custodia dictados en EE.UU. (reconocerlos en México)'],
        ['matrimonio_extranjero', 'Registrar en México un matrimonio hecho en EE.UU.'], ['tutela', 'Tutela de menores'], ['permiso_viaje', 'Permiso para que un menor viaje o tramite pasaporte'],
      ],
      objetivos: [
        ['divorciarse', 'Divorciarse'], ['cobrar_pension', 'Cobrar o fijar pensión'], ['bajar_pension', 'Reducir o cancelar una pensión'],
        ['custodia', 'Obtener la custodia'], ['ver_hijos', 'Poder ver a sus hijos'], ['regresar_menor', 'Que un menor regrese a su país'],
        ['proteccion', 'Protegerse a sí mismo o a sus hijos'], ['dividir_bienes', 'Dividir los bienes'], ['regularizar', 'Regularizar un documento o estado civil'],
      ],
    }),
    cliente(),
    partes({
      roles: [['promovente', 'Quien inicia el trámite'], ['demandado', 'A quien demandan'], ['ambos_acuerdo', 'Ambas partes de acuerdo']],
      relaciones: [['conyuge', 'Cónyuge'], ['ex_conyuge', 'Ex cónyuge'], ['concubino', 'Concubino o pareja'], ['padre_hijo', 'Padre o madre de los hijos'], ['abuelo', 'Abuelo o abuela'], ['otro', 'Otra']],
      contraparteEtiqueta: 'Nombre de la otra parte',
      extra: [{ id: 'contraparte_localizable', tipo: 'sino', etiqueta: '¿Se conoce su domicilio actual?', opciones: SINO_NS }],
    }),
    hechos({ estadoEtiqueta: 'Estado donde se casaron o viven los hijos', conMonto: false }),
    {
      id: 'hijos', titulo: 'Hijos', si: { campo: 'asuntos', incluyeAlguno: ['custodia', 'convivencia', 'pension', 'divorcio', 'patria_potestad', 'sustraccion', 'permiso_viaje'] },
      campos: [
        { id: 'hijos_num', tipo: 'numero', etiqueta: 'Número de hijos menores de edad' },
        { id: 'hijos_edades', tipo: 'texto', etiqueta: 'Edades' },
        { id: 'hijos_viven', tipo: 'opcion', etiqueta: '¿Con quién viven hoy?', opciones: HIJOS_VIVEN },
        { id: 'hijos_pais', tipo: 'opcion', etiqueta: '¿En qué país viven?', opciones: [['mexico', 'México'], ['eeuu', 'Estados Unidos'], ['distinto', 'Unos en cada país']] },
        { id: 'hijos_convenio', tipo: 'sino', etiqueta: '¿Hay convenio o sentencia previa sobre custodia?', opciones: SINO_NS },
        { id: 'hijos_riesgo', tipo: 'sino', etiqueta: '¿Hay riesgo para los menores con el otro padre?', opciones: SINO_NS },
      ],
    },
    {
      id: 'divorcio', titulo: 'Divorcio', si: { campo: 'asuntos', incluye: 'divorcio' },
      campos: [
        { id: 'div_fecha', tipo: 'fecha', etiqueta: 'Fecha del matrimonio' },
        { id: 'div_lugar', tipo: 'opcion', etiqueta: 'Dónde se casaron', opciones: ESTADOS },
        { id: 'div_regimen', tipo: 'opcion', etiqueta: 'Régimen del matrimonio', opciones: [['sociedad', 'Sociedad conyugal'], ['separacion', 'Separación de bienes'], ['ns', 'No sabe']] },
        { id: 'div_acuerdo', tipo: 'opcion', etiqueta: '¿La otra parte está de acuerdo?', opciones: [['si', 'Sí, de acuerdo en todo'], ['parcial', 'Solo en divorciarse'], ['no', 'No'], ['ns', 'No sabe']] },
        { id: 'div_tipo', tipo: 'opcion', etiqueta: 'Vía probable', opciones: [['administrativo', 'Administrativo (sin hijos, sin bienes, de acuerdo)'], ['voluntario', 'Voluntario con convenio'], ['incausado', 'Sin causa (una sola parte lo pide)'], ['por_definir', 'Por definir']] },
        { id: 'div_separados', tipo: 'texto', etiqueta: '¿Desde cuándo están separados?' },
        { id: 'div_eeuu', tipo: 'sino', etiqueta: '¿Ya hay un divorcio tramitado en EE.UU.?', opciones: SINO_NS },
      ],
    },
    {
      id: 'pension', titulo: 'Pensión alimenticia', si: { campo: 'asuntos', incluye: 'pension' },
      campos: [
        { id: 'pen_rol', tipo: 'opcion', etiqueta: 'El cliente…', opciones: [['recibe', 'Quiere recibirla'], ['paga', 'Es quien paga']] },
        { id: 'pen_para', tipo: 'multi', etiqueta: 'Para quién', opciones: [['hijos', 'Hijos menores'], ['hijos_estudiando', 'Hijos mayores que estudian'], ['conyuge', 'Cónyuge o ex cónyuge'], ['padres', 'Padres adultos mayores']] },
        { id: 'pen_actual', tipo: 'dinero', etiqueta: 'Pensión actual (mensual)' },
        { id: 'pen_situacion', tipo: 'opcion', etiqueta: 'Situación', opciones: [['fijar', 'No hay pensión fijada'], ['no_paga', 'Está fijada pero no se paga'], ['aumentar', 'Quiere aumentarla'], ['reducir', 'Quiere reducirla o cancelarla']] },
        { id: 'pen_adeudo', tipo: 'dinero', etiqueta: 'Monto adeudado', si: { campo: 'pen_situacion', igual: 'no_paga' } },
        { id: 'pen_ingresos', tipo: 'opcion', etiqueta: 'Ingresos de quien debe pagar', opciones: [['formal', 'Empleo formal (nómina)'], ['informal', 'Ingresos informales'], ['eeuu', 'Trabaja en EE.UU.'], ['ns', 'No se sabe']] },
        { id: 'pen_gastos', tipo: 'parrafo', etiqueta: 'Gastos de los acreedores (escuela, salud, vivienda…)' },
      ],
    },
    {
      id: 'convivencia', titulo: 'Convivencias y patria potestad', si: { campo: 'asuntos', incluyeAlguno: ['convivencia', 'patria_potestad'] },
      campos: [
        { id: 'conv_actual', tipo: 'opcion', etiqueta: '¿Hoy convive con sus hijos?', opciones: [['si', 'Sí, con regularidad'], ['poco', 'Poco o sin horario'], ['no', 'No se lo permiten']] },
        { id: 'conv_desde', tipo: 'fecha', etiqueta: 'Desde cuándo no convive' , si: { campo: 'conv_actual', igual: 'no' } },
        { id: 'conv_modalidad', tipo: 'multi', etiqueta: 'Convivencia que pide', opciones: [['presencial', 'Presencial en México'], ['vacaciones', 'Vacaciones en EE.UU.'], ['videollamada', 'Por videollamada'], ['supervisada', 'Supervisada']] },
      ],
    },
    {
      id: 'sustraccion', titulo: 'Traslado o retención de menores', si: { campo: 'asuntos', incluye: 'sustraccion' },
      campos: [
        { id: 'sus_direccion', tipo: 'opcion', etiqueta: '¿Hacia dónde se llevaron al menor?', opciones: [['mx_a_eeuu', 'De México a EE.UU.'], ['eeuu_a_mx', 'De EE.UU. a México'], ['otro', 'Otro país']] },
        { id: 'sus_fecha', tipo: 'fecha', etiqueta: 'Fecha del traslado o de la retención' },
        { id: 'sus_residencia', tipo: 'opcion', etiqueta: 'País donde el menor vivía habitualmente antes', opciones: [['mexico', 'México'], ['eeuu', 'Estados Unidos'], ['otro', 'Otro']] },
        { id: 'sus_permiso', tipo: 'sino', etiqueta: '¿Hubo permiso para el viaje?', opciones: SINO_NS },
        { id: 'sus_sre', tipo: 'sino', etiqueta: '¿Ya se presentó solicitud ante la SRE o el consulado?', opciones: SINO_NS },
      ],
    },
    {
      id: 'paternidad', titulo: 'Paternidad', si: { campo: 'asuntos', incluye: 'paternidad' },
      campos: [
        { id: 'pat_tipo', tipo: 'opcion', etiqueta: 'Busca…', opciones: [['reconocimiento', 'Que se reconozca a un hijo'], ['desconocimiento', 'Desconocer una paternidad'], ['adn', 'Prueba de ADN']] },
        { id: 'pat_menor_edad', tipo: 'numero', etiqueta: 'Edad del hijo o hija' },
        { id: 'pat_registro', tipo: 'opcion', etiqueta: 'Registro del menor', opciones: [['solo_madre', 'Solo con la madre'], ['ambos', 'Con ambos padres'], ['eeuu', 'Registrado en EE.UU.'], ['sin_registro', 'Sin registrar']] },
      ],
    },
    {
      id: 'violencia', titulo: 'Violencia familiar', si: { campo: 'asuntos', incluye: 'violencia' },
      campos: [
        { id: 'vio_riesgo', tipo: 'opcion', etiqueta: 'Riesgo actual', opciones: [['inmediato', 'Inmediato (necesita protección hoy)'], ['reciente', 'Hechos recientes'], ['pasado', 'Hechos pasados']] },
        { id: 'vio_tipo', tipo: 'multi', etiqueta: 'Tipo', opciones: [['fisica', 'Física'], ['psicologica', 'Psicológica'], ['economica', 'Económica'], ['patrimonial', 'Patrimonial'], ['sexual', 'Sexual']] },
        { id: 'vio_denuncia', tipo: 'sino', etiqueta: '¿Hay denuncia o medidas de protección?', opciones: SINO_NS },
        { id: 'vio_menores', tipo: 'sino', etiqueta: '¿Hay menores afectados?', opciones: SINO_NS },
      ],
    },
    {
      id: 'bienes', titulo: 'Bienes del matrimonio', si: { campo: 'asuntos', incluye: 'bienes' },
      campos: [
        { id: 'bie_lista', tipo: 'multi', etiqueta: 'Bienes', opciones: [['casa', 'Casa o terreno en México'], ['casa_eeuu', 'Casa en EE.UU.'], ['vehiculos', 'Vehículos'], ['cuentas', 'Cuentas bancarias'], ['negocio', 'Negocio'], ['deudas', 'Deudas en común']] },
        { id: 'bie_a_nombre', tipo: 'texto', etiqueta: '¿A nombre de quién están?' },
        { id: 'bie_valor', tipo: 'dinero', etiqueta: 'Valor aproximado total' },
      ],
    },
    {
      id: 'sentencia_extranjera', titulo: 'Sentencia o matrimonio de EE.UU.', si: { campo: 'asuntos', incluyeAlguno: ['sentencia_extranjera', 'matrimonio_extranjero'] },
      campos: [
        { id: 'sex_tipo', tipo: 'multi', etiqueta: 'Documento', opciones: [['divorcio', 'Sentencia de divorcio'], ['custodia', 'Orden de custodia'], ['manutencion', 'Orden de manutención'], ['matrimonio', 'Acta de matrimonio']] },
        { id: 'sex_estado', tipo: 'texto', etiqueta: 'Estado de EE.UU. que la emitió' },
        { id: 'sex_apostilla', tipo: 'sino', etiqueta: '¿Está apostillada?', opciones: SINO_NS },
        { id: 'sex_traduccion', tipo: 'sino', etiqueta: '¿Tiene traducción por perito?', opciones: SINO_NS },
      ],
    },
    documentos([
      ...DOCS_BASE, ['acta_matrimonio', 'Acta de matrimonio'], ['actas_hijos', 'Actas de nacimiento de los hijos'],
      ['sentencia', 'Sentencia o convenio previo'], ['comprobantes_ingresos', 'Comprobantes de ingresos'], ['comprobantes_gastos', 'Comprobantes de gastos de los hijos'],
      ['escrituras', 'Escrituras de bienes'], ['denuncia', 'Denuncia o medidas de protección'], ['documento_eeuu', 'Sentencia u orden de EE.UU.'], ...DOCS_FIN,
    ]),
    procesal({
      situaciones: [['si_actor', 'Sí, el cliente inició el juicio'], ['si_demandado', 'Sí, al cliente lo demandaron'], ['administrativo', 'Hay un trámite en el Registro Civil'], ['eeuu', 'Hay un proceso en una corte de EE.UU.']],
      etapas: [['demanda', 'Demanda presentada'], ['emplazamiento', 'Emplazamiento'], ['medidas', 'Medidas provisionales'], ['audiencia', 'Audiencia preliminar o de juicio'], ['sentencia', 'Sentencia'], ['apelacion', 'Apelación'], ['amparo', 'Amparo'], ['ejecucion', 'Ejecución']],
      codigos: [['local', 'Código de procedimientos familiares o civiles del estado'], ['cnpcf', 'Código Nacional de Procedimientos Civiles y Familiares']],
    }),
    evaluacion({
      especialidad: 'Derecho Familiar',
      vias: [
        ['convenio', 'Convenio entre las partes'], ['mediacion', 'Mediación familiar'], ['administrativo', 'Divorcio administrativo'],
        ['voluntario', 'Divorcio voluntario'], ['incausado', 'Divorcio sin causa'], ['alimentos', 'Juicio de alimentos'],
        ['custodia', 'Controversia de custodia y convivencia'], ['medidas', 'Medidas de protección urgentes'], ['paternidad', 'Juicio de paternidad'],
        ['restitucion', 'Restitución internacional de menores (Convención de La Haya)'], ['exequatur', 'Reconocimiento de sentencia extranjera'], ['amparo', 'Amparo'],
      ],
      extra: [{ id: 'interes_menor', tipo: 'parrafo', etiqueta: 'Consideraciones sobre el interés superior de los menores', si: { campo: 'asuntos', incluyeAlguno: ['custodia', 'convivencia', 'sustraccion'] } }],
    }),
    pasos({
      docs: [...DOCS_BASE, ['acta_matrimonio', 'Acta de matrimonio'], ['actas_hijos', 'Actas de nacimiento de los hijos'], ['sentencia', 'Sentencia o convenio previo'], ['comprobantes_ingresos', 'Comprobantes de ingresos'], ['comprobantes_gastos', 'Comprobantes de gastos'], ['documento_eeuu', 'Documento de EE.UU. apostillado'], ['traduccion', 'Traducción por perito']],
      acciones: [['otorgar_poder', 'Otorgar poder en el consulado'], ['apostillar', 'Apostillar documentos de EE.UU.'], ['propuesta_convenio', 'Redactar propuesta de convenio'], ['medidas_urgentes', 'Solicitar medidas de protección'], ['contactar_sre', 'Contactar a la SRE o al consulado']],
    }),
  ],
}
