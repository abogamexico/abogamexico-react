import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { supabase } from '../lib/supabase'

const S = {
  nav: { background:'var(--azul)', height:62, display:'flex', alignItems:'center', padding:'0 28px', gap:16, position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 16px rgba(0,0,0,.25)' },
  layout: { display:'grid', gridTemplateColumns:'240px 1fr', minHeight:'calc(100vh - 62px)', maxWidth:1280, margin:'0 auto', padding:24, gap:20 },
  sidebar: { display:'flex', flexDirection:'column', gap:4 },
  sbItem: { display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, cursor:'pointer', transition:'all .18s', color:'#666', fontSize:'.88rem', fontWeight:500, border:'none', background:'none', width:'100%', textAlign:'left' },
  sbItemActive: { background:'var(--azul)', color:'#fff' },
  main: { display:'flex', flexDirection:'column', gap:18, minWidth:0 },
  card: { background:'#fff', borderRadius:12, padding:'22px 24px', boxShadow:'0 2px 12px rgba(0,24,61,.08)', border:'1px solid #eaedf2' },
  cardTitle: { fontFamily:'var(--display)', fontSize:'1rem', fontWeight:700, color:'var(--azul)', marginBottom:16, display:'flex', alignItems:'center', gap:8 },
  statsRow: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 },
  stat: { background:'#fff', borderRadius:12, padding:18, boxShadow:'0 2px 12px rgba(0,24,61,.08)', border:'1px solid #eaedf2' },
  statN: { fontFamily:'var(--display)', fontSize:'1.9rem', fontWeight:800, color:'var(--azul)', lineHeight:1 },
  statL: { fontSize:'.74rem', color:'#999', marginTop:4 },
  table: { width:'100%', borderCollapse:'collapse', fontSize:'.85rem' },
  th: { background:'#f8faff', padding:'10px 14px', textAlign:'left', fontWeight:600, color:'#666', fontSize:'.75rem', borderBottom:'2px solid #eaedf2', whiteSpace:'nowrap' },
  td: { padding:'12px 14px', borderBottom:'1px solid #f0f4f8', color:'#333', verticalAlign:'middle' },
  badge: { display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:'.72rem', fontWeight:600 },
  empty: { textAlign:'center', padding:'48px 20px', color:'#bbb' },
  btn: { display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'8px 16px', borderRadius:8, fontFamily:'var(--sans)', fontSize:'.82rem', fontWeight:600, cursor:'pointer', border:'none', transition:'all .2s' },
  loader: { display:'flex', alignItems:'center', justifyContent:'center', padding:40, color:'#aaa', gap:10 },
}

const HOY = new Date().toISOString().split('T')[0]

export default function DashboardAbogado() {
  const { user, signOut } = useAuth()
  const { t, lang, toggleLang } = useLang()
  const navigate = useNavigate()
  const [page, setPage] = useState('home')
  const [casos, setCasos] = useState([])
  const [consultas, setConsultas] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resultModal, setResultModal] = useState(null)
  const [resultText, setResultText] = useState('')

  const nombre = user?.user_metadata?.nombre || user?.email?.split('@')[0] || ''

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [casosRes, consultasRes, profileRes] = await Promise.all([
      supabase.from('casos').select('*, usuarios(nombre,apellido,email)').eq('abogado_id', user.id).order('created_at', { ascending: false }),
      supabase.from('consultas').select('*').order('fecha', { ascending: false }),
      supabase.from('abogados').select('*').eq('id', user.id).single()
    ])
    // If no cases assigned to this lawyer, show all open cases
    let casosData = casosRes.data || []
    if (casosData.length === 0) {
      const allOpen = await supabase.from('casos').select('*').eq('estado', 'abierto').order('created_at', { ascending: false })
      casosData = allOpen.data || []
    }
    setCasos(casosData)
    setConsultas(consultasRes.data || [])
    setProfile(profileRes.data || {})
    setLoading(false)
  }

  async function cerrarCaso(id) {
    setResultModal(id)
  }

  async function guardarResultado() {
    if (!resultText.trim()) { alert('Por favor describe el resultado.'); return }
    await supabase.from('casos').update({ estado: 'cerrado', resultado: resultText }).eq('id', resultModal)
    setResultModal(null)
    setResultText('')
    loadAll()
  }

  async function marcarPagado(id) {
    await supabase.from('consultas').update({ pagado: true }).eq('id', id)
    loadAll()
  }

  async function handleSignOut() { await signOut(); navigate('/') }

  const casosAbiertos = casos.filter(c => c.estado === 'abierto')
  const casosCerrados = casos.filter(c => c.estado !== 'abierto')
  const proximas = consultas.filter(c => c.fecha && c.fecha >= HOY)
  const ingresoTotal = consultas.filter(c => c.pagado).reduce((a,c) => a+(c.monto||0), 0)
  const pagosPendientes = consultas.filter(c => !c.pagado).length

  return (
    <div style={{ fontFamily:'var(--sans)', background:'var(--gris)', minHeight:'100vh' }}>
      {/* NAV */}
      <nav style={S.nav}>
        <a href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <svg viewBox="0 0 230 160" width="30" height="21"><polygon points="0,155 31,155 73,0 42,0" fill="#000"/><polygon points="68,0 99,0 123,155 92,155" fill="#000"/><polygon points="105,155 136,155 169,0 138,0" fill="#000"/><polygon points="165,0 196,0 230,155 199,155" fill="#000"/><rect x="53" y="83" width="96" height="16" rx="3" fill="#B9CEED"/></svg>
          <div style={{ width:1, height:22, background:'rgba(185,206,237,.25)' }}/>
          <div style={{ display:'flex', flexDirection:'column', lineHeight:1.1 }}>
            <span style={{ fontFamily:'var(--display)', fontSize:'.92rem', fontWeight:700, color:'#fff', letterSpacing:'.06em' }}>ABOGAMÉXICO</span>
            <span style={{ fontSize:'.55rem', color:'var(--celeste)', letterSpacing:'.08em' }}>{lang==='es'?'Panel Abogado':'Lawyer Panel'}</span>
          </div>
        </a>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={toggleLang} style={{ background:'rgba(185,206,237,.1)', color:'#fff', border:'1px solid rgba(185,206,237,.25)', padding:'7px 13px', borderRadius:7, fontSize:'.8rem', fontWeight:600, cursor:'pointer' }}>🌐 {lang==='es'?'EN':'ES'}</button>
          <span style={{ color:'rgba(255,255,255,.7)', fontSize:'.82rem' }}>Lic. {nombre}</span>
          <button onClick={handleSignOut} style={{ background:'transparent', color:'#fff', border:'1.5px solid rgba(185,206,237,.35)', padding:'7px 16px', borderRadius:7, fontSize:'.82rem', fontWeight:600, cursor:'pointer' }}>{t.navSignOut}</button>
        </div>
      </nav>

      <div style={S.layout}>
        {/* SIDEBAR */}
        <aside style={S.sidebar}>
          {[
            ['home','🏠', lang==='es'?'Inicio':'Home'],
            ['activos','📂', t.assignedCases + (casosAbiertos.length?' ('+casosAbiertos.length+')':'')],
            ['cerrados','✅', lang==='es'?'Casos cerrados':'Closed cases'],
            ['agenda','📅', t.mySchedule],
            ['ingresos','💰', t.myEarnings],
            ['perfil','👤', lang==='es'?'Mi perfil':'My profile'],
          ].map(([id, ico, label]) => (
            <button key={id} style={{ ...S.sbItem, ...(page===id?S.sbItemActive:{}) }}
              onClick={() => setPage(id)}
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
                <div style={{ background:'linear-gradient(135deg,var(--azul),#001128)', borderRadius:12, padding:'26px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                  <div>
                    <div style={{ fontFamily:'var(--display)', fontSize:'1.3rem', fontWeight:700, color:'#fff', marginBottom:4 }}>
                      {lang==='es'?'Bienvenido,':'Welcome,'} Lic. {nombre} ⚖️
                    </div>
                    <div style={{ color:'rgba(185,206,237,.75)', fontSize:'.88rem' }}>
                      {profile?.especialidad} · {profile?.estado||'México'}{profile?.verificado ? ' · ✓ Verificado' : ' · ⏳ Pendiente verificación'}
                    </div>
                  </div>
                  <button onClick={() => setPage('activos')} style={{ background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff', border:'none', padding:'10px 22px', borderRadius:9, fontSize:'.9rem', fontWeight:600, cursor:'pointer' }}>
                    {lang==='es'?'Ver casos asignados':'View assigned cases'}
                  </button>
                </div>
                <div style={S.statsRow}>
                  {[
                    [casosAbiertos.length, t.assignedCases, '#B9CEED'],
                    [casosCerrados.length, lang==='es'?'Casos cerrados':'Closed cases', '#27ae60'],
                    ['$'+ingresoTotal.toFixed(2), t.earnings, '#CAA181'],
                    [pagosPendientes, t.pending2, '#e74c3c'],
                  ].map(([n,l,c]) => (
                    <div key={l} style={{ ...S.stat, borderLeft:`4px solid ${c}` }}>
                      <div style={S.statN}>{n}</div>
                      <div style={S.statL}>{l}</div>
                    </div>
                  ))}
                </div>
                {/* Próximas citas */}
                <div style={S.card}>
                  <div style={S.cardTitle}>📅 {lang==='es'?'Próximas consultas':'Upcoming consultations'}</div>
                  {proximas.length === 0 ? (
                    <div style={S.empty}><p>{lang==='es'?'No hay consultas próximas.':'No upcoming consultations.'}</p></div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={S.table}>
                        <thead><tr>{[t.dateCol,t.timeCol,t.specialty2,t.room].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                        <tbody>{proximas.slice(0,5).map((c,i)=>(
                          <tr key={i}>
                            <td style={S.td}>{c.fecha}</td>
                            <td style={S.td}>{c.hora}</td>
                            <td style={S.td}>{c.especialidad||'—'}</td>
                            <td style={S.td}>{c.jitsi_room?<a href={'https://meet.jit.si/'+c.jitsi_room} target="_blank" rel="noreferrer" style={{ color:'var(--dorado)', fontWeight:600 }}>📹 {lang==='es'?'Unirse':'Join'}</a>:'—'}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>}

              {/* CASOS ASIGNADOS */}
              {page==='activos' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>📂 {t.assignedCases}</div>
                  {casosAbiertos.length===0 ? (
                    <div style={S.empty}><div style={{ fontSize:'2.5rem', marginBottom:10 }}>📁</div><p>{t.noAssigned}</p></div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={S.table}>
                        <thead><tr>{['#',lang==='es'?'Cliente':'Client',t.specialty2,t.description,t.status,t.dateCol,lang==='es'?'Acciones':'Actions'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                        <tbody>{casosAbiertos.map((c,i)=>(
                          <tr key={i}>
                            <td style={{...S.td,color:'#bbb',fontSize:'.75rem'}}>{i+1}</td>
                            <td style={S.td}><strong>{c.usuarios?.nombre||lang==='es'?'Cliente':'Client'} {c.usuarios?.apellido||''}</strong><br/><span style={{ fontSize:'.75rem', color:'#aaa' }}>{c.usuarios?.email||''}</span></td>
                            <td style={S.td}>{c.especialidad||'—'}</td>
                            <td style={{...S.td,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.descripcion||'—'}</td>
                            <td style={S.td}><span style={{ ...S.badge, background:'#e8f5e9', color:'#2e7d32' }}>{lang==='es'?'Abierto':'Open'}</span></td>
                            <td style={{...S.td,color:'#aaa',fontSize:'.78rem'}}>{c.created_at?new Date(c.created_at).toLocaleDateString('es-MX'):''}</td>
                            <td style={S.td}>
                              <button onClick={() => cerrarCaso(c.id)} style={{ ...S.btn, background:'var(--azul)', color:'#fff', fontSize:'.75rem', padding:'6px 12px' }}>
                                {t.closeCase}
                              </button>
                            </td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* CASOS CERRADOS */}
              {page==='cerrados' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>✅ {lang==='es'?'Casos cerrados':'Closed cases'}</div>
                  {casosCerrados.length===0 ? (
                    <div style={S.empty}><p>{lang==='es'?'No hay casos cerrados.':'No closed cases.'}</p></div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={S.table}>
                        <thead><tr>{['#',lang==='es'?'Cliente':'Client',t.specialty2,t.result,t.dateCol].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                        <tbody>{casosCerrados.map((c,i)=>(
                          <tr key={i}>
                            <td style={{...S.td,color:'#bbb',fontSize:'.75rem'}}>{i+1}</td>
                            <td style={S.td}>{c.usuarios?.nombre||'—'}</td>
                            <td style={S.td}>{c.especialidad||'—'}</td>
                            <td style={{...S.td,maxWidth:220}}>{c.resultado||'—'}</td>
                            <td style={{...S.td,color:'#aaa',fontSize:'.78rem'}}>{c.created_at?new Date(c.created_at).toLocaleDateString('es-MX'):''}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* AGENDA */}
              {page==='agenda' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>📅 {t.mySchedule}</div>
                  {consultas.length===0 ? (
                    <div style={S.empty}><p>{lang==='es'?'No hay consultas registradas.':'No consultations registered.'}</p></div>
                  ) : (
                    <div style={{ overflowX:'auto' }}>
                      <table style={S.table}>
                        <thead><tr>{[t.dateCol,t.timeCol,t.specialty2,t.room,t.status,lang==='es'?'Acción':'Action'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                        <tbody>{consultas.map((c,i)=>{
                          const esProx = c.fecha && c.fecha >= HOY
                          return <tr key={i}>
                            <td style={S.td}>{c.fecha||'—'}</td>
                            <td style={S.td}>{c.hora||'—'}</td>
                            <td style={S.td}>{c.especialidad||'—'}</td>
                            <td style={S.td}>{c.jitsi_room?<a href={'https://meet.jit.si/'+c.jitsi_room} target="_blank" rel="noreferrer" style={{ color:'var(--dorado)', fontWeight:600 }}>📹 {lang==='es'?'Unirse':'Join'}</a>:'—'}</td>
                            <td style={S.td}><span style={{ ...S.badge, background: esProx?'#e3f2fd':c.pagado?'#e8f5e9':'#fff8e1', color: esProx?'#1565c0':c.pagado?'#2e7d32':'#f57f17' }}>{esProx?lang==='es'?'Próxima':'Upcoming':c.pagado?lang==='es'?'Completada':'Completed':lang==='es'?'Pendiente':'Pending'}</span></td>
                            <td style={S.td}>{!c.pagado && <button onClick={() => marcarPagado(c.id)} style={{ ...S.btn, background:'#e8f5e9', color:'#2e7d32', fontSize:'.75rem', padding:'5px 10px' }}>{t.markPaid}</button>}</td>
                          </tr>
                        })}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* INGRESOS */}
              {page==='ingresos' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>💰 {t.myEarnings}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
                    {[['$'+ingresoTotal.toFixed(2), t.earnings, '#CAA181'],[consultas.filter(c=>c.pagado).length, t.consultations, '#27ae60'],[pagosPendientes, t.pending2, '#e74c3c']].map(([n,l,c])=>(
                      <div key={l} style={{ ...S.stat, borderLeft:`4px solid ${c}` }}>
                        <div style={S.statN}>{n}</div>
                        <div style={S.statL}>{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ overflowX:'auto' }}>
                    <table style={S.table}>
                      <thead><tr>{[t.dateCol,t.specialty2,t.amount,t.status].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                      <tbody>{consultas.map((c,i)=>(
                        <tr key={i}>
                          <td style={{...S.td,color:'#888',fontSize:'.8rem'}}>{c.created_at?new Date(c.created_at).toLocaleDateString('es-MX'):'—'}</td>
                          <td style={S.td}>{c.especialidad||'—'}</td>
                          <td style={S.td}><strong>${(c.monto||49.99).toFixed(2)} USD</strong></td>
                          <td style={S.td}><span style={{ ...S.badge, background:c.pagado?'#e8f5e9':'#fff8e1', color:c.pagado?'#2e7d32':'#f57f17' }}>{c.pagado?lang==='es'?'Pagado':'Paid':lang==='es'?'Pendiente':'Pending'}</span></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PERFIL */}
              {page==='perfil' && (
                <div style={S.card}>
                  <div style={S.cardTitle}>👤 {lang==='es'?'Mi perfil profesional':'My professional profile'}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    {[
                      [lang==='es'?'Nombre':'First name', profile?.nombre||''],
                      [lang==='es'?'Apellido':'Last name', profile?.apellido||''],
                      ['Email', user.email],
                      [lang==='es'?'Teléfono':'Phone', profile?.telefono||''],
                      [lang==='es'?'Cédula Profesional':'Professional License', profile?.cedula||''],
                      [lang==='es'?'Especialidad':'Specialty', profile?.especialidad||''],
                      [lang==='es'?'Estado':'State', profile?.estado||''],
                      [lang==='es'?'Ciudad':'City', profile?.ciudad||''],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                        <label style={{ fontSize:'.75rem', fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'.04em' }}>{label}</label>
                        <div style={{ padding:'10px 12px', background:'#f8faff', borderRadius:8, fontSize:'.88rem', color:'#333', border:'1px solid #eaedf2' }}>{value||'—'}</div>
                      </div>
                    ))}
                  </div>
                  {profile?.bio && (
                    <div style={{ marginTop:14 }}>
                      <label style={{ fontSize:'.75rem', fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'.04em', display:'block', marginBottom:6 }}>{t.bio}</label>
                      <div style={{ padding:'12px 14px', background:'#f8faff', borderRadius:8, fontSize:'.88rem', color:'#333', border:'1px solid #eaedf2', lineHeight:1.65 }}>{profile.bio}</div>
                    </div>
                  )}
                  <div style={{ marginTop:16, padding:'12px 16px', background: profile?.verificado?'#e8f5e9':'#fff8e1', border:`1px solid ${profile?.verificado?'#a5d6a7':'#ffe082'}`, borderRadius:9, fontSize:'.85rem', color: profile?.verificado?'#2e7d32':'#f57f17' }}>
                    {profile?.verificado ? '✓ Perfil verificado — Tu cédula fue confirmada con la SEP' : '⏳ Verificación pendiente — Revisaremos tu cédula en 24–48 horas'}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* MODAL RESULTADO */}
      {resultModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,17,40,.75)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:32, maxWidth:480, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,.3)' }}>
            <h3 style={{ fontFamily:'var(--display)', color:'var(--azul)', marginBottom:12 }}>{t.addResult}</h3>
            <p style={{ color:'#777', fontSize:'.88rem', marginBottom:16 }}>{lang==='es'?'Describe el resultado final del caso para el expediente del cliente.':'Describe the final outcome of the case for the client file.'}</p>
            <textarea value={resultText} onChange={e => setResultText(e.target.value)} placeholder={t.resultPlaceholder} style={{ width:'100%', padding:'11px 13px', border:'1.5px solid #e0e4ea', borderRadius:9, fontFamily:'var(--sans)', fontSize:'.9rem', color:'#111', outline:'none', resize:'vertical', minHeight:100, marginBottom:16 }}/>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={guardarResultado} style={{ flex:1, padding:'11px', background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff', border:'none', borderRadius:9, fontFamily:'var(--sans)', fontSize:'.9rem', fontWeight:700, cursor:'pointer' }}>{t.saveResult}</button>
              <button onClick={() => setResultModal(null)} style={{ padding:'11px 20px', background:'transparent', color:'#666', border:'1.5px solid #e0e4ea', borderRadius:9, fontFamily:'var(--sans)', fontSize:'.9rem', cursor:'pointer' }}>{lang==='es'?'Cancelar':'Cancel'}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
