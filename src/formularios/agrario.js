// Expediente · Derecho Agrario (ejidos y comunidades, Ley Agraria)
import { SINO_NS, asunto, cliente, partes, hechos, documentos, procesal, evaluacion, pasos, DOCS_BASE, DOCS_FIN } from './comunes'

export default {
  id: 'agrario',
  especialidad: 'Derecho Agrario',
  titulo: 'Expediente · Derecho Agrario',
  secciones: [
    asunto({
      asuntos: [
        ['sucesion', 'Heredar derechos ejidales o parcela'], ['lista_sucesores', 'Hacer o cambiar la lista de sucesores'], ['certificado', 'Obtener o corregir certificado parcelario'],
        ['limites', 'Conflicto de límites o invasión de parcela'], ['venta', 'Vender o comprar derechos parcelarios'], ['dominio_pleno', 'Dominio pleno (pasar a propiedad privada)'],
        ['reconocimiento', 'Ser reconocido como ejidatario, posesionario o avecindado'], ['asamblea', 'Problemas con la asamblea o el comisariado'],
        ['solar', 'Solar urbano en el ejido'], ['comunal', 'Tierras comunales'], ['contrato', 'Rentar o dar en aparcería una parcela'],
      ],
      objetivos: [
        ['heredar', 'Quedarse con la parcela de un familiar'], ['dejar_ordenado', 'Dejar ordenado quién hereda'], ['recuperar', 'Recuperar o defender su parcela'],
        ['vender', 'Vender'], ['titulo', 'Tener sus documentos en regla'],
      ],
    }),
    cliente(),
    partes({
      roles: [['ejidatario', 'Ejidatario'], ['comunero', 'Comunero'], ['posesionario', 'Posesionario'], ['avecindado', 'Avecindado'], ['sucesor', 'Posible heredero'], ['tercero', 'Persona ajena al ejido']],
      relaciones: [['familiar', 'Familiar'], ['vecino', 'Vecino de parcela'], ['comisariado', 'Comisariado ejidal'], ['asamblea', 'Asamblea'], ['comprador', 'Comprador o vendedor'], ['otro', 'Otro']],
    }),
    hechos({ estadoEtiqueta: 'Estado donde está el ejido o comunidad', intentos: [['comisariado', 'Habló con el comisariado'], ['procuraduria', 'Fue a la Procuraduría Agraria'], ['ran', 'Fue al Registro Agrario Nacional'], ['asamblea', 'Llevó el tema a la asamblea']] }),
    {
      id: 'nucleo', titulo: 'El ejido o comunidad y la parcela',
      campos: [
        { id: 'nuc_nombre', tipo: 'texto', etiqueta: 'Nombre del ejido o comunidad' },
        { id: 'nuc_tipo_tierra', tipo: 'multi', etiqueta: 'Tipo de tierra', opciones: [['parcela', 'Parcela'], ['uso_comun', 'Uso común'], ['solar', 'Solar urbano']] },
        { id: 'nuc_superficie', tipo: 'texto', etiqueta: 'Superficie (hectáreas)' },
        { id: 'nuc_certificado', tipo: 'opcion', etiqueta: 'Documento con que cuenta', opciones: [['certificado_parcelario', 'Certificado parcelario'], ['certificado_derechos', 'Certificado de derechos sobre tierras de uso común'], ['titulo_solar', 'Título de solar'], ['constancia', 'Solo constancia del comisariado'], ['ninguno', 'Ninguno']] },
        { id: 'nuc_a_nombre', tipo: 'texto', etiqueta: '¿A nombre de quién está?' },
        { id: 'nuc_procede', tipo: 'sino', etiqueta: '¿El ejido está certificado (PROCEDE o FANAR)?', opciones: SINO_NS },
        { id: 'nuc_ocupa', tipo: 'texto', etiqueta: '¿Quién trabaja u ocupa hoy la tierra?' },
      ],
    },
    {
      id: 'sucesion', titulo: 'Sucesión agraria', si: { campo: 'asuntos', incluyeAlguno: ['sucesion', 'lista_sucesores'] },
      campos: [
        { id: 'suc_titular', tipo: 'texto', etiqueta: 'Nombre del titular de los derechos' },
        { id: 'suc_vive', tipo: 'opcion', etiqueta: 'El titular…', opciones: [['vive', 'Vive'], ['fallecio', 'Falleció']] },
        { id: 'suc_fecha', tipo: 'fecha', etiqueta: 'Fecha de fallecimiento', si: { campo: 'suc_vive', igual: 'fallecio' } },
        { id: 'suc_lista', tipo: 'sino', etiqueta: '¿Dejó lista de sucesión depositada en el RAN o ante notario?', opciones: SINO_NS },
        { id: 'suc_parentesco', tipo: 'opcion', etiqueta: 'Parentesco del cliente', opciones: [['conyuge', 'Cónyuge'], ['concubino', 'Concubino'], ['hijo', 'Hijo'], ['ascendiente', 'Padre o madre'], ['otro', 'Otro dependiente']] },
        { id: 'suc_conflicto', tipo: 'sino', etiqueta: '¿Hay otros familiares que también la reclaman?', opciones: SINO_NS },
        { id: 'suc_plazo', tipo: 'sino', etiqueta: '¿Ha pasado tiempo sin que nadie haga el trámite de sucesión?', opciones: SINO_NS, si: { campo: 'suc_vive', igual: 'fallecio' } },
      ],
    },
    {
      id: 'venta', titulo: 'Venta o dominio pleno', si: { campo: 'asuntos', incluyeAlguno: ['venta', 'dominio_pleno'] },
      campos: [
        { id: 'ven_comprador', tipo: 'opcion', etiqueta: 'El comprador es…', opciones: [['ejidatario', 'Ejidatario'], ['avecindado', 'Avecindado'], ['externo', 'Persona ajena al ejido']] },
        { id: 'ven_tanto', tipo: 'sino', etiqueta: '¿Se notificó el derecho del tanto a la familia?', opciones: SINO_NS },
        { id: 'ven_precio', tipo: 'dinero', etiqueta: 'Precio' },
        { id: 'ven_asamblea_dp', tipo: 'sino', etiqueta: '¿La asamblea ya autorizó el dominio pleno?', opciones: SINO_NS, si: { campo: 'asuntos', incluye: 'dominio_pleno' } },
      ],
    },
    documentos([
      ...DOCS_BASE, ['certificado_parcelario', 'Certificado parcelario'], ['constancia_ran', 'Constancia del RAN'], ['lista_sucesion', 'Lista de sucesión'],
      ['acta_asamblea', 'Acta de asamblea'], ['acta_defuncion', 'Acta de defunción del titular'], ['actas_parentesco', 'Actas que prueban el parentesco'],
      ['contrato', 'Contrato de cesión o renta'], ['plano', 'Plano de la parcela'], ...DOCS_FIN,
    ]),
    procesal({
      situaciones: [['procuraduria', 'Hay trámite en la Procuraduría Agraria'], ['ran', 'Hay trámite en el RAN'], ['tribunal', 'Hay juicio en el Tribunal Agrario'], ['amparo', 'Hay amparo']],
      autoridadEtiqueta: 'Tribunal Unitario Agrario, RAN o Procuraduría (y distrito)',
      etapas: [['demanda', 'Demanda'], ['audiencia', 'Audiencia'], ['pruebas', 'Pruebas'], ['sentencia', 'Sentencia'], ['revision', 'Recurso de revisión'], ['ejecucion', 'Ejecución']],
      codigos: [['ley_agraria', 'Ley Agraria'], ['reglamento_interno', 'Reglamento interno del ejido']],
    }),
    evaluacion({
      especialidad: 'Derecho Agrario',
      vias: [
        ['ran_sucesion', 'Trámite de sucesión en el RAN (con lista de sucesores)'], ['juicio_sucesorio_agrario', 'Juicio sucesorio ante el Tribunal Agrario'],
        ['deposito_lista', 'Depositar lista de sucesión'], ['conciliacion_pa', 'Conciliación en la Procuraduría Agraria'], ['controversia', 'Controversia agraria (límites, posesión)'],
        ['reconocimiento', 'Reconocimiento de calidad agraria'], ['enajenacion', 'Enajenación de derechos parcelarios'], ['dominio_pleno', 'Dominio pleno'],
        ['nulidad_asamblea', 'Nulidad de acuerdo de asamblea'], ['amparo', 'Amparo agrario'],
      ],
    }),
    pasos({
      docs: [...DOCS_BASE, ['certificado_parcelario', 'Certificado parcelario'], ['constancia_ran', 'Constancia de vigencia de derechos del RAN'], ['acta_defuncion', 'Acta de defunción'], ['actas_parentesco', 'Actas de parentesco'], ['acta_asamblea', 'Acta de asamblea']],
      acciones: [['consultar_ran', 'Consultar al RAN si hay lista de sucesión'], ['procuraduria', 'Acudir a la Procuraduría Agraria'], ['depositar_lista', 'Preparar lista de sucesores'], ['otorgar_poder', 'Otorgar poder en el consulado']],
    }),
  ],
}
