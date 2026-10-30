import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiPost } from '../lib/api'
import { LogoMark } from '../components/Logo'

const HORAS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']
const money = n => '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const S = {
  card: { background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e6eaf1', boxShadow: '0 2px 12px rgba(0,24,61,.05)' },
  th: { background: '#f6f8fb', padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#5a6782', fontSize: '.74rem', letterSpacing: '.03em', borderBottom: '1px solid #e6eaf1', whiteSpace: 'nowrap' },
  td: { padding: '11px 12px', borderBottom: '1px solid #f0f3f7', color: '#26344d', fontSize: '.85rem', verticalAlign: 'top' },
  btn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', whiteSpace: 'nowrap' },
  badge: (bg, color) => ({ display: 'inline-block', padding: '3px 9px', borderRadius: 20, fontSize: '.72rem', fontWeight: 600, background: bg, color, whiteSpace: 'nowrap' }),
  input: { padding: '9px 11px', border: '1.5px solid #d9dfe8', borderRadius: 8, fontSize: '.88rem', fontFamily: 'var(--sans)', background: '#fff' },
}

function Estado({ c, hoy }) {
  if (c.fecha < hoy) return <span style={S.badge('#f1f3f6', '#5a6782')}>{c.resumen_enviado ? 'Atendida ✓ resumen' : 'Pasada'}</span>
  if (!c.abogado_id) return <span style={S.badge('#fdecea', '#b3261e')}>Sin abogado</span>
  if (!c.aceptada) return <span style={S.badge('#fff8e1', '#7a4f01')}>Por aceptar</span>
  return <span style={S.badge('#e8f5e9', '#1b5e20')}>Confirmada</span>
}

export default function Admin() {
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('consultas')
  const [filtro, setFiltro] = useState('proximas')
  const [busca, setBusca] = useState('')
  const [trabajando, setTrabajando] = useState(null)
  const [mover, setMover] = useState(null) // consulta a reprogramar
  const [aviso, setAviso] = useState('')

  async function cargar() {
    try { setD(await apiPost('/api/admin', { accion: 'resumen' })); setError('') }
    catch (e) { setError(e.message) }
  }
  useEffect(() => { document.title = 'Administración — AbogaMéxico'; cargar() }, [])

  async function accion(clave, body, okMsg) {
    setTrabajando(clave); setAviso('')
    try { await apiPost('/api/admin', body); setAviso(okMsg); await cargar() }
    catch (e) { alert(e.message) }
    setTrabajando(null)
  }

  if (error) return (
    <div style={{ padding: 60, textAlign: 'center', fontFamily: 'var(--sans)' }}>
      <p style={{ marginBottom: 16 }}>{error}</p>
      <Link to="/" style={{ color: 'var(--azul)', fontWeight: 600 }}>← Volver al sitio</Link>
    </div>
  )
  if (!d) return <div style={{ padding: 60, textAlign: 'center', color: '#888', fontFamily: 'var(--sans)' }}>Cargando…</div>

  const n = d.numeros
  const q = busca.trim().toLowerCase()
  const consultas = d.consultas
    .filter(c => filtro === 'todas' ? true
      : filtro === 'proximas' ? c.fecha >= d.hoy
      : filtro === 'sin_abogado' ? !c.abogado_id && c.fecha >= d.hoy
      : filtro === 'por_aceptar' ? c.abogado_id && !c.aceptada && c.fecha >= d.hoy
      : c.fecha < d.hoy)
    .filter(c => !q || [c.cliente, c.cliente_email, c.abogado, c.especialidad].some(x => (x || '').toLowerCase().includes(q)))
    .sort((a, b) => filtro === 'pasadas' || filtro === 'todas' ? (b.fecha + b.hora).localeCompare(a.fecha + a.hora) : (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
  const verificados = d.abogados.filter(a => a.verificado)

  const tarjetas = [
    ['Ingresos', money(n.ingresos) + ' USD', 'var(--acento)'],
    ['Consultas pagadas', n.pagadas, '#B9CEED'],
    ['Próximas', n.proximas, '#27ae60'],
    ['Sin abogado', n.sinAbogado, n.sinAbogado ? '#e74c3c' : '#d9dfe8'],
    ['Por aceptar', n.porAceptar, n.porAceptar ? '#f39c12' : '#d9dfe8'],
    ['Abogados por aprobar', n.abogadosPendientes, n.abogadosPendientes ? '#f39c12' : '#d9dfe8'],
  ]

  return (
    <div style={{ background: 'var(--gris)', minHeight: '100vh', fontFamily: 'var(--sans)' }}>
      <nav style={{ background: 'var(--azul)', height: 62, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}><LogoMark size={28} /></Link>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 700, color: '#fff' }}>Administración</span>
        <button onClick={cargar} style={{ ...S.btn, marginLeft: 'auto', background: 'rgba(185,206,237,.15)', color: '#fff' }}>↻ Actualizar</button>
      </nav>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {tarjetas.map(([l, v, c]) => (
            <div key={l} style={{ ...S.card, borderTop: `4px solid ${c}`, padding: '14px 16px' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--azul)' }}>{v}</div>
              <div style={{ fontSize: '.76rem', color: '#6b778c', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {aviso && <div role="status" style={{ background: '#e8f5e9', color: '#1b5e20', borderRadius: 10, padding: '10px 14px', fontSize: '.88rem' }}>✓ {aviso}</div>}

        <div role="tablist" style={{ display: 'flex', gap: 8 }}>
          {[['consultas', 'Consultas'], ['abogados', `Abogados (${d.abogados.length})`]].map(([k, t]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              style={{ ...S.btn, padding: '10px 16px', fontSize: '.9rem', background: tab === k ? 'var(--azul)' : '#fff', color: tab === k ? '#fff' : 'var(--azul)', border: '1px solid #d9dfe8' }}>{t}</button>
          ))}
        </div>

        {tab === 'consultas' && (
          <section style={S.card}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
              {[['proximas', 'Próximas'], ['sin_abogado', `Sin abogado (${n.sinAbogado})`], ['por_aceptar', `Por aceptar (${n.porAceptar})`], ['pasadas', 'Pasadas'], ['todas', 'Todas']].map(([k, t]) => (
                <button key={k} onClick={() => setFiltro(k)} style={{ ...S.btn, background: filtro === k ? '#eef2f8' : 'transparent', color: 'var(--azul)', border: filtro === k ? '1px solid var(--azul)' : '1px solid #e1e6ee' }}>{t}</button>
              ))}
              <input aria-label="Buscar" placeholder="Buscar cliente, abogado o rama…" value={busca} onChange={e => setBusca(e.target.value)} style={{ ...S.input, marginLeft: 'auto', minWidth: 220 }} />
            </div>
            {consultas.length === 0 ? <p style={{ color: '#888', padding: 20, textAlign: 'center' }}>No hay consultas en esta vista.</p> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr>{['Fecha', 'Cliente', 'Rama', 'Abogado', 'Estado', 'Acciones'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                  <tbody>{consultas.map(c => {
                    const opciones = verificados.filter(a => a.especialidades.includes(c.especialidad))
                    return (
                      <tr key={c.id}>
                        <td style={S.td}><strong>{c.fecha}</strong><br /><span style={{ color: '#6b778c' }}>{c.hora}</span></td>
                        <td style={S.td}>{c.cliente}<br /><span style={{ color: '#6b778c', fontSize: '.78rem' }}>{c.cliente_email}{c.cliente_lugar ? ' · ' + c.cliente_lugar : ''}</span>
                          {c.descripcion && <div style={{ color: '#6b778c', fontSize: '.78rem', marginTop: 4, maxWidth: 260 }}>“{c.descripcion}”</div>}</td>
                        <td style={S.td}>{c.especialidad}<br /><span style={{ color: '#6b778c', fontSize: '.78rem' }}>{money(c.monto)} USD</span></td>
                        <td style={S.td}>
                          <select aria-label="Asignar abogado" value={c.abogado_id || ''} disabled={trabajando === 'a' + c.id || c.fecha < d.hoy}
                            onChange={e => e.target.value && accion('a' + c.id, { accion: 'asignar', consulta_id: c.id, abogado_id: e.target.value }, 'Consulta asignada; el abogado recibió el aviso por correo.')}
                            style={{ ...S.input, maxWidth: 210, padding: '7px 9px', fontSize: '.82rem' }}>
                            <option value="">{opciones.length ? '— Asignar —' : 'Nadie atiende esta rama'}</option>
                            {opciones.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                            {c.abogado_id && !opciones.some(a => a.id === c.abogado_id) && <option value={c.abogado_id}>{c.abogado}</option>}
                          </select>
                        </td>
                        <td style={S.td}><Estado c={c} hoy={d.hoy} /></td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {c.fecha >= d.hoy && <button onClick={() => setMover({ ...c, nuevaFecha: c.fecha, nuevaHora: c.hora })} style={{ ...S.btn, background: '#eef2f8', color: 'var(--azul)' }}>Cambiar horario</button>}
                            {c.meet_link && <a href={c.meet_link} target="_blank" rel="noreferrer" style={{ ...S.btn, background: '#eef2f8', color: 'var(--azul)', textDecoration: 'none' }}>Meet</a>}
                            {c.stripe_payment_id && <a href={'https://dashboard.stripe.com/payments/' + c.stripe_payment_id} target="_blank" rel="noreferrer" style={{ ...S.btn, background: '#eef2f8', color: 'var(--azul)', textDecoration: 'none' }}>Pago</a>}
                          </div>
                        </td>
                      </tr>
                    )
                  })}</tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === 'abogados' && (
          <section style={S.card}>
            <p style={{ fontSize: '.84rem', color: '#5a6782', marginBottom: 12 }}>Revisa la cédula en el <a href="https://www.cedulaprofesional.sep.gob.mx/" target="_blank" rel="noreferrer" style={{ color: 'var(--azul)', textDecoration: 'underline' }}>Registro Nacional de Profesionistas</a> antes de aprobar. Solo los abogados aprobados reciben consultas.</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr>{['Abogado', 'Cédula', 'Especialidades', 'Ubicación', 'Consultas', 'Estado'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>{d.abogados.map(a => (
                  <tr key={a.id}>
                    <td style={S.td}><strong>{a.nombre}</strong><br /><span style={{ color: '#6b778c', fontSize: '.78rem' }}>{a.email}{a.telefono ? ' · ' + a.telefono : ''}</span></td>
                    <td style={S.td}>{a.cedula || '—'}</td>
                    <td style={S.td}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 300 }}>{a.especialidades.map(e => <span key={e} style={S.badge('#eef2f8', 'var(--azul)')}>{e.replace('Derecho ', '')}</span>)}</div></td>
                    <td style={S.td}>{[a.ciudad, a.estado].filter(Boolean).join(', ') || '—'}</td>
                    <td style={S.td}>{a.consultas}</td>
                    <td style={S.td}>
                      {a.verificado
                        ? <button disabled={trabajando === 'v' + a.id} onClick={() => window.confirm(`¿Pausar a ${a.nombre}? Dejará de recibir consultas nuevas.`) && accion('v' + a.id, { accion: 'verificar', abogado_id: a.id, verificado: false }, `${a.nombre} quedó pausado.`)} style={{ ...S.btn, background: '#e8f5e9', color: '#1b5e20' }}>✓ Aprobado · pausar</button>
                        : <button disabled={trabajando === 'v' + a.id} onClick={() => accion('v' + a.id, { accion: 'verificar', abogado_id: a.id, verificado: true }, `${a.nombre} fue aprobado y ya puede recibir consultas.`)} style={{ ...S.btn, background: 'var(--grad-acento)', color: 'var(--sobre-acento)' }}>Aprobar</button>}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {mover && (
        <div role="dialog" aria-modal="true" aria-label="Cambiar horario" onClick={() => setMover(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,17,40,.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 26, maxWidth: 440, width: '100%' }}>
            <h3 style={{ fontFamily: 'var(--display)', color: 'var(--azul)', marginBottom: 6 }}>Cambiar horario</h3>
            <p style={{ fontSize: '.85rem', color: '#5a6782', marginBottom: 16 }}>{mover.cliente} · {mover.especialidad}. Se avisa por correo al cliente y al abogado; el enlace de Meet no cambia.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '.8rem', fontWeight: 600, color: '#26344d' }}>Fecha
                <input type="date" min={d.hoy} value={mover.nuevaFecha} onChange={e => setMover(m => ({ ...m, nuevaFecha: e.target.value }))} style={S.input} /></label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '.8rem', fontWeight: 600, color: '#26344d' }}>Hora (Centro de México)
                <select value={mover.nuevaHora} onChange={e => setMover(m => ({ ...m, nuevaHora: e.target.value }))} style={S.input}>{HORAS.map(h => <option key={h}>{h}</option>)}</select></label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button disabled={trabajando === 'r'} onClick={async () => { await accion('r', { accion: 'reprogramar', consulta_id: mover.id, fecha: mover.nuevaFecha, hora: mover.nuevaHora }, 'Horario cambiado; se avisó al cliente y al abogado.'); setMover(null) }}
                style={{ ...S.btn, padding: '10px 18px', fontSize: '.9rem', background: 'var(--grad-acento)', color: 'var(--sobre-acento)' }}>{trabajando === 'r' ? 'Guardando…' : 'Guardar y avisar'}</button>
              <button onClick={() => setMover(null)} style={{ ...S.btn, padding: '10px 18px', fontSize: '.9rem', background: 'transparent', color: '#5a6782', border: '1px solid #d9dfe8' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
