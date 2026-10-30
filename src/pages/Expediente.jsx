import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { apiPost } from '../lib/api'
import { LogoMark } from '../components/Logo'
import FormularioCaso, { seccionesVisibles, seccionLlena } from '../components/FormularioCaso'
import { formularioPara, borradorResumen } from '../formularios'

const salaUrl = c => c?.meet_link || (c?.jitsi_room ? 'https://meet.jit.si/' + c.jitsi_room : null)
const fechaLarga = f => {
  const [Y, M, D] = String(f || '').split('-').map(Number)
  return Y ? new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(Y, M - 1, D))) : '—'
}

const S = {
  card: { background: '#fff', borderRadius: 14, padding: '22px 24px', border: '1px solid #e6eaf1', boxShadow: '0 2px 12px rgba(0,24,61,.05)' },
  h: { fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--azul)', marginBottom: 12 },
  dato: { fontSize: '.88rem', color: '#26344d', lineHeight: 1.6 },
  k: { color: '#6b778c', display: 'inline-block', minWidth: 90 },
  btn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 18px', borderRadius: 9, fontSize: '.9rem', fontWeight: 700, cursor: 'pointer', border: 'none', textDecoration: 'none' },
  input: { padding: '12px 14px', border: '1.5px solid #d9dfe8', borderRadius: 9, fontSize: '.92rem', color: '#111', fontFamily: 'var(--sans)', width: '100%' },
}

export default function Expediente() {
  const { id } = useParams()
  const { user } = useAuth()
  const [c, setC] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [datos, setDatos] = useState({})
  const [notas, setNotas] = useState('')
  const [resumen, setResumen] = useState('')
  const [estado, setEstado] = useState('cargando') // cargando | listo | guardando | guardado | error | sin_acceso
  const [errorMsg, setErrorMsg] = useState('')
  const [enviando, setEnviando] = useState(false)
  const timer = useRef(null)
  const pendiente = useRef(null)

  useEffect(() => {
    (async () => {
      const { data: cons } = await supabase.from('consultas').select('*').eq('id', id).maybeSingle()
      if (!cons || cons.abogado_id !== user.id) { setEstado('sin_acceso'); return }
      setC(cons)
      document.title = 'Expediente · ' + (cons.especialidad || 'Consulta') + ' — AbogaMéxico'
      const [{ data: cli }, { data: exp }] = await Promise.all([
        supabase.from('usuarios').select('nombre, apellido, email, telefono, pais, ciudad').eq('id', cons.cliente_id).maybeSingle(),
        supabase.from('expedientes').select('*').eq('consulta_id', cons.id).maybeSingle(),
      ])
      setCliente(cli || {})
      if (exp) { setDatos(exp.datos || {}); setNotas(exp.notas_privadas || ''); setResumen(exp.resumen_cliente || '') }
      setEstado('listo')
    })()
  }, [id, user.id])

  const form = formularioPara(c?.especialidad)

  // Guardado automático 1.2 s después del último cambio
  const guardar = useCallback(async (snap) => {
    setEstado('guardando')
    const { error } = await supabase.from('expedientes').upsert({
      consulta_id: c.id, abogado_id: user.id, cliente_id: c.cliente_id, especialidad: c.especialidad, formulario: form.id,
      datos: snap.datos, notas_privadas: snap.notas, resumen_cliente: snap.resumen, updated_at: new Date().toISOString(),
    }, { onConflict: 'consulta_id' })
    pendiente.current = null
    if (error) { setEstado('error'); setErrorMsg(error.message) } else setEstado('guardado')
  }, [c, user.id, form.id])

  function programar(snap) {
    pendiente.current = snap
    setEstado('pendiente')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => guardar(snap), 1200)
  }
  useEffect(() => () => { clearTimeout(timer.current); if (pendiente.current) guardar(pendiente.current) }, [guardar])
  useEffect(() => {
    const aviso = e => { if (pendiente.current) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', aviso)
    return () => window.removeEventListener('beforeunload', aviso)
  }, [])

  const cambiarDatos = d => { setDatos(d); programar({ datos: d, notas, resumen }) }
  const cambiarNotas = v => { setNotas(v); programar({ datos, notas: v, resumen }) }
  const cambiarResumen = v => { setResumen(v); programar({ datos, notas, resumen: v }) }

  function generarBorrador() {
    if (resumen.trim() && !window.confirm('¿Reemplazar el resumen que ya escribiste por un borrador nuevo?')) return
    const nombreCliente = [cliente?.nombre].filter(Boolean).join(' ')
    const nombreAbogado = c.abogado_nombre || user.user_metadata?.nombre || ''
    cambiarResumen(borradorResumen(form, datos, { nombreCliente, nombreAbogado }))
  }

  async function enviar() {
    if (!resumen.trim()) return alert('Escribe o genera el resumen antes de enviarlo.')
    if (!window.confirm('Se enviará este resumen por correo al cliente y lo verá en su panel. ¿Enviar?')) return
    setEnviando(true)
    try {
      clearTimeout(timer.current)
      await guardar({ datos, notas, resumen })
      const j = await apiPost('/api/enviar-resumen', { consulta_id: c.id })
      setC(x => ({ ...x, resumen_enviado_at: j.enviado_at, resumen_cliente: resumen }))
    } catch (e) { alert(e.message) }
    setEnviando(false)
  }

  if (estado === 'cargando') return <div style={{ padding: 60, textAlign: 'center', color: '#888' }}>Cargando expediente…</div>
  if (estado === 'sin_acceso') return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <p style={{ marginBottom: 16 }}>Esta consulta no está asignada a tu cuenta.</p>
      <Link to="/abogado" style={{ color: 'var(--azul)', fontWeight: 600 }}>← Volver a mi panel</Link>
    </div>
  )

  const secciones = seccionesVisibles(form, datos)
  const etiquetaEstado = { pendiente: 'Cambios sin guardar…', guardando: 'Guardando…', guardado: '✓ Guardado', listo: '', error: '⚠ No se guardó' }[estado]
  const nombreCliente = [cliente?.nombre, cliente?.apellido].filter(Boolean).join(' ') || 'Cliente'

  return (
    <div style={{ background: 'var(--gris)', minHeight: '100vh', fontFamily: 'var(--sans)' }}>
      <nav style={{ background: 'var(--azul)', height: 62, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14, position: 'sticky', top: 0, zIndex: 100 }}>
        <Link to="/abogado" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff', textDecoration: 'none' }}>
          <LogoMark size={28} />
          <span style={{ fontSize: '.88rem', color: 'var(--celeste)' }}>← Mi panel</span>
        </Link>
        <span role="status" aria-live="polite" style={{ marginLeft: 'auto', fontSize: '.82rem', fontWeight: 600, color: estado === 'error' ? '#ffb4a9' : 'var(--celeste)' }}>{etiquetaEstado}</span>
        {salaUrl(c) && <a href={salaUrl(c)} target="_blank" rel="noreferrer" style={{ ...S.btn, background: 'var(--grad-acento)', color: 'var(--sobre-acento)', padding: '9px 16px' }}>📹 Abrir videollamada</a>}
      </nav>

      <div className="exp-layout" style={{ maxWidth: 1180, margin: '0 auto', padding: 20, display: 'grid', gridTemplateColumns: '260px minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
        {/* Índice */}
        <aside className="exp-aside" style={{ position: 'sticky', top: 82, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', color: '#8a94a8', textTransform: 'uppercase', padding: '4px 10px' }}>Secciones</div>
          {secciones.map(s => (
            <a key={s.id} href={'#sec_' + s.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 10px', borderRadius: 8, fontSize: '.84rem', color: '#33415c', textDecoration: 'none' }}>
              <span aria-hidden="true" style={{ width: 18, color: seccionLlena(s, datos) ? '#1b7f4b' : '#c3cad6', fontWeight: 700 }}>{seccionLlena(s, datos) ? '✓' : '○'}</span>{s.titulo.replace(/^\d+\.\s*/, '')}
            </a>
          ))}
          <a href="#sec_notas" style={{ padding: '8px 10px 8px 36px', fontSize: '.84rem', color: '#33415c', textDecoration: 'none' }}>Notas privadas</a>
          <a href="#sec_resumen" style={{ padding: '8px 10px 8px 36px', fontSize: '.84rem', color: '#33415c', textDecoration: 'none' }}>Resumen para el cliente</a>
        </aside>

        <main style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* Encabezado */}
          <section style={{ ...S.card, background: 'linear-gradient(135deg,var(--azul),#001128)', border: 'none', color: '#fff' }}>
            <div style={{ fontSize: '.78rem', color: 'var(--celeste)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>{form.titulo}</div>
            <h1 style={{ fontSize: 'clamp(1.3rem,3vw,1.7rem)', color: '#fff', marginBottom: 6 }}>{nombreCliente}</h1>
            <div style={{ color: 'rgba(255,255,255,.8)', fontSize: '.9rem' }}>{fechaLarga(c.fecha)} · {c.hora} (hora del Centro de México) · {c.especialidad}</div>
          </section>

          {/* Datos del cliente */}
          <section style={S.card}>
            <h2 style={S.h}>Datos del cliente</h2>
            <div className="g2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
              <div style={S.dato}><span style={S.k}>Correo</span> {cliente?.email ? <a href={'mailto:' + cliente.email} style={{ color: 'var(--azul)' }}>{cliente.email}</a> : '—'}</div>
              <div style={S.dato}><span style={S.k}>Teléfono</span> {cliente?.telefono || '—'}</div>
              <div style={S.dato}><span style={S.k}>Vive en</span> {[cliente?.ciudad, cliente?.pais].filter(Boolean).join(', ') || '—'}</div>
              <div style={S.dato}><span style={S.k}>Pagó</span> ${Number(c.monto || 0).toFixed(2)} USD</div>
            </div>
            {c.descripcion && (
              <div style={{ marginTop: 12, padding: '12px 14px', background: '#f6f8fb', borderRadius: 9, fontSize: '.9rem', color: '#26344d' }}>
                <strong>Lo que escribió al agendar:</strong> {c.descripcion}
              </div>
            )}
          </section>

          <FormularioCaso form={form} datos={datos} onChange={cambiarDatos} />

          {/* Notas privadas */}
          <section id="sec_notas" style={{ ...S.card, scrollMarginTop: 90, background: '#fffdf5', border: '1px solid #f0e2b0' }}>
            <h2 style={S.h}>🔒 Notas privadas</h2>
            <p style={{ fontSize: '.8rem', color: '#7a6420', marginTop: -6, marginBottom: 10 }}>Solo tú las ves. El cliente nunca tiene acceso a ellas.</p>
            <textarea aria-label="Notas privadas" rows={5} style={{ ...S.input, resize: 'vertical' }} value={notas} onChange={e => cambiarNotas(e.target.value)} />
          </section>

          {/* Resumen para el cliente */}
          <section id="sec_resumen" style={{ ...S.card, scrollMarginTop: 90 }}>
            <h2 style={S.h}>✉️ Resumen para el cliente</h2>
            <p style={{ fontSize: '.84rem', color: '#5a6782', marginTop: -6, marginBottom: 12 }}>Al enviarlo, el cliente lo recibe por correo y lo ve en su panel. Revísalo antes de enviar.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <button type="button" onClick={generarBorrador} style={{ ...S.btn, background: '#eef2f8', color: 'var(--azul)' }}>Generar borrador con lo marcado</button>
            </div>
            <textarea aria-label="Resumen para el cliente" rows={12} style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }} value={resumen} onChange={e => cambiarResumen(e.target.value)} placeholder="Escribe aquí lo que el cliente debe saber: qué se habló, qué sigue y qué documentos debe enviar." />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
              <button type="button" onClick={enviar} disabled={enviando} style={{ ...S.btn, background: 'var(--grad-acento)', color: 'var(--sobre-acento)' }}>
                {enviando ? 'Enviando…' : c.resumen_enviado_at ? 'Volver a enviar al cliente' : 'Enviar resumen al cliente'}
              </button>
              {c.resumen_enviado_at && <span style={{ fontSize: '.85rem', color: '#1b7f4b', fontWeight: 600 }}>✓ Enviado el {new Date(c.resumen_enviado_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
            </div>
            {estado === 'error' && <p role="alert" style={{ marginTop: 12, color: '#b3261e', fontSize: '.85rem' }}>No se pudo guardar: {errorMsg}</p>}
          </section>
        </main>
      </div>
    </div>
  )
}
