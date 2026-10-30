import { visible } from '../formularios'

// Dibuja un formulario de expediente a partir de su definición (src/formularios/*.js)
const st = {
  card: { background: '#fff', borderRadius: 14, padding: '22px 24px', border: '1px solid #e6eaf1', boxShadow: '0 2px 12px rgba(0,24,61,.05)' },
  h: { fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--azul)', marginBottom: 16 },
  campo: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 },
  label: { fontSize: '.86rem', fontWeight: 600, color: '#26344d' },
  ayuda: { fontSize: '.76rem', color: '#6b778c', marginTop: -4 },
  input: { padding: '11px 13px', border: '1.5px solid #d9dfe8', borderRadius: 9, fontSize: '.92rem', color: '#111', background: '#fff', fontFamily: 'var(--sans)', width: '100%' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
}

function Chip({ on, onClick, children, tipo = 'checkbox', name }) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 20, cursor: 'pointer',
      fontSize: '.84rem', fontWeight: 500, userSelect: 'none', transition: 'all .12s', lineHeight: 1.3,
      border: on ? '1.5px solid var(--azul)' : '1.5px solid #d5dbe5',
      background: on ? 'var(--azul)' : '#fff', color: on ? '#fff' : '#33415c',
    }}>
      <input type={tipo} name={name} checked={on} onChange={onClick} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
      {tipo === 'checkbox' && <span aria-hidden="true" style={{ fontWeight: 700 }}>{on ? '✓' : '+'}</span>}
      {children}
    </label>
  )
}

function Campo({ campo, valor, cambiar }) {
  const id = 'f_' + campo.id
  const set = v => cambiar(campo.id, v)
  let control
  switch (campo.tipo) {
    case 'parrafo':
      control = <textarea id={id} rows={4} style={{ ...st.input, resize: 'vertical', minHeight: 96 }} value={valor || ''} onChange={e => set(e.target.value)} />
      break
    case 'numero':
      control = <input id={id} type="number" min="0" inputMode="numeric" style={{ ...st.input, maxWidth: 180 }} value={valor ?? ''} onChange={e => set(e.target.value)} />
      break
    case 'fecha':
      control = <input id={id} type="date" style={{ ...st.input, maxWidth: 220 }} value={valor || ''} onChange={e => set(e.target.value)} />
      break
    case 'dinero': {
      const v = valor || {}
      control = (
        <div style={{ display: 'flex', gap: 8, maxWidth: 320 }}>
          <input id={id} type="number" min="0" inputMode="decimal" placeholder="0.00" style={st.input} value={v.monto ?? ''} onChange={e => set({ ...v, monto: e.target.value, moneda: v.moneda || 'MXN' })} />
          <select aria-label="Moneda" style={{ ...st.input, width: 100 }} value={v.moneda || 'MXN'} onChange={e => set({ ...v, moneda: e.target.value })}>
            <option>MXN</option><option>USD</option>
          </select>
        </div>
      )
      break
    }
    case 'multi': {
      const arr = Array.isArray(valor) ? valor : []
      control = (
        <div role="group" aria-labelledby={id + '_l'} style={st.chips}>
          {campo.opciones.map(([v, t]) => (
            <Chip key={v} on={arr.includes(v)} onClick={() => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v])}>{t}</Chip>
          ))}
        </div>
      )
      break
    }
    case 'opcion':
    case 'sino':
      if (campo.opciones.length <= 6) {
        control = (
          <div role="radiogroup" aria-labelledby={id + '_l'} style={st.chips}>
            {campo.opciones.map(([v, t]) => (
              <Chip key={v} tipo="radio" name={id} on={valor === v} onClick={() => set(valor === v ? '' : v)}>{t}</Chip>
            ))}
          </div>
        )
      } else {
        control = (
          <select id={id} style={{ ...st.input, maxWidth: 420 }} value={valor || ''} onChange={e => set(e.target.value)}>
            <option value="">Selecciona…</option>
            {campo.opciones.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        )
      }
      break
    default:
      control = <input id={id} type="text" style={st.input} value={valor || ''} onChange={e => set(e.target.value)} />
  }
  const usaLabel = ['parrafo', 'numero', 'fecha', 'dinero', 'texto'].includes(campo.tipo) || (campo.tipo !== 'multi' && campo.opciones?.length > 6)
  return (
    <div style={st.campo}>
      {usaLabel
        ? <label htmlFor={id} id={id + '_l'} style={st.label}>{campo.etiqueta}</label>
        : <span id={id + '_l'} style={st.label}>{campo.etiqueta}</span>}
      {campo.ayuda && <span style={st.ayuda}>{campo.ayuda}</span>}
      {control}
    </div>
  )
}

export function seccionesVisibles(form, datos) {
  return form.secciones.filter(s => visible(s.si, datos))
}

export function seccionLlena(seccion, datos) {
  return seccion.campos.some(c => {
    const v = datos[c.id]
    return Array.isArray(v) ? v.length > 0 : v && typeof v === 'object' ? !!v.monto : !!v
  })
}

export default function FormularioCaso({ form, datos, onChange }) {
  const cambiar = (k, v) => onChange({ ...datos, [k]: v })
  return (
    <>
      {seccionesVisibles(form, datos).map(s => (
        <section key={s.id} id={'sec_' + s.id} style={{ ...st.card, scrollMarginTop: 90, ...(s.si ? { borderLeft: '4px solid var(--acento)' } : {}) }}>
          <h2 style={st.h}>{s.titulo}</h2>
          {s.campos.filter(c => visible(c.si, datos)).map(c => <Campo key={c.id} campo={c} valor={datos[c.id]} cambiar={cambiar} />)}
        </section>
      ))}
    </>
  )
}
