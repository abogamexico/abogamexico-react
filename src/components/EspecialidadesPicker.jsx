// Selector de varias especialidades (casillas con forma de botón)
export const ESPECIALIDADES = ['Derecho Civil','Derecho Migratorio','Derecho Familiar','Derecho Penal','Derecho Inmobiliario','Derecho Mercantil','Derecho Fiscal','Seguridad Social','Derecho Administrativo','Derecho Agrario']

// Especialidades de un abogado, aunque venga de la versión vieja (solo "especialidad")
export const especialidadesDe = a => (a?.especialidades?.length ? a.especialidades : a?.especialidad ? [a.especialidad] : [])

export default function EspecialidadesPicker({ value = [], onChange }) {
  function toggle(e) {
    onChange(value.includes(e) ? value.filter(x => x !== e) : [...value, e])
  }
  return (
    <div role="group" aria-label="Especialidades" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {ESPECIALIDADES.map(e => {
        const on = value.includes(e)
        return (
          <label key={e} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 20, cursor: 'pointer',
            fontSize: '.82rem', fontWeight: 600, userSelect: 'none', transition: 'all .15s',
            border: on ? '1.5px solid var(--azul)' : '1.5px solid #d5dbe5',
            background: on ? 'var(--azul)' : '#fff', color: on ? '#fff' : '#445',
          }}>
            <input type="checkbox" checked={on} onChange={() => toggle(e)} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
            <span aria-hidden="true">{on ? '✓' : '+'}</span>{e.replace('Derecho ', '')}
          </label>
        )
      })}
    </div>
  )
}
