import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { supabase } from '../lib/supabase'

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
const HOY = new Date().toISOString().split('T')[0]

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
  const [agForm, setAgForm] = useState({ esp:'Derecho Civil', fecha:HOY, hora:'10:00 AM', desc:'' })
  const [agSuccess, setAgSuccess] = useState(null)
  const [agLoading, setAgLoading] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ nombre:'', apellido:'', telefono:'', pais:'', ciudad:'' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [casosRes, consultasRes, profileRes] = await Promise.all([
      supabase.from('casos').select('*').eq('cliente_id', user.id).order('created_at', { ascending: false }),
      supabase.from('consultas').select('*').order('fecha', { ascending: false }),
      supabase.from('usuarios').select('*').eq('id', user.id).single()
    ])
    const p = profileRes.data || {}
    setData({ casos: casosRes.data||[], consultas: consultasRes.data||[], profile: p })
    setProfileForm({ nombre: p.nombre||'', apellido: p.apellido||'', telefono: p.telefono||'', pais: p.pais||'', ciudad: p.ciudad||'' })
    setLoading(false)
  }

  async function agendar() {
  if (!agForm.fecha) { alert('Por favor selecciona una fecha.'); return }
  
  const rid = 'am-' + Math.random().toString(36).slice(2,10)
  sessionStorage.setItem('pendingConsulta', JSON.stringify({
    esp: agForm.esp, fecha: agForm.fecha, hora: agForm.hora,
    desc: agForm.desc || agForm.esp, userId: user.id,
    rid: rid, ts: Date.now()
  }))
  
  window.location.href = 'https://buy.stripe.com/7sY14n5d9dKG6ST1dR8EM01'
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
          <svg viewBox="0 0 230 160" width="30" height="21"><polygon points="0,155 31,155 73,0 42,0" fill="#000"/><polygon points="68,0 99,0 123,155 92,155" fill="#000"/><polygon points="105,155 136,155 169,0 138,0" fill="#000"/><polygon points="165,0 196,0 230,155 199,155" fill="#000"/><rect x="53" y="83" width="96" height="16" rx="3" fill="#B9CEED"/></svg>
          <div style={{ width:1, height:22, background:'rgba(185,206,237,.25)' }}/>
          <div style={{ display:'flex', flexDirection:'column', lineHeight:1.1 }}>
            <span style={{ fontFamily:'var(--display)', fontSize:'.92rem', fontWeight:700, color:'#fff', letterSpacing:'.06em' }}>ABOGAMÉXICO</span>
            <span style={{ fontSize:'.55rem', color:'var(--celeste)', letterSpacing:'.08em' }}>Mi Panel</span>
          </div>
        </a>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={toggleLang} style={{ background:'rgba(185,206,237,.1)', color:'#fff', border:'1px solid rgba(185,206,237,.25)', padding:'7px 13px', borderRadius:7, fontSize:'.8rem', fontWeight:600, cursor:'pointer' }}>🌐 {lang==='es'?'EN':'ES'}</button>
          <span style={{ color:'rgba(255,255,255,.7)', fontSize:'.82rem' }}>{nombre}</span>
          <button onClick={handleSignOut} style={{ background:'transparent', color:'#fff', border:'1.5px solid rgba(185,206,237,.35)', padding:'7px 16px', borderRadius:7, fontSize:'.82rem', fontWeight:600, cursor:'pointer' }}>{t.navSignOut}</button>
        </div>
      </nav>

      <div style={S.layout}>
        {/* SIDEBAR */}
        <aside style={S.sidebar}>
          {[['home','🏠', lang==='es'?'Inicio':'Home'],
            ['agendar','📅',t.bookConsult],
            ['activos','📂',t.activeCases + (activos.length?' ('+activos.length+')':'')],
            ['cerrados','✅',t.closedCases],
            ['citas','📹',t.myAppts],
            ['pagos','💳',t.myPayments],
            ['perfil','👤',lang==='es'?'Mi perfil':'My profile'],
          ].map(([id, ico, label]) => (
            <button key={id} style={{ ...S.sbItem, ...(page===id?S.sbItemActive:{}) }}
              onClick={() => { setPage(id); if(id==='agendar') setAgSuccess(null) }}
              onMouseEnter={e => { if(page!==id) e.currentTarget.style.background='#ebebf0' }}
              onMouseLeave={e => { if(page!==id) e.currentTarget.style.background='none' }}>
              <span style={{ fontSize:'1rem', width:20, textAlign:'center' }}>{ico}</span>
              <span>{label}</span>
            </button>
          ))}
        </aside>

        {/* MAIN */}
        <main style={S.main}>
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
                  <button onClick={() => { setPage('agendar'); setAgSuccess(null) }} style={{ ...S.btn, background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff', boxShadow:'0 4px 14px rgba(202,161,129,.3)' }}>{t.newConsult}</button>
                </div>
                <div style={S.statsRow}>
                  {[[activos.length, t.activeCases,'#B9CEED'],[cerrados.length,t.closedCases,'#27ae60'],[data.consultas.length,t.totalConsults,'#CAA181'],['$'+totalPagado.toFixed(2),t.totalPaid,'#e74c3c']].map(([n,l,c]) => (
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
                      <button onClick={() => { setPage('agendar'); setAgSuccess(null) }} style={{ ...S.btn, background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff' }}>{t.bookFirst}</button>
                    </div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={S.table}>
                        <thead><tr>{[t.dateCol,t.timeCol,t.specialty2,t.room].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                        <tbody>{proximas.slice(0,3).map((c,i)=>(
                          <tr key={i}><td style={S.td}>{c.fecha}</td><td style={S.td}>{c.hora}</td><td style={S.td}>{c.especialidad}</td>
                          <td style={S.td}>{c.jitsi_room?<a href={'https://meet.jit.si/'+c.jitsi_room} target="_blank" rel="noreferrer" style={{ color:'var(--dorado)', fontWeight:600 }}>📹 {t.join}</a>:'—'}</td></tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>}

              {/* AGENDAR */}
              {page==='agendar' && (
                <div style={S.card}>
                  {agSuccess ? (
                    <div style={{ textAlign:'center', padding:'16px 0' }}>
                      <div style={{ fontSize:'3rem', marginBottom:14 }}>✅</div>
                      <h3 style={{ fontFamily:'var(--display)', color:'var(--azul)', marginBottom:8 }}>{t.consultBooked}</h3>
                      <p style={{ color:'#666', marginBottom:6 }}>{t.bookedMsg} <strong>{agSuccess.esp}</strong></p>
                      <p style={{ color:'#666', marginBottom:16 }}><strong>{agSuccess.fecha}</strong> {t.at} <strong>{agSuccess.hora}</strong></p>
                      <p style={{ color:'#888', marginBottom:8 }}>{t.yourRoom}</p>
                      <a href={'https://meet.jit.si/'+agSuccess.rid} target="_blank" rel="noreferrer" style={{ display:'inline-block', background:'#eef3ff', border:'1px solid var(--celeste)', color:'var(--azul)', fontSize:'.76rem', fontFamily:'monospace', padding:'8px 16px', borderRadius:8, margin:'0 0 20px' }}>meet.jit.si/{agSuccess.rid}</a>
                      <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                        <a href={'https://meet.jit.si/'+agSuccess.rid} target="_blank" rel="noreferrer" style={{ ...S.btn, background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff' }}>{t.joinRoom}</a>
                        <button onClick={() => setAgSuccess(null)} style={{ ...S.btn, background:'transparent', color:'var(--azul)', border:'1.5px solid rgba(0,24,61,.2)' }}>{t.newBooking}</button>
                        <button onClick={() => setPage('home')} style={{ ...S.btn, background:'transparent', color:'var(--azul)', border:'1.5px solid rgba(0,24,61,.2)' }}>{t.goHome}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={S.cardTitle}>{t.agendarTitle}</div>
                      <p style={{ color:'#777', fontSize:'.88rem', marginBottom:20 }}>{t.agendarDesc}</p>
                      <div style={S.fgrid}>
                        <div style={S.fg}>
                          <label style={S.label}>{t.legalSpec}</label>
                          <select style={S.select} value={agForm.esp} onChange={e => setAgForm(f=>({...f,esp:e.target.value}))}>{ESPECIALIDADES.map(e=><option key={e}>{e}</option>)}</select>
                        </div>
                        <div style={S.fg}>
                          <label style={S.label}>{t.date}</label>
                          <input style={S.input} type="date" min={HOY} value={agForm.fecha} onChange={e => setAgForm(f=>({...f,fecha:e.target.value}))}/>
                        </div>
                        <div style={S.fg}>
                          <label style={S.label}>{t.time}</label>
                          <select style={S.select} value={agForm.hora} onChange={e => setAgForm(f=>({...f,hora:e.target.value}))}>
                            {['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'].map(h=><option key={h}>{h}</option>)}
                          </select>
                        </div>
                        <div style={S.fg}>
                          <label style={S.label}>{t.describeMatter}</label>
                          <input style={S.input} value={agForm.desc} onChange={e => setAgForm(f=>({...f,desc:e.target.value}))} placeholder="Ej. Divorcio, herencia, visa..."/>
                        </div>
                      </div>
                      <div style={{ marginTop:20, background:'linear-gradient(135deg,#f8faff,#f0f4f8)', border:'1px solid #dde8f8', borderRadius:12, padding:18, display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
                        <div>
                          <div style={{ fontFamily:'var(--display)', fontSize:'1.8rem', fontWeight:800, color:'var(--azul)' }}>$49.99 <span style={{ fontSize:'1rem', fontWeight:400, color:'#888' }}>USD</span></div>
                          <div style={{ fontSize:'.78rem', color:'#888', marginTop:2 }}>Videollamada · 1 hora</div>
                        </div>
                        <button onClick={agendar} disabled={agLoading} style={{ ...S.btn, background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff', padding:'12px 28px', boxShadow:'0 6px 18px rgba(202,161,129,.3)', opacity:agLoading?.8:1 }}>
                          {agLoading ? t.processing : t.payConfirm}
                        </button>
                      </div>
                      <p style={{ fontSize:'.72rem', color:'#ccc', textAlign:'center', marginTop:10 }}>🔒 Pago seguro via Stripe · PCI DSS</p>
                    </>
                  )}
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
                      <button onClick={() => { setPage('agendar'); setAgSuccess(null) }} style={{ ...S.btn, background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff' }}>{t.bookConsult}</button>
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
                      <button onClick={() => { setPage('agendar'); setAgSuccess(null) }} style={{ ...S.btn, background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff' }}>{t.bookConsult}</button>
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
                            <td style={S.td}>{c.jitsi_room?<a href={'https://meet.jit.si/'+c.jitsi_room} target="_blank" rel="noreferrer" style={{ color:'var(--dorado)', fontWeight:600 }}>📹 {t.join}</a>:'—'}</td>
                            <td style={S.td}><Badge status={esProx?'proxima':c.pagado?'pagado':'pendiente'} t={t}/></td>
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
                  <div style={S.fgrid}>
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
                  <button onClick={saveProfile} disabled={savingProfile} style={{ ...S.btn, background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff', marginTop:18, opacity:savingProfile?.8:1 }}>
                    {savingProfile ? '...' : t.saveChanges}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
