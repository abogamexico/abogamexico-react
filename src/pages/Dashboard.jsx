import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { supabase } from '../lib/supabase'
import { apiPost } from '../lib/api'
import { esAdmin } from '../lib/admin'
import { LogoMark } from '../components/Logo'

// Enlace de la videollamada: Google Meet si existe; si no, la sala anterior de Jitsi
const salaUrl = c => c.meet_link || (c.jitsi_room ? 'https://meet.jit.si/' + c.jitsi_room : null)

const S = {
  nav: { background:'var(--azul)', height:62, display:'flex', alignItems:'center', padding:'0 28px', gap:16, position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 16px rgba(0,0,0,.25)' },
  layout: { display:'grid', gridTemplateColumns:'240px 1fr', minHeight:'calc(100vh - 62px)', maxWidth:1280, margin:'0 auto', padding:24, gap:20 },
  sidebar: { display:'flex', flexDirection:'column', gap:4 },
  sbSection: { fontSize:'.68rem', fontWeight:700, letterSpacing:'.1em', color:'#aaa', padding:'12px 12px 4px', textTransform:'uppercase' },
  sbItem: { display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, cursor:'pointer', transition:'all .18s', color:'#666', fontSize:'.88rem', fontWeight:500, border:'none', background:'none', width:'100%', textAlign:'left' },
  sbItemActive: { background:'var(--azul)', color:'#fff' },
  main: { display:'flex', flexDirection:'column', gap:18, minWidth:0 },
  card: { background:'#fff', borderRadius:12, padding:'22px 24px', boxShadow:'0 2px 12px rgba(0,24,61,.08)', border:'1px solid #eaedf2' },
  cardTitle: { fontFamily:'var(--display)', fontSize:'1rem', fontWeight:700, color:'var(--azul)', marginBottom:16, display:'flex', alignItems:'center', gap:8 },
  statsRow: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 },
  stat: { background:'#fff', borderRadius:12, padding:18, boxShadow:'0 2px 12px rgba(0,24,61,.08)', border:'1px solid #eaedf2' },
  statN: { fontFamily:'var(--display)', fontSize:'1.9rem', fontWeight:800, color:'var(--azul)', lineHeight:1 },
  statL: { fontSize:'.74rem', color:'#999', marginTop:4 },
  welcome: { background:'linear-gradient(135deg,var(--azul),#001128)', borderRadius:12, padding:'26px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' },
  qaGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 },
  qa: { background:'#fff', borderRadius:12, padding:16, boxShadow:'0 2px 12px rgba(0,24,61,.08)', border:'1px solid #eaedf2', cursor:'pointer', transition:'all .2s', display:'flex', alignItems:'center', gap:12 },
  table: { width:'100%', borderCollapse:'collapse', fontSize:'.85rem' },
  th: { background:'#f8faff', padding:'10px 14px', textAlign:'left', fontWeight:600, color:'#666', fontSize:'.75rem', letterSpacing:'.04em', borderBottom:'2px solid #eaedf2', whiteSpace:'nowrap' },
  td: { padding:'12px 14px', borderBottom:'1px solid #f0f4f8', color:'#333', verticalAlign:'middle' },
  badge: { display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:'.72rem', fontWeight:600 },
  empty: { textAlign:'center', padding:'48px 20px', color:'#bbb' },
  btn: { display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'10px 20px', borderRadius:8, fontFamily:'var(--sans)', fontSize:'.88rem', fontWeight:600, cursor:'pointer', border:'none', transition:'all .2s' },
  fgrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
  fg: { display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:'.78rem', fontWeight:600, color:'#555' },
  input: { padding:'11px 13px', border:'1.5px solid #e0e4ea', borderRadius:9, fontFamily:'var(--sans)', fontSize:'.88rem', color:'#111', outline:'none', background:'#fff' },
  select: { padding:'11px 13px', border:'1.5px solid #e0e4ea', borderRadius:9, fontFamily:'var(--sans)', fontSize:'.88rem', color:'#111', outline:'none', background:'#fff' },
  loader: { display:'flex', alignItems:'center', justifyContent:'center', padding:40, color:'#aaa', gap:10, fontSize:'.88rem' },
}

const ESPECIALIDADES = ['Derecho Civil','Derecho Migratorio','Derecho Familiar','Derecho Penal','Derecho Inmobiliario','Derecho Mercantil','Derecho Fiscal','Seguridad Social','Derecho Administrativo','Derecho Agrario']
// Fecha de hoy en el Centro de México (YYYY-MM-DD)
const HOY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date())
const MANANA = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date(Date.now() + 864e5))

// Estado de la cita según el abogado
function EstadoCita({ c, lang }) {
  const es = lang === 'es'
  const st = (bg, color, txt) => <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:'.72rem', fontWeight:600, background:bg, color }}>{txt}</span>
  if (!c.abogado_id) return st('#f3f4f6', '#555', es ? 'Asignando abogado' : 'Assigning lawyer')
  const lic = c.abogado_nombre ? 'Lic. ' + c.abogado_nombre : (es ? 'tu abogado' : 'your lawyer')
  if (c.aceptada_at) return st('#e8f5e9', '#1b5e20', (es ? '✓ Confirmada por ' : '✓ Confirmed by ') + lic)
  return st('#fff8e1', '#7a4f01', es ? 'Esperando confirmación del abogado' : 'Waiting for lawyer confirmation')
}

function Badge({ status, t }) {
  const map = {
    abierto: { bg:'#e8f5e9', color:'#2e7d32', label: t.open },
    cerrado: { bg:'#f3f4f6', color:'#666', label: t.closed },
    pagado: { bg:'#e8f5e9', color:'#2e7d32', label: t.paid },
    pendiente: { bg:'#fff8e1', color:'#f57f17', label: t.pending },
    proxima: { bg:'#e3f2fd', color:'#1565c0', label: t.upcoming },
    completada: { bg:'#f3f4f6', color:'#666', label: t.completed },
  }
  const s = map[status] || { bg:'#f3f4f6', color:'#666', label: status }
  return <span style={{ ...S.badge, background: s.bg, color: s.color }}>{s.label}</span>
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const { t, lang, toggleLang } = useLang()
  const navigate = useNavigate()
  const [page, setPage] = useState('home')
  const [data, setData] = useState({ casos:[], consultas:[], profile:null })
  const [loading, setLoading] = useState(true)
  const [agForm, setAgForm] = useState({ esp:'Derecho Civil', fecha:MANANA, hora:'10:00 AM', desc:'' })
  const [agError, setAgError] = useState('')
  const [horarios, setHorarios] = useState({ cargando: true, horas: [] })

  // Horas libres para la especialidad y fecha elegidas
  useEffect(() => {
    if (!agForm.fecha || !agForm.esp) return
    let vigente = true
    setHorarios(h => ({ ...h, cargando: true }))
    fetch('/api/horarios?' + new URLSearchParams({ especialidad: agForm.esp, fecha: agForm.fecha }))
      .then(r => r.json())
      .then(j => {
        if (!vigente) return
        const horas = j.horas || []
        setHorarios({ cargando: false, horas })
        // Si la hora elegida ya no está libre, elegir la primera libre
        setAgForm(f => horas.some(x => x.hora === f.hora && x.disponible) ? f : { ...f, hora: (horas.find(x => x.disponible) || {}).hora || '' })
      })
      // Si no se pudo consultar, mostrar todas (el servidor vuelve a validar al pagar)
      .catch(() => vigente && setHorarios({ cargando: false, horas: ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'].map(hora => ({ hora, disponible: true })) }))
    return () => { vigente = false }
  }, [agForm.esp, agForm.fecha])
  const [aviso, setAviso] = useState(null) // 'ok' | 'cancelado'
  const [verResumen, setVerResumen] = useState(null)
  const [agLoading, setAgLoading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ nombre:'', apellido:'', telefono:'', pais:'', ciudad:'' })

  useEffect(() => {
    loadAll()
    // Regreso desde Stripe
    const pago = new URLSearchParams(window.location.search).get('pago')
    if (pago === 'ok' || pago === 'cancelado') {
      setAviso(pago)
      window.history.replaceState({}, '', '/dashboard')
      if (pago === 'ok') {
        // El aviso de Stripe tarda unos segundos: recargamos un par de veces
        setTimeout(() => loadAll(true), 4000)
        setTimeout(() => loadAll(true), 12000)
      }
    }
  }, [])

  async function loadAll(silencioso = false) {
    if (!silencioso) setLoading(true)
    const [casosRes, consultasRes, profileRes] = await Promise.all([
      supabase.from('casos').select('*').eq('cliente_id', user.id).order('created_at', { ascending: false }),
      supabase.from('consultas').select('*').eq('cliente_id', user.id).order('fecha', { ascending: false }),
      supabase.from('usuarios').select('*').eq('id', user.id).single()
    ])
    const p = profileRes.data || {}
    setData({ casos: casosRes.data||[], consultas: consultasRes.data||[], profile: p })
    setProfileForm({ nombre: p.nombre||'', apellido: p.apellido||'', telefono: p.telefono||'', pais: p.pais||'', ciudad: p.ciudad||'' })
    setLoading(false)
  }

  async function agendar() {
    setAgError('')
    if (!agForm.fecha) { setAgError(lang==='es' ? 'Selecciona una fecha.' : 'Choose a date.'); return }
    if (!agForm.hora) { setAgError(lang==='es' ? 'Elige una hora disponible.' : 'Choose an available time.'); return }
    setAgLoading(true)
    try {
      const j = await apiPost('/api/checkout', { especialidad: agForm.esp, fecha: agForm.fecha, hora: agForm.hora, descripcion: agForm.desc })
      if (!j.url) throw new Error('No pudimos iniciar el pago.')
      window.location.href = j.url
    } catch (e) {
      setAgError(e.message)
      setAgLoading(false)
    }
  }

  async function saveProfile() {
    setSavingProfile(true)
    const { error } = await supabase.from('usuarios').update(profileForm).eq('id', user.id)
    setSavingProfile(false)
    alert(error ? t.profileError + error.message : t.profileUpdated)
  }

  async function handleSignOut() { await signOut(); navigate('/') }

  const nombre = user?.user_metadata?.nombre || user?.email?.split('@')[0] || ''
  const activos = data.casos.filter(c => c.estado === 'abierto')
  const cerrados = data.casos.filter(c => c.estado !== 'abierto')
  const proximas = data.consultas.filter(c => c.fecha && c.fecha >= HOY)
  const totalPagado = data.consultas.filter(c => c.pagado).reduce((a,c) => a+(c.monto||0), 0)

  const pages = [
    ['home','🏠',t.bookConsult.replace('Agendar','Inicio').replace('Book','Home')],
    ['agendar','📅',t.bookConsult], ['activos','📂',t.activeCases],
    ['cerrados','✅',t.closedCases], ['citas','📹',t.myAppts],
    ['pagos','💳',t.myPayments], ['perfil','👤','Perfil'],
  ]

  return (
    <div style={{ fontFamily:'var(--sans)', background:'var(--gris)', minHeight:'100vh' }}>
      {/* NAV */}
      <nav style={S.nav}>
        <a href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <LogoMark size={30} />
          <div style={{ width:1, height:22, background:'rgba(185,206,237,.25)' }}/>
          <div style={{ display:'flex', flexDirection:'column', lineHeight:1.1 }}>
            <span style={{ fontFamily:'var(--display)', fontSize:'.98rem', fontWeight:800, color:'#fff' }}>Aboga<span style={{ color:'var(--acento)' }}>México</span></span>
            <span style={{ fontSize:'.55rem', color:'var(--celeste)', letterSpacing:'.08em' }}>Mi Panel</span>
          </div>
        </a>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={toggleLang} style={{ background:'rgba(185,206,237,.1)', color:'#fff', border:'1px solid rgba(185,206,237,.25)', padding:'7px 13px', borderRadius:7, fontSize:'.8rem', fontWeight:600, cursor:'pointer' }}>🌐 {lang==='es'?'EN':'ES'}</button>
          {esAdmin(user) && <a href="/admin" style={{ color:'#fff', fontSize:'.8rem', fontWeight:600, border:'1px solid rgba(185,206,237,.35)', padding:'7px 12px', borderRadius:7, textDecoration:'none' }}>Administración</a>}
          <span className="dash-nav-name" style={{ color:'rgba(255,255,255,.7)', fontSize:'.82rem' }}>{nombre}</span>
          <button onClick={handleSignOut} style={{ background:'transparent', color:'#fff', border:'1.5px solid rgba(185,206,237,.35)', padding:'7px 16px', borderRadius:7, fontSize:'.82rem', fontWeight:600, cursor:'pointer' }}>{t.navSignOut}</button>
        </div>
      </nav>

      <div className="dash-layout" style={S.layout}>
        {/* SIDEBAR */}
        <aside className="dash-sidebar" style={S.sidebar}>
          {[['home','🏠', lang==='es'?'Inicio':'Home'],
            ['agendar','📅',t.bookConsult],
            ['activos','📂',t.activeCases + (activos.length?' ('+activos.length+')':'')],
            ['cerrados','✅',t.closedCases],
            ['citas','📹',t.myAppts],
            ['pagos','💳',t.myPayments],
            ['perfil','👤',lang==='es'?'Mi perfil':'My profile'],
          ].map(([id, ico, label]) => (
            <button key={id} style={{ ...S.sbItem, ...(page===id?S.sbItemActive:{}) }}
              onClick={() => { setPage(id) }}
              onMouseEnter={e => { if(page!==id) e.currentTarget.style.background='#ebebf0' }}
              onMouseLeave={e => { if(page!==id) e.currentTarget.style.background='none' }}>
              <span style={{ fontSize:'1rem', width:20, textAlign:'center' }}>{ico}</span>
              <span>{label}</span>
            </button>
          ))}
        </aside>

        {/* MAIN */}
        <main style={S.main}>
          {aviso === 'ok' && (
            <div role="status" style={{ background:'#e8f5e9', border:'1px solid #a5d6a7', color:'#1b5e20', borderRadius:12, padding:'16px 20px', display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start' }}>
              <div><strong>{lang==='es' ? '¡Pago recibido! Tu consulta está confirmada.' : 'Payment received! Your consultation is confirmed.'}</strong><br/>
                <span style={{ fontSize:'.88rem' }}>{lang==='es' ? 'En unos minutos te llegará a tu correo la invitación con el enlace de Google Meet. También aparecerá en "Mis citas".' : 'In a few minutes you will get an email invitation with the Google Meet link. It will also appear under "My appointments".'}</span></div>
              <button onClick={() => setAviso(null)} aria-label="Cerrar" style={{ background:'none', fontSize:'1.2rem', color:'#1b5e20' }}>×</button>
            </div>
          )}
          {aviso === 'cancelado' && (
            <div role="status" style={{ background:'#fff8e1', border:'1px solid #ffe082', color:'#7a4f01', borderRadius:12, padding:'16px 20px', display:'flex', justifyContent:'space-between', gap:12 }}>
              <span>{lang==='es' ? 'No se realizó ningún cargo. Puedes agendar de nuevo cuando quieras.' : 'You were not charged. You can book again anytime.'}</span>
              <button onClick={() => setAviso(null)} aria-label="Cerrar" style={{ background:'none', fontSize:'1.2rem', color:'#7a4f01' }}>×</button>
            </div>
          )}
          {loading ? (
            <div style={S.loader}><div style={{ width:20, height:20, border:'2px solid #e0e0e0', borderTopColor:'var(--dorado)', borderRadius:'50%', animation:'spin .7s linear infinite' }}/> Cargando...</div>
          ) : (
            <>
              {/* HOME */}
              {page==='home' && <>
                <div style={S.welcome}>
                  <div>
                    <div style={{ fontFamily:'var(--display)', fontSize:'1.3rem', fontWeight:700, color:'#fff', marginBottom:4 }}>{t.welcome}, {nombre} 👋</div>
                    <div style={{ color:'rgba(185,206,237,.75)', fontSize:'.88rem' }}>{t.welcomeSub}</div>
                  </div>
                  <button onClick={() => { setPage('agendar') }} style={{ ...S.btn, background:'var(--grad-acento)', color:'var(--sobre-acento)', boxShadow:'0 4px 14px rgba(var(--acento-rgb),.3)' }}>{t.newConsult}</button>
                </div>
                <div className="dash-stats" style={S.statsRow}>
                  {[[activos.length, t.activeCases,'#B9CEED'],[cerrados.length,t.closedCases,'#27ae60'],[data.consultas.length,t.totalConsults,'var(--acento)'],['$'+totalPagado.toFixed(2),t.totalPaid,'#e74c3c']].map(([n,l,c]) => (
                    <div key={l} style={{ ...S.stat, borderLeft:`4px solid ${c}` }}>
                      <div style={S.statN}>{n}</div>
                      <div style={S.statL}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>{t.quickActions}</div>
                  <div style={S.qaGrid}>
                    {[[t.bookConsult,t.bookSub,'📅','agendar'],[t.myCases,t.myCasesSub,'📂','activos'],[t.myAppts,t.myApptsSub,'📹','citas'],[t.myPayments,t.myPaymentsSub,'💳','pagos']].map(([title,sub,ico,pid]) => (
                      <div key={pid} style={S.qa} onClick={() => setPage(pid)}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 24px rgba(0,24,61,.14)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='var(--dorado)' }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow='0 2px 12px rgba(0,24,61,.08)'; e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor='#eaedf2' }}>
                        <div style={{ fontSize:'1.5rem', width:40, height:40, background:'var(--gris)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{ico}</div>
                        <div>
                          <div style={{ fontSize:'.85rem', fontWeight:600, color:'var(--azul)' }}>{title}</div>
                          <div style={{ fontSize:'.72rem', color:'#999', marginTop:2 }}>{sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>📅 {t.upcomingAppts}</div>
                  {proximas.length === 0 ? (
                    <div style={S.empty}>
                      <div style={{ fontSize:'2.5rem', marginBottom:10 }}>📅</div>
                      <p style={{ marginBottom:14 }}>{t.noUpcoming}</p>
                      <button onClick={() => { setPage('agendar') }} style={{ ...S.btn, background:'var(--grad-acento)', color:'var(--sobre-acento)' }}>{t.bookFirst}</button>
                    </div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={S.table}>
                        <thead><tr>{[t.dateCol,t.timeCol,t.specialty2,t.room,t.status].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                        <tbody>{proximas.slice(0,3).map((c,i)=>(
                          <tr key={i}><td style={S.td}>{c.fecha}</td><td style={S.td}>{c.hora}</td><td style={S.td}>{c.especialidad}</td>
                          <td style={S.td}>{salaUrl(c)?<a href={salaUrl(c)} target="_blank" rel="noreferrer" style={{ color:'var(--azul)', fontWeight:600, textDecoration:'underline' }}>{t.join}</a>:'—'}</td>
                          <td style={S.td}><EstadoCita c={c} lang={lang} /></td></tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>}

              {/* AGENDAR */}
              {page==='agendar' && (
                <div style={S.card}>
                  <>
                      <div style={S.cardTitle}>{t.agendarTitle}</div>
                      <p style={{ color:'#777', fontSize:'.88rem', marginBottom:20 }}>{t.agendarDesc}</p>
                      <div className="dash-fgrid" style={S.fgrid}>
                        <div style={S.fg}>
                          <label style={S.label}>{t.legalSpec}</label>
                          <select style={S.select} value={agForm.esp} onChange={e => setAgForm(f=>({...f,esp:e.target.value}))}>{ESPECIALIDADES.map(e=><option key={e}>{e}</option>)}</select>
                        </div>
                        <div style={S.fg}>
                          <label style={S.label}>{t.date}</label>
                          <input style={S.input} type="date" min={HOY} value={agForm.fecha} onChange={e => setAgForm(f=>({...f,fecha:e.target.value}))}/>
                        </div>
                        <div style={S.fg}>
                          <label style={S.label}>{t.describeMatter}</label>
                          <input style={S.input} value={agForm.desc} onChange={e => setAgForm(f=>({...f,desc:e.target.value}))} placeholder="Ej. Divorcio, herencia, visa..."/>
                        </div>
                      </div>
                      <div style={{ marginTop:18 }}>
                        <div id="horas_l" style={S.label}>{t.time} {lang==='es' ? '(hora del Centro de México)' : '(Mexico City time)'}</div>
                        {horarios.cargando ? (
                          <p style={{ fontSize:'.85rem', color:'#888', marginTop:8 }}>{lang==='es' ? 'Buscando horarios libres…' : 'Checking availability…'}</p>
                        ) : horarios.horas.some(x => x.disponible) ? (
                          <div role="radiogroup" aria-labelledby="horas_l" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(104px, 1fr))', gap:8, marginTop:8 }}>
                            {horarios.horas.map(({ hora, disponible }) => {
                              const on = agForm.hora === hora
                              return (
                                <button key={hora} type="button" role="radio" aria-checked={on} disabled={!disponible}
                                  onClick={() => setAgForm(f => ({ ...f, hora }))}
                                  style={{ padding:'11px 8px', borderRadius:9, fontSize:'.88rem', fontWeight:600, cursor: disponible ? 'pointer' : 'not-allowed',
                                    border: on ? '2px solid var(--azul)' : '1.5px solid #d9dfe8',
                                    background: on ? 'var(--azul)' : disponible ? '#fff' : '#f1f3f6',
                                    color: on ? '#fff' : disponible ? 'var(--azul)' : '#a3abb8', textDecoration: disponible ? 'none' : 'line-through' }}>
                                  {hora}
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <p style={{ fontSize:'.88rem', color:'#7a4f01', background:'#fff8e1', borderRadius:8, padding:'10px 14px', marginTop:8 }}>
                            {lang==='es' ? 'No hay horarios libres ese día. Prueba con otra fecha.' : 'No free times that day. Try another date.'}
                          </p>
                        )}
                      </div>
                      <div style={{ marginTop:20, background:'linear-gradient(135deg,#f8faff,#f0f4f8)', border:'1px solid #dde8f8', borderRadius:12, padding:18, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                        <div>
                          <div style={{ fontFamily:'var(--display)', fontSize:'1.8rem', fontWeight:800, color:'var(--azul)' }}>$49.99 <span style={{ fontSize:'1rem', fontWeight:400, color:'#888' }}>USD</span></div>
                          <div style={{ fontSize:'.78rem', color:'#888', marginTop:2 }}>{lang==='es' ? 'Más impuestos · videollamada de hasta 60 min' : 'Plus taxes · up to 60-min video call'}</div>
                        </div>
                        <button onClick={agendar} disabled={agLoading} style={{ ...S.btn, background:'var(--grad-acento)', color:'var(--sobre-acento)', padding:'12px 28px', boxShadow:'0 6px 18px rgba(var(--acento-rgb),.3)', opacity:agLoading?.8:1 }}>
                          {agLoading ? t.processing : t.payConfirm}
                        </button>
                      </div>
                      {agError && <p role="alert" style={{ marginTop:12, padding:'10px 14px', background:'#fdecea', color:'#b3261e', borderRadius:8, fontSize:'.85rem' }}>{agError}</p>}
                      <p style={{ fontSize:'.75rem', color:'#888', textAlign:'center', marginTop:10 }}>🔒 {lang==='es' ? 'Pago seguro con Stripe. Al confirmarse, te llega por correo la invitación con el enlace de Google Meet.' : 'Secure payment with Stripe. Once confirmed, you get an email invitation with the Google Meet link.'}</p>
                  </>
                </div>
              )}

              {/* CASOS */}
              {(page==='activos'||page==='cerrados') && (
                <div style={S.card}>
                  <div style={S.cardTitle}>{page==='activos' ? '📂 '+t.activeCases : '✅ '+t.closedCases}</div>
                  {(page==='activos'?activos:cerrados).length===0 ? (
                    <div style={S.empty}>
                      <div style={{ fontSize:'2.5rem', marginBottom:10 }}>📁</div>
                      <p style={{ marginBottom:14 }}>{t.noCases}</p>
                      <button onClick={() => { setPage('agendar') }} style={{ ...S.btn, background:'var(--grad-acento)', color:'var(--sobre-acento)' }}>{t.bookConsult}</button>
                    </div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={S.table}>
                        <thead><tr>{['#',t.specialty2,t.description,page==='cerrados'?t.result:null,t.status,t.dateCol].filter(Boolean).map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                        <tbody>{(page==='activos'?activos:cerrados).map((c,i)=>(
                          <tr key={i}>
                            <td style={{...S.td,color:'#bbb',fontSize:'.75rem'}}>{i+1}</td>
                            <td style={S.td}><strong>{c.especialidad||'—'}</strong></td>
                            <td style={{...S.td,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.descripcion||'—'}</td>
                            {page==='cerrados' && <td style={S.td}>{c.resultado||'—'}</td>}
                            <td style={S.td}><Badge status={c.estado} t={t}/></td>
                            <td style={{...S.td,color:'#aaa',fontSize:'.78rem'}}>{c.created_at?new Date(c.created_at).toLocaleDateString('es-MX'):''}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* CITAS */}
              {page==='citas' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>📹 {t.myAppts}</div>
                  {data.consultas.length===0 ? (
                    <div style={S.empty}>
                      <div style={{ fontSize:'2.5rem', marginBottom:10 }}>📅</div>
                      <p style={{ marginBottom:14 }}>{t.noUpcoming}</p>
                      <button onClick={() => { setPage('agendar') }} style={{ ...S.btn, background:'var(--grad-acento)', color:'var(--sobre-acento)' }}>{t.bookConsult}</button>
                    </div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={S.table}>
                        <thead><tr>{[t.dateCol,t.timeCol,t.specialty2,t.room,t.status].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                        <tbody>{data.consultas.map((c,i)=>{
                          const esProx = c.fecha && c.fecha >= HOY
                          return <tr key={i}>
                            <td style={S.td}>{c.fecha||'—'}</td>
                            <td style={S.td}>{c.hora||'—'}</td>
                            <td style={S.td}>{c.especialidad||'—'}</td>
                            <td style={S.td}>{salaUrl(c)?<a href={salaUrl(c)} target="_blank" rel="noreferrer" style={{ color:'var(--azul)', fontWeight:600, textDecoration:'underline' }}>{t.join}</a>:'—'}</td>
                            <td style={S.td}>
                              {esProx ? <EstadoCita c={c} lang={lang} /> : <Badge status={c.pagado?'completada':'pendiente'} t={t}/>}
                              {c.resumen_enviado_at && <button onClick={() => setVerResumen(c)} style={{ ...S.btn, marginLeft:8, padding:'5px 12px', fontSize:'.75rem', background:'var(--azul)', color:'#fff' }}>{lang==='es'?'Ver resumen':'View summary'}</button>}
                            </td>
                          </tr>
                        })}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* PAGOS */}
              {page==='pagos' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>💳 {t.myPayments}</div>
                  {data.consultas.length===0 ? (
                    <div style={S.empty}><div style={{ fontSize:'2.5rem', marginBottom:10 }}>💳</div><p>{t.noPayments}</p></div>
                  ) : (
                    <>
                      <div style={{ background:'linear-gradient(135deg,#f8faff,#f0f4f8)', border:'1px solid #dde8f8', borderRadius:12, padding:'14px 18px', marginBottom:16, display:'flex', alignItems:'center', gap:16 }}>
                        <div>
                          <div style={{ fontFamily:'var(--display)', fontSize:'1.6rem', fontWeight:800, color:'var(--azul)' }}>${totalPagado.toFixed(2)} USD</div>
                          <div style={{ fontSize:'.78rem', color:'#888', marginTop:2 }}>{t.totalPaidLabel}</div>
                        </div>
                      </div>
                      <div style={{ overflowX:'auto' }}>
                        <table style={S.table}>
                          <thead><tr>{[t.dateCol,t.concept,t.amount,t.status,t.stripeId].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                          <tbody>{data.consultas.map((c,i)=>(
                            <tr key={i}>
                              <td style={{...S.td,color:'#888',fontSize:'.8rem'}}>{c.created_at?new Date(c.created_at).toLocaleDateString('es-MX'):'—'}</td>
                              <td style={S.td}>{t.concept} {c.especialidad||'legal'}</td>
                              <td style={S.td}><strong>${(c.monto||49.99).toFixed(2)} USD</strong></td>
                              <td style={S.td}><Badge status={c.pagado?'pagado':'pendiente'} t={t}/></td>
                              <td style={{...S.td,color:'#ccc',fontSize:'.72rem',fontFamily:'monospace'}}>{c.stripe_payment_id||'—'}</td>
                            </tr>
                          ))}</tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* PERFIL */}
              {page==='perfil' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>👤 {lang==='es'?'Mi perfil':'My profile'}</div>
                  <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,var(--azul),var(--celeste))', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:'1.6rem', fontWeight:700, color:'#fff', marginBottom:20 }}>
                    {(profileForm.nombre||'?')[0]?.toUpperCase()}{(profileForm.apellido||'')[0]?.toUpperCase()}
                  </div>
                  <div className="dash-fgrid" style={S.fgrid}>
                    {[[t.firstName,'nombre'],[t.lastName,'apellido'],[t.phone,'telefono'],[t.country,'pais'],[t.city,'ciudad']].map(([label,key])=>(
                      <div key={key} style={S.fg}>
                        <label style={S.label}>{label}</label>
                        <input style={S.input} value={profileForm[key]} onChange={e => setProfileForm(f=>({...f,[key]:e.target.value}))}/>
                      </div>
                    ))}
                    <div style={S.fg}>
                      <label style={S.label}>{t.email}</label>
                      <input style={{...S.input,opacity:.6}} value={user.email} disabled/>
                    </div>
                  </div>
                  <button onClick={saveProfile} disabled={savingProfile} style={{ ...S.btn, background:'var(--grad-acento)', color:'var(--sobre-acento)', marginTop:18, opacity:savingProfile?.8:1 }}>
                    {savingProfile ? '...' : t.saveChanges}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      {verResumen && (
        <div role="dialog" aria-modal="true" aria-label="Resumen de tu consulta" onClick={() => setVerResumen(null)} style={{ position:'fixed', inset:0, background:'rgba(0,17,40,.7)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:16, padding:'28px 26px', maxWidth:620, width:'100%', maxHeight:'85vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:10 }}>
              <div>
                <h3 style={{ fontFamily:'var(--display)', color:'var(--azul)', fontSize:'1.2rem' }}>{lang==='es'?'Resumen de tu consulta':'Consultation summary'}</h3>
                <div style={{ fontSize:'.82rem', color:'#6b778c', marginTop:4 }}>{verResumen.especialidad} · {verResumen.fecha} · {verResumen.abogado_nombre ? 'Lic. ' + verResumen.abogado_nombre : ''}</div>
              </div>
              <button onClick={() => setVerResumen(null)} aria-label="Cerrar" style={{ background:'none', fontSize:'1.5rem', color:'#666', lineHeight:1 }}>×</button>
            </div>
            <div style={{ whiteSpace:'pre-wrap', fontSize:'.93rem', lineHeight:1.7, color:'#26344d' }}>{verResumen.resumen_cliente}</div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
