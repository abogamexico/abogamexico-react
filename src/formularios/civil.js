// ════════════════════════════════════════════════════════════════
//  Expediente · Derecho Civil
//  Cada sección tiene campos. Tipos de campo:
//    texto · parrafo · numero · dinero · fecha · opcion (una) · multi (varias) · sino
//  "si" muestra el campo solo cuando se cumple una condición:
//    { campo: 'asuntos', incluye: 'sucesion' }  → si en ese multi se marcó esa opción
//    { campo: 'juicio', igual: 'si_actor' }      → si en esa opción se eligió ese valor
//    { campo: 'juicio', distinto: 'no' }
// ════════════════════════════════════════════════════════════════
import { ESTADOS_MX } from '../lib/catalogos'

const SINO_NS = [['si', 'Sí'], ['no', 'No'], ['ns', 'No sé']]
const ESTADOS = ESTADOS_MX.map(e => [e, e]).concat([['extranjero', 'Fuera de México']])

export const ASUNTOS_CIVIL = [
  ['contratos', 'Contratos e incumplimiento'],
  ['deudas', 'Deudas y cobranza entre particulares'],
  ['arrendamiento', 'Arrendamiento (rentas)'],
  ['sucesion', 'Herencias y sucesiones'],
  ['testamento', 'Hacer o modificar un testamento'],
  ['propiedad', 'Propiedad de inmuebles (posesión, escrituras, usucapión)'],
  ['responsabilidad', 'Daños y perjuicios / responsabilidad civil'],
  ['actas', 'Actas del Registro Civil (corrección, rectificación)'],
  ['personas', 'Personas (ausencia, apoyos, cambio de nombre)'],
  ['poderes', 'Poderes notariales y representación desde EE.UU.'],
  ['otro', 'Otro asunto civil'],
]

export default {
  id: 'civil',
  especialidad: 'Derecho Civil',
  titulo: 'Expediente · Derecho Civil',
  secciones: [
    {
      id: 'asunto', titulo: '1. ¿De qué trata el caso?',
      campos: [
        { id: 'asuntos', tipo: 'multi', etiqueta: 'Tipo de asunto (marca todos los que apliquen)', opciones: ASUNTOS_CIVIL },
        { id: 'asunto_otro', tipo: 'texto', etiqueta: '¿Cuál otro asunto?', si: { campo: 'asuntos', incluye: 'otro' } },
        { id: 'resumen_cliente_dice', tipo: 'parrafo', etiqueta: 'En palabras del cliente: ¿qué está pasando?', ayuda: 'Anota lo que cuenta el cliente tal cual.' },
        { id: 'objetivo', tipo: 'multi', etiqueta: '¿Qué quiere lograr el cliente?', opciones: [
          ['cobrar', 'Cobrar dinero que le deben'], ['defenderse', 'Defenderse de una demanda o cobro'],
          ['recuperar_bien', 'Recuperar un bien o inmueble'], ['regularizar', 'Regularizar o escriturar una propiedad'],
          ['heredar', 'Recibir su parte de una herencia'], ['heredar_dejar', 'Dejar en orden sus bienes'],
          ['terminar_contrato', 'Terminar o cancelar un contrato'], ['indemnizacion', 'Recibir una indemnización'],
          ['documento', 'Corregir u obtener un documento'], ['orientacion', 'Solo orientación por ahora'],
        ] },
        { id: 'urgencia', tipo: 'opcion', etiqueta: 'Urgencia', opciones: [['alta', 'Alta: hay un plazo o audiencia próxima'], ['media', 'Media'], ['baja', 'Baja: solo quiere informarse']] },
        { id: 'fecha_limite', tipo: 'fecha', etiqueta: 'Fecha límite o audiencia próxima', si: { campo: 'urgencia', igual: 'alta' } },
      ],
    },
    {
      id: 'cliente', titulo: '2. Situación del cliente',
      campos: [
        { id: 'reside', tipo: 'opcion', etiqueta: '¿Dónde vive el cliente?', opciones: [['eeuu', 'Estados Unidos'], ['mexico', 'México'], ['otro_pais', 'Otro país']] },
        { id: 'puede_viajar', tipo: 'opcion', etiqueta: '¿Puede viajar a México si hace falta?', opciones: [['si', 'Sí'], ['no', 'No'], ['dificil', 'Con dificultad']] },
        { id: 'identificacion', tipo: 'multi', etiqueta: 'Identificación mexicana vigente con la que cuenta', opciones: [['ine', 'INE'], ['pasaporte', 'Pasaporte mexicano'], ['matricula', 'Matrícula consular'], ['ninguna', 'Ninguna vigente']] },
        { id: 'requiere_poder', tipo: 'sino', etiqueta: '¿Necesitará otorgar un poder para que alguien lo represente en México?', opciones: SINO_NS },
        { id: 'poder_via', tipo: 'opcion', etiqueta: '¿Cómo se otorgaría el poder?', si: { campo: 'requiere_poder', igual: 'si' }, opciones: [['consulado', 'En el consulado de México'], ['notario_apostilla', 'Ante notario en EE.UU. con apostilla'], ['notario_mx', 'Ante notario en México (viajando)']] },
        { id: 'apoderado', tipo: 'texto', etiqueta: 'Persona de confianza en México (nombre y relación)', si: { campo: 'requiere_poder', igual: 'si' } },
      ],
    },
    {
      id: 'partes', titulo: '3. Las partes',
      campos: [
        { id: 'rol', tipo: 'opcion', etiqueta: 'El cliente es…', opciones: [['reclama', 'Quien reclama'], ['reclamado', 'A quien le reclaman'], ['interesado', 'Interesado (sin conflicto)']] },
        { id: 'contraparte', tipo: 'texto', etiqueta: 'Nombre de la otra parte (persona o empresa)' },
        { id: 'relacion', tipo: 'opcion', etiqueta: 'Relación con la otra parte', opciones: [['familiar', 'Familiar'], ['conocido', 'Conocido o amigo'], ['vecino', 'Vecino'], ['arrendador', 'Arrendador o inquilino'], ['empresa', 'Empresa'], ['desconocido', 'Desconocido'], ['otro', 'Otra']] },
        { id: 'contraparte_estado', tipo: 'opcion', etiqueta: '¿Dónde vive la otra parte?', opciones: ESTADOS },
        { id: 'contraparte_localizable', tipo: 'sino', etiqueta: '¿Se conoce su domicilio actual?', opciones: SINO_NS },
        { id: 'otros_involucrados', tipo: 'parrafo', etiqueta: 'Otras personas involucradas (herederos, fiadores, testigos…)' },
      ],
    },
    {
      id: 'hechos', titulo: '4. Hechos',
      campos: [
        { id: 'estado_hechos', tipo: 'opcion', etiqueta: 'Estado donde ocurrieron los hechos o está el bien', opciones: ESTADOS },
        { id: 'municipio', tipo: 'texto', etiqueta: 'Municipio o alcaldía' },
        { id: 'fecha_inicio', tipo: 'fecha', etiqueta: '¿Cuándo empezó el problema?' },
        { id: 'monto', tipo: 'dinero', etiqueta: 'Monto involucrado (aproximado)' },
        { id: 'intentos', tipo: 'multi', etiqueta: '¿Qué ha intentado el cliente?', opciones: [['hablar', 'Hablar con la otra parte'], ['carta', 'Mandar carta o mensaje de requerimiento'], ['notario', 'Acudir a notario'], ['otro_abogado', 'Contratar otro abogado'], ['autoridad', 'Acudir a una autoridad'], ['nada', 'Nada aún']] },
        { id: 'cronologia', tipo: 'parrafo', etiqueta: 'Cronología de los hechos', ayuda: 'Fechas y lo que pasó en cada una.' },
      ],
    },

    // ── Preguntas por tipo de asunto ───────────────────────────────
    {
      id: 'contratos', titulo: 'Contratos e incumplimiento', si: { campo: 'asuntos', incluye: 'contratos' },
      campos: [
        { id: 'contrato_tipo', tipo: 'opcion', etiqueta: 'Tipo de contrato', opciones: [['compraventa', 'Compraventa'], ['prestacion', 'Prestación de servicios'], ['obra', 'Obra o construcción'], ['mutuo', 'Préstamo (mutuo)'], ['donacion', 'Donación'], ['comodato', 'Comodato (préstamo de uso)'], ['fianza', 'Fianza'], ['promesa', 'Promesa de compraventa'], ['otro', 'Otro']] },
        { id: 'contrato_forma', tipo: 'opcion', etiqueta: '¿Cómo se hizo el contrato?', opciones: [['escrito_firmado', 'Por escrito y firmado'], ['escrito_notario', 'Ante notario'], ['verbal', 'De palabra'], ['mensajes', 'Por mensajes o correo']] },
        { id: 'contrato_fecha', tipo: 'fecha', etiqueta: 'Fecha del contrato' },
        { id: 'contrato_incumple', tipo: 'opcion', etiqueta: '¿Quién incumplió?', opciones: [['contraparte', 'La otra parte'], ['cliente', 'El cliente'], ['ambos', 'Ambos'], ['ns', 'No está claro']] },
        { id: 'contrato_incumplimiento', tipo: 'multi', etiqueta: '¿En qué consiste el incumplimiento?', opciones: [['no_pago', 'No pagó'], ['no_entrego', 'No entregó el bien'], ['mala_calidad', 'Trabajo o bien defectuoso'], ['retraso', 'Retraso'], ['no_escritura', 'No firma escrituras'], ['otro', 'Otro']] },
        { id: 'contrato_clausulas', tipo: 'parrafo', etiqueta: 'Cláusulas importantes (penas, plazos, jurisdicción)' },
      ],
    },
    {
      id: 'deudas', titulo: 'Deudas y cobranza', si: { campo: 'asuntos', incluye: 'deudas' },
      campos: [
        { id: 'deuda_rol', tipo: 'opcion', etiqueta: 'El cliente es…', opciones: [['acreedor', 'Acreedor (le deben)'], ['deudor', 'Deudor (debe)']] },
        { id: 'deuda_documento', tipo: 'multi', etiqueta: '¿Qué documenta la deuda?', opciones: [['pagare', 'Pagaré'], ['contrato', 'Contrato de préstamo'], ['recibos', 'Recibos o transferencias'], ['mensajes', 'Mensajes'], ['testigos', 'Solo testigos'], ['nada', 'Nada por escrito']] },
        { id: 'deuda_monto', tipo: 'dinero', etiqueta: 'Monto de la deuda' },
        { id: 'deuda_intereses', tipo: 'texto', etiqueta: 'Intereses pactados (% mensual o anual)' },
        { id: 'deuda_vencimiento', tipo: 'fecha', etiqueta: 'Fecha en que debía pagarse' },
        { id: 'deuda_garantia', tipo: 'opcion', etiqueta: 'Garantía', opciones: [['ninguna', 'Ninguna'], ['aval', 'Aval o fiador'], ['hipoteca', 'Hipoteca'], ['prenda', 'Prenda (bien en garantía)']] },
        { id: 'deuda_bienes', tipo: 'sino', etiqueta: '¿El deudor tiene bienes conocidos para embargar?', opciones: SINO_NS },
      ],
    },
    {
      id: 'arrendamiento', titulo: 'Arrendamiento', si: { campo: 'asuntos', incluye: 'arrendamiento' },
      campos: [
        { id: 'arr_rol', tipo: 'opcion', etiqueta: 'El cliente es…', opciones: [['arrendador', 'Dueño (arrendador)'], ['arrendatario', 'Inquilino (arrendatario)'], ['fiador', 'Fiador']] },
        { id: 'arr_contrato', tipo: 'opcion', etiqueta: 'Contrato', opciones: [['escrito', 'Por escrito'], ['verbal', 'De palabra']] },
        { id: 'arr_renta', tipo: 'dinero', etiqueta: 'Renta mensual' },
        { id: 'arr_problema', tipo: 'multi', etiqueta: 'Problema', opciones: [['rentas', 'Rentas adeudadas'], ['desocupar', 'No quiere desocupar'], ['deposito', 'No devuelven el depósito'], ['danos', 'Daños al inmueble'], ['reparaciones', 'Reparaciones no hechas'], ['terminacion', 'Terminar el contrato'], ['otro', 'Otro']] },
        { id: 'arr_meses', tipo: 'numero', etiqueta: 'Meses de renta adeudados' },
        { id: 'arr_ocupado', tipo: 'sino', etiqueta: '¿El inmueble sigue ocupado?', opciones: SINO_NS },
      ],
    },
    {
      id: 'sucesion', titulo: 'Herencias y sucesiones', si: { campo: 'asuntos', incluye: 'sucesion' },
      campos: [
        { id: 'suc_finado', tipo: 'texto', etiqueta: 'Nombre de la persona que falleció' },
        { id: 'suc_parentesco', tipo: 'opcion', etiqueta: 'Parentesco con el cliente', opciones: [['padre_madre', 'Padre o madre'], ['conyuge', 'Cónyuge o concubino'], ['hijo', 'Hijo o hija'], ['hermano', 'Hermano o hermana'], ['abuelo', 'Abuelo o abuela'], ['tio', 'Tío o tía'], ['otro', 'Otro']] },
        { id: 'suc_fecha', tipo: 'fecha', etiqueta: 'Fecha de fallecimiento' },
        { id: 'suc_domicilio', tipo: 'opcion', etiqueta: 'Último domicilio del fallecido', opciones: ESTADOS },
        { id: 'suc_testamento', tipo: 'sino', etiqueta: '¿Dejó testamento?', opciones: SINO_NS },
        { id: 'suc_busqueda', tipo: 'sino', etiqueta: '¿Ya se consultó el Registro Nacional de Avisos de Testamento?', opciones: SINO_NS, si: { campo: 'suc_testamento', distinto: 'si' } },
        { id: 'suc_herederos', tipo: 'numero', etiqueta: 'Número de posibles herederos' },
        { id: 'suc_acuerdo', tipo: 'opcion', etiqueta: '¿Los herederos están de acuerdo?', opciones: [['si', 'Sí, todos'], ['parcial', 'Algunos no'], ['no', 'Hay conflicto'], ['ns', 'No sé']] },
        { id: 'suc_bienes', tipo: 'multi', etiqueta: 'Bienes de la herencia', opciones: [['casa', 'Casa o departamento'], ['terreno', 'Terreno'], ['ejido', 'Parcela ejidal (ver Derecho Agrario)'], ['cuentas', 'Cuentas bancarias'], ['afore', 'Afore o pensión'], ['seguro', 'Seguro de vida'], ['vehiculo', 'Vehículo'], ['negocio', 'Negocio'], ['deudas', 'Deudas del fallecido']] },
        { id: 'suc_ocupa', tipo: 'texto', etiqueta: '¿Quién ocupa o administra hoy los bienes?' },
        { id: 'suc_via', tipo: 'opcion', etiqueta: 'Vía probable', opciones: [['notarial', 'Ante notario (si hay acuerdo y son mayores de edad)'], ['judicial', 'Juicio sucesorio'], ['por_definir', 'Por definir']] },
      ],
    },
    {
      id: 'testamento', titulo: 'Testamento', si: { campo: 'asuntos', incluye: 'testamento' },
      campos: [
        { id: 'test_tipo', tipo: 'opcion', etiqueta: '¿Qué necesita?', opciones: [['nuevo', 'Hacer su primer testamento'], ['modificar', 'Cambiar uno existente'], ['revocar', 'Revocar uno existente']] },
        { id: 'test_lugar', tipo: 'opcion', etiqueta: '¿Dónde lo otorgaría?', opciones: [['consulado', 'Consulado de México'], ['notario_mx', 'Notario en México'], ['ns', 'No sabe']] },
        { id: 'test_bienes', tipo: 'parrafo', etiqueta: 'Bienes que quiere incluir y en qué estado están' },
        { id: 'test_beneficiarios', tipo: 'parrafo', etiqueta: 'Beneficiarios que tiene en mente' },
        { id: 'test_menores', tipo: 'sino', etiqueta: '¿Tiene hijos menores de edad (designar tutor)?', opciones: SINO_NS },
      ],
    },
    {
      id: 'propiedad', titulo: 'Propiedad de inmuebles', si: { campo: 'asuntos', incluye: 'propiedad' },
      campos: [
        { id: 'prop_tipo', tipo: 'opcion', etiqueta: 'Tipo de inmueble', opciones: [['casa', 'Casa'], ['depto', 'Departamento'], ['terreno_urbano', 'Terreno urbano'], ['terreno_rustico', 'Terreno rústico'], ['ejidal', 'Ejidal o comunal (ver Derecho Agrario)']] },
        { id: 'prop_situacion', tipo: 'opcion', etiqueta: 'Situación del cliente con el inmueble', opciones: [['escriturado', 'Tiene escrituras a su nombre'], ['a_nombre_otro', 'Las escrituras están a nombre de otra persona'], ['sin_escrituras', 'Nunca se escrituró'], ['contrato_privado', 'Solo tiene contrato privado de compraventa'], ['invadido', 'Alguien lo ocupa sin permiso']] },
        { id: 'prop_a_nombre', tipo: 'texto', etiqueta: '¿A nombre de quién está registrado?' },
        { id: 'prop_posesion_anos', tipo: 'numero', etiqueta: 'Años de posesión del cliente o su familia' },
        { id: 'prop_posesion_tipo', tipo: 'multi', etiqueta: 'La posesión ha sido…', opciones: [['pacifica', 'Pacífica'], ['continua', 'Continua'], ['publica', 'Pública'], ['buena_fe', 'De buena fe (con algún título)']] },
        { id: 'prop_predial', tipo: 'sino', etiqueta: '¿Está al corriente el predial?', opciones: SINO_NS },
        { id: 'prop_gravamenes', tipo: 'sino', etiqueta: '¿Tiene hipoteca, embargo u otro gravamen?', opciones: SINO_NS },
        { id: 'prop_problema', tipo: 'multi', etiqueta: 'Problema', opciones: [['escriturar', 'Escriturar o regularizar'], ['usucapion', 'Prescripción adquisitiva (usucapión)'], ['reivindicar', 'Recuperar el inmueble (reivindicación)'], ['deslinde', 'Límites con vecinos (deslinde)'], ['copropiedad', 'División con copropietarios'], ['servidumbre', 'Paso o servidumbre'], ['venta', 'Quiere vender estando en EE.UU.'], ['fraude', 'Posible fraude o despojo']] },
      ],
    },
    {
      id: 'responsabilidad', titulo: 'Daños y perjuicios', si: { campo: 'asuntos', incluye: 'responsabilidad' },
      campos: [
        { id: 'resp_tipo', tipo: 'multi', etiqueta: 'Tipo de daño', opciones: [['accidente_auto', 'Accidente de tránsito'], ['lesiones', 'Lesiones personales'], ['danio_bien', 'Daño a un bien o inmueble'], ['medico', 'Atención médica deficiente'], ['moral', 'Daño moral (honor, imagen)'], ['animal', 'Daño causado por un animal'], ['otro', 'Otro']] },
        { id: 'resp_fecha', tipo: 'fecha', etiqueta: 'Fecha del daño' },
        { id: 'resp_seguro', tipo: 'sino', etiqueta: '¿Hay seguro de por medio?', opciones: SINO_NS },
        { id: 'resp_penal', tipo: 'sino', etiqueta: '¿Hay denuncia o carpeta de investigación?', opciones: SINO_NS },
        { id: 'resp_estimado', tipo: 'dinero', etiqueta: 'Monto estimado del daño' },
        { id: 'resp_pruebas', tipo: 'multi', etiqueta: 'Pruebas del daño', opciones: [['fotos', 'Fotos o video'], ['facturas', 'Facturas o presupuestos'], ['dictamen', 'Dictamen o peritaje'], ['medico', 'Certificado médico'], ['testigos', 'Testigos'], ['parte', 'Parte o reporte oficial']] },
      ],
    },
    {
      id: 'actas', titulo: 'Actas del Registro Civil', si: { campo: 'asuntos', incluye: 'actas' },
      campos: [
        { id: 'acta_tipo', tipo: 'multi', etiqueta: 'Acta', opciones: [['nacimiento', 'Nacimiento'], ['matrimonio', 'Matrimonio'], ['defuncion', 'Defunción'], ['divorcio', 'Divorcio'], ['reconocimiento', 'Reconocimiento de hijo']] },
        { id: 'acta_estado', tipo: 'opcion', etiqueta: 'Estado donde se registró', opciones: ESTADOS },
        { id: 'acta_error', tipo: 'multi', etiqueta: 'Tipo de error', opciones: [['nombre', 'Nombre o apellidos'], ['fecha', 'Fecha'], ['lugar', 'Lugar'], ['padres', 'Datos de los padres'], ['sexo', 'Sexo'], ['inexistente', 'No aparece el registro'], ['doble', 'Doble registro'], ['extranjero', 'Inscribir un acta de EE.UU. en México']] },
        { id: 'acta_detalle', tipo: 'parrafo', etiqueta: 'Qué dice el acta y qué debería decir' },
        { id: 'acta_via', tipo: 'opcion', etiqueta: 'Vía probable', opciones: [['administrativa', 'Aclaración administrativa'], ['judicial', 'Juicio de rectificación'], ['por_definir', 'Por definir']] },
      ],
    },
    {
      id: 'personas', titulo: 'Personas', si: { campo: 'asuntos', incluye: 'personas' },
      campos: [
        { id: 'pers_tipo', tipo: 'opcion', etiqueta: 'Trámite', opciones: [['ausencia', 'Declaración de ausencia o presunción de muerte'], ['apoyos', 'Apoyos y salvaguardias para persona con discapacidad (antes interdicción)'], ['nombre', 'Cambio o identidad de nombre'], ['identidad_genero', 'Reconocimiento de identidad'], ['otro', 'Otro']] },
        { id: 'pers_persona', tipo: 'texto', etiqueta: 'Persona a la que se refiere y su relación con el cliente' },
        { id: 'pers_desde', tipo: 'fecha', etiqueta: 'Desde cuándo (desaparición, diagnóstico, etc.)' },
      ],
    },
    {
      id: 'poderes', titulo: 'Poderes y representación', si: { campo: 'asuntos', incluye: 'poderes' },
      campos: [
        { id: 'poder_para', tipo: 'multi', etiqueta: 'El poder es para…', opciones: [['pleitos', 'Pleitos y cobranzas'], ['administracion', 'Actos de administración'], ['dominio', 'Actos de dominio (vender, donar)'], ['especial', 'Un trámite específico']] },
        { id: 'poder_tramite', tipo: 'texto', etiqueta: 'Trámite específico', si: { campo: 'poder_para', incluye: 'especial' } },
        { id: 'poder_consulado', tipo: 'texto', etiqueta: 'Consulado más cercano al cliente' },
        { id: 'poder_existente', tipo: 'sino', etiqueta: '¿Ya existe un poder anterior que haya que revocar?', opciones: SINO_NS },
      ],
    },

    // ── Comunes ──────────────────────────────────────────────────
    {
      id: 'documentos', titulo: '5. Documentos con los que cuenta el cliente',
      campos: [
        { id: 'docs_tiene', tipo: 'multi', etiqueta: 'Tiene', opciones: [
          ['identificacion', 'Identificación oficial'], ['curp', 'CURP'], ['actas', 'Actas de nacimiento, matrimonio o defunción'],
          ['contrato', 'Contrato'], ['pagare', 'Pagaré'], ['recibos', 'Recibos o comprobantes de pago'],
          ['escrituras', 'Escrituras'], ['predial', 'Boleta predial'], ['libertad_gravamen', 'Certificado de libertad de gravámenes'],
          ['testamento', 'Testamento'], ['poder', 'Poder notarial'], ['sentencia', 'Sentencia o resolución previa'],
          ['demanda', 'Demanda o notificación recibida'], ['fotos', 'Fotos o videos'], ['mensajes', 'Mensajes o correos'],
          ['peritaje', 'Avalúo o peritaje'], ['testigos', 'Testigos dispuestos a declarar'],
        ] },
        { id: 'docs_notas', tipo: 'parrafo', etiqueta: 'Notas sobre los documentos (quién los tiene, en qué estado están)' },
      ],
    },
    {
      id: 'procesal', titulo: '6. ¿Ya hay un juicio o trámite?',
      campos: [
        { id: 'juicio', tipo: 'opcion', etiqueta: 'Situación', opciones: [['no', 'No, aún no'], ['si_actor', 'Sí, el cliente demandó'], ['si_demandado', 'Sí, al cliente lo demandaron'], ['notarial', 'Hay un trámite ante notario'], ['ns', 'No sabe']] },
        { id: 'juzgado', tipo: 'texto', etiqueta: 'Juzgado y ciudad', si: { campo: 'juicio', distinto: 'no' } },
        { id: 'expediente_num', tipo: 'texto', etiqueta: 'Número de expediente', si: { campo: 'juicio', distinto: 'no' } },
        { id: 'etapa', tipo: 'opcion', etiqueta: 'Etapa', si: { campo: 'juicio', distinto: 'no' }, opciones: [['demanda', 'Demanda presentada'], ['emplazamiento', 'Emplazamiento'], ['contestacion', 'Contestación'], ['conciliacion', 'Audiencia de conciliación'], ['pruebas', 'Pruebas'], ['alegatos', 'Alegatos'], ['sentencia', 'Sentencia'], ['apelacion', 'Apelación'], ['amparo', 'Amparo'], ['ejecucion', 'Ejecución / embargo'], ['ns', 'No sabe']] },
        { id: 'abogado_previo', tipo: 'sino', etiqueta: '¿Tiene otro abogado en el asunto?', opciones: SINO_NS, si: { campo: 'juicio', distinto: 'no' } },
        { id: 'codigo', tipo: 'opcion', etiqueta: 'Legislación procesal aplicable', opciones: [['local', 'Código de procedimientos civiles del estado'], ['cnpcf', 'Código Nacional de Procedimientos Civiles y Familiares'], ['por_definir', 'Por determinar']] },
      ],
    },
    {
      id: 'evaluacion', titulo: '7. Evaluación del abogado',
      campos: [
        { id: 'viabilidad', tipo: 'opcion', etiqueta: 'Viabilidad del caso', opciones: [['alta', 'Alta'], ['media', 'Media'], ['baja', 'Baja'], ['falta_info', 'Falta información para evaluar']] },
        { id: 'prescripcion', tipo: 'sino', etiqueta: '¿Riesgo de prescripción o caducidad?', opciones: SINO_NS },
        { id: 'prescripcion_fecha', tipo: 'fecha', etiqueta: 'Fecha estimada en que prescribe', si: { campo: 'prescripcion', igual: 'si' } },
        { id: 'via', tipo: 'multi', etiqueta: 'Vía recomendada', opciones: [
          ['negociacion', 'Negociación o carta de requerimiento'], ['mediacion', 'Mediación o conciliación'],
          ['notarial', 'Trámite ante notario'], ['administrativa', 'Trámite administrativo'],
          ['ordinario', 'Juicio ordinario civil'], ['oral', 'Juicio oral civil'], ['ejecutivo', 'Juicio ejecutivo'],
          ['hipotecario', 'Juicio especial hipotecario'], ['arrendamiento', 'Controversia de arrendamiento'],
          ['sucesorio', 'Juicio sucesorio'], ['voluntaria', 'Jurisdicción voluntaria'], ['usucapion', 'Juicio de prescripción adquisitiva'],
          ['amparo', 'Amparo'], ['canalizar', 'Canalizar a otra especialidad'],
        ] },
        { id: 'canalizar_a', tipo: 'opcion', etiqueta: 'Canalizar a', si: { campo: 'via', incluye: 'canalizar' }, opciones: [['Derecho Familiar', 'Familiar'], ['Derecho Mercantil', 'Mercantil'], ['Derecho Inmobiliario', 'Inmobiliario'], ['Derecho Agrario', 'Agrario'], ['Derecho Penal', 'Penal'], ['Derecho Fiscal', 'Fiscal'], ['Derecho Migratorio', 'Migratorio']] },
        { id: 'riesgos', tipo: 'parrafo', etiqueta: 'Riesgos y puntos débiles' },
        { id: 'requiere_presencia', tipo: 'sino', etiqueta: '¿El cliente tendrá que presentarse en México?', opciones: SINO_NS },
        { id: 'duracion', tipo: 'opcion', etiqueta: 'Duración estimada', opciones: [['semanas', 'Semanas'], ['1a6m', '1 a 6 meses'], ['6a12m', '6 a 12 meses'], ['mas_1a', 'Más de 1 año']] },
      ],
    },
    {
      id: 'pasos', titulo: '8. Siguientes pasos',
      campos: [
        { id: 'docs_pendientes', tipo: 'multi', etiqueta: 'Documentos que el cliente debe enviar', opciones: [
          ['identificacion', 'Identificación oficial'], ['curp', 'CURP'], ['actas', 'Actas del Registro Civil'], ['contrato', 'Contrato'],
          ['pagare', 'Pagaré'], ['recibos', 'Comprobantes de pago'], ['escrituras', 'Escrituras'], ['predial', 'Boleta predial'],
          ['libertad_gravamen', 'Certificado de libertad de gravámenes'], ['testamento', 'Testamento'], ['fotos', 'Fotos o videos'],
          ['mensajes', 'Mensajes o correos'], ['demanda', 'Copia de la demanda o notificación'],
        ] },
        { id: 'acciones', tipo: 'multi', etiqueta: 'Acciones acordadas', opciones: [
          ['enviar_docs', 'El cliente enviará documentos'], ['otorgar_poder', 'Otorgar poder en el consulado'],
          ['buscar_testamento', 'Buscar aviso de testamento'], ['pedir_certificados', 'Solicitar certificados al Registro Público'],
          ['carta', 'Redactar carta de requerimiento'], ['cotizacion', 'Enviar cotización de servicios'],
          ['segunda_consulta', 'Agendar segunda consulta'], ['sin_accion', 'No se requiere más acción'],
        ] },
        { id: 'servicio_adicional', tipo: 'sino', etiqueta: '¿El caso requiere servicios adicionales del abogado?', opciones: SINO_NS },
        { id: 'cotizacion', tipo: 'dinero', etiqueta: 'Honorarios estimados', si: { campo: 'servicio_adicional', igual: 'si' } },
        { id: 'seguimiento', tipo: 'fecha', etiqueta: 'Fecha de seguimiento' },
      ],
    },
  ],
}
