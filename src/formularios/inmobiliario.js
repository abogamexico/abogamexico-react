// Expediente · Derecho Inmobiliario
import { SINO_NS, asunto, cliente, partes, hechos, documentos, procesal, evaluacion, pasos, DOCS_BASE, DOCS_FIN } from './comunes'

export default {
  id: 'inmobiliario',
  especialidad: 'Derecho Inmobiliario',
  titulo: 'Expediente · Derecho Inmobiliario',
  secciones: [
    asunto({
      asuntos: [
        ['comprar', 'Comprar un inmueble en México'], ['vender', 'Vender un inmueble estando en EE.UU.'], ['escriturar', 'Escriturar o regularizar'],
        ['credito', 'Crédito Infonavit, Fovissste o bancario'], ['cancelar_hipoteca', 'Cancelar hipoteca ya pagada'], ['fraccionamiento', 'Lote en fraccionamiento irregular'],
        ['condominio', 'Condominio (cuotas, asamblea, reglamento)'], ['construccion', 'Construcción, constructora o vicios ocultos'],
        ['invasion', 'Invasión o despojo'], ['fideicomiso', 'Fideicomiso en zona restringida (costas y fronteras)'], ['renta', 'Rentar un inmueble (contrato)'],
        ['impuestos', 'Predial, traslado de dominio o ISR por venta'],
      ],
      objetivos: [
        ['comprar_seguro', 'Comprar con seguridad'], ['vender', 'Vender'], ['escriturar', 'Tener escrituras a su nombre'],
        ['recuperar', 'Recuperar el inmueble'], ['liberar', 'Liberar el inmueble de deudas o gravámenes'], ['rentar', 'Rentarlo con un buen contrato'],
      ],
    }),
    cliente(),
    partes({
      roles: [['comprador', 'Comprador'], ['vendedor', 'Vendedor'], ['propietario', 'Propietario'], ['poseedor', 'Poseedor sin escrituras'], ['acreditado', 'Acreditado (tiene crédito)'], ['condomino', 'Condómino']],
      relaciones: [['particular', 'Particular'], ['familiar', 'Familiar'], ['inmobiliaria', 'Inmobiliaria o desarrolladora'], ['banco', 'Banco o instituto de vivienda'], ['administrador', 'Administrador del condominio'], ['invasor', 'Ocupante sin derecho']],
    }),
    hechos({ estadoEtiqueta: 'Estado donde está el inmueble', intentos: [['notario', 'Fue con notario'], ['registro', 'Consultó el Registro Público'], ['catastro', 'Fue a catastro o predial'], ['hablar', 'Habló con la otra parte']] }),
    {
      id: 'inmueble', titulo: 'El inmueble',
      campos: [
        { id: 'inm_tipo', tipo: 'opcion', etiqueta: 'Tipo', opciones: [['casa', 'Casa'], ['depto', 'Departamento'], ['terreno', 'Terreno'], ['local', 'Local comercial'], ['rancho', 'Rancho o terreno rústico'], ['ejidal', 'Ejidal (ver Derecho Agrario)']] },
        { id: 'inm_direccion', tipo: 'texto', etiqueta: 'Colonia y municipio' },
        { id: 'inm_situacion', tipo: 'opcion', etiqueta: 'Situación jurídica', opciones: [['escriturado_cliente', 'Escriturado a nombre del cliente'], ['escriturado_otro', 'Escriturado a nombre de otra persona'], ['contrato_privado', 'Solo contrato privado'], ['sin_documentos', 'Sin documentos'], ['herencia', 'Viene de una herencia sin tramitar'], ['ns', 'No sabe']] },
        { id: 'inm_valor', tipo: 'dinero', etiqueta: 'Valor aproximado' },
        { id: 'inm_predial', tipo: 'sino', etiqueta: '¿Predial al corriente?', opciones: SINO_NS },
        { id: 'inm_gravamen', tipo: 'sino', etiqueta: '¿Tiene hipoteca, embargo u otro gravamen?', opciones: SINO_NS },
        { id: 'inm_ocupado', tipo: 'opcion', etiqueta: '¿Quién lo ocupa?', opciones: [['vacio', 'Está vacío'], ['familiar', 'Un familiar'], ['inquilino', 'Un inquilino'], ['tercero', 'Un tercero sin permiso'], ['cliente', 'El cliente']] },
      ],
    },
    {
      id: 'operacion', titulo: 'Compraventa', si: { campo: 'asuntos', incluyeAlguno: ['comprar', 'vender'] },
      campos: [
        { id: 'op_precio', tipo: 'dinero', etiqueta: 'Precio pactado' },
        { id: 'op_anticipo', tipo: 'dinero', etiqueta: 'Anticipo ya entregado' },
        { id: 'op_forma_pago', tipo: 'opcion', etiqueta: 'Forma de pago', opciones: [['contado', 'Contado'], ['credito', 'Crédito'], ['plazos', 'Pagos a plazos con el vendedor']] },
        { id: 'op_notario', tipo: 'sino', etiqueta: '¿Ya eligieron notario?', opciones: SINO_NS },
        { id: 'op_vendedor_dueno', tipo: 'sino', etiqueta: '¿El vendedor aparece como dueño en el Registro Público?', opciones: SINO_NS },
        { id: 'op_casado', tipo: 'sino', etiqueta: '¿El vendedor está casado por sociedad conyugal (firma del cónyuge)?', opciones: SINO_NS },
        { id: 'op_extranjero', tipo: 'sino', etiqueta: '¿Algún comprador es extranjero?', opciones: SINO_NS },
      ],
    },
    {
      id: 'credito', titulo: 'Crédito de vivienda', si: { campo: 'asuntos', incluyeAlguno: ['credito', 'cancelar_hipoteca'] },
      campos: [
        { id: 'cre_institucion', tipo: 'opcion', etiqueta: 'Institución', opciones: [['infonavit', 'Infonavit'], ['fovissste', 'Fovissste'], ['banco', 'Banco'], ['otro', 'Otro']] },
        { id: 'cre_numero', tipo: 'texto', etiqueta: 'Número de crédito' },
        { id: 'cre_estado', tipo: 'opcion', etiqueta: 'Estado del crédito', opciones: [['corriente', 'Al corriente'], ['atraso', 'Con atraso'], ['demanda', 'Demandado o en juicio'], ['liquidado', 'Liquidado'], ['cedido', 'Vendido a un despacho de cobranza']] },
        { id: 'cre_saldo', tipo: 'dinero', etiqueta: 'Saldo pendiente' },
        { id: 'cre_carta', tipo: 'sino', etiqueta: '¿Tiene carta de liberación o de no adeudo?', opciones: SINO_NS, si: { campo: 'cre_estado', igual: 'liquidado' } },
      ],
    },
    {
      id: 'condominio', titulo: 'Condominio', si: { campo: 'asuntos', incluye: 'condominio' },
      campos: [
        { id: 'con_problema', tipo: 'multi', etiqueta: 'Problema', opciones: [['cuotas', 'Cuotas adeudadas'], ['obras', 'Obras o daños en áreas comunes'], ['vecino', 'Conflicto con un vecino'], ['administracion', 'Mala administración'], ['reglamento', 'Reglamento']] },
        { id: 'con_adeudo', tipo: 'dinero', etiqueta: 'Monto de cuotas adeudadas' },
      ],
    },
    {
      id: 'construccion', titulo: 'Construcción', si: { campo: 'asuntos', incluye: 'construccion' },
      campos: [
        { id: 'cons_problema', tipo: 'multi', etiqueta: 'Problema', opciones: [['no_entrega', 'No entregaron la vivienda'], ['vicios', 'Vicios ocultos o defectos'], ['abandono', 'El constructor abandonó la obra'], ['permisos', 'Falta de permisos o licencia'], ['sobrecosto', 'Cobros adicionales']] },
        { id: 'cons_contrato', tipo: 'sino', etiqueta: '¿Hay contrato de obra?', opciones: SINO_NS },
        { id: 'cons_pagado', tipo: 'dinero', etiqueta: 'Total pagado' },
      ],
    },
    documentos([
      ...DOCS_BASE, ['escrituras', 'Escrituras'], ['contrato_privado', 'Contrato privado de compraventa'], ['predial', 'Boletas de predial'],
      ['agua', 'Recibos de agua'], ['libertad_gravamen', 'Certificado de libertad de gravámenes'], ['plano', 'Plano o croquis'], ['avaluo', 'Avalúo'],
      ['credito', 'Documentos del crédito'], ['constancia_no_adeudo', 'Constancia de no adeudo'], ['reglamento', 'Reglamento de condominio'], ...DOCS_FIN,
    ]),
    procesal({
      situaciones: [['notarial', 'Hay un trámite ante notario'], ['registro', 'Hay un trámite en el Registro Público'], ['si_actor', 'El cliente demandó'], ['si_demandado', 'Al cliente lo demandaron'], ['profeco', 'Hay una queja ante PROFECO']],
      etapas: [['demanda', 'Demanda'], ['contestacion', 'Contestación'], ['pruebas', 'Pruebas'], ['sentencia', 'Sentencia'], ['apelacion', 'Apelación'], ['ejecucion', 'Ejecución o lanzamiento']],
      codigos: [['civil_estado', 'Código civil del estado'], ['condominio_estado', 'Ley de condominio del estado'], ['cnpcf', 'Código Nacional de Procedimientos Civiles y Familiares']],
    }),
    evaluacion({
      especialidad: 'Derecho Inmobiliario',
      vias: [
        ['revision_titulo', 'Revisión de escrituras y gravámenes antes de pagar'], ['escritura_notarial', 'Escrituración ante notario'],
        ['poder', 'Poder para vender o comprar desde EE.UU.'], ['regularizacion', 'Programa de regularización del estado o municipio'],
        ['usucapion', 'Juicio de prescripción adquisitiva'], ['otorgamiento', 'Juicio de otorgamiento y firma de escritura'],
        ['reivindicatoria', 'Acción reivindicatoria'], ['cancelacion_hipoteca', 'Cancelación de hipoteca'], ['profeco', 'Queja ante PROFECO'],
        ['denuncia_despojo', 'Denuncia penal por despojo'], ['fideicomiso', 'Fideicomiso bancario'],
      ],
    }),
    pasos({
      docs: [...DOCS_BASE, ['escrituras', 'Copia de escrituras'], ['contrato_privado', 'Contrato privado'], ['predial', 'Última boleta de predial'], ['libertad_gravamen', 'Certificado de libertad de gravámenes'], ['credito', 'Estado de cuenta del crédito'], ['fotos', 'Fotos del inmueble']],
      acciones: [['pedir_certificado', 'Pedir certificado de libertad de gravámenes'], ['cotizar_notario', 'Cotizar con notario'], ['otorgar_poder', 'Otorgar poder en el consulado'], ['avaluo', 'Solicitar avalúo'], ['carta_liberacion', 'Solicitar carta de liberación']],
    }),
  ],
}
