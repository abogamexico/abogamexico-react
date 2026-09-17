import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useLang } from '../context/LangContext'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

const MAP_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_3J1WIqLC1JL8GN9nx3Mi7vvxL9n/hf_20260909_195856_fb400888-293b-4c77-bd53-290ded254973.png'
const VC_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_3J1WIqLC1JL8GN9nx3Mi7vvxL9n/hf_20260908_233253_fb160eca-d93f-4b69-b83a-3aa16e18c358.png'

const SPECS = [
  { ico:'⚖️', key:'civil', esp:'Derecho Civil', en:'Civil Law', descEs:'Contratos, deudas, sucesiones, responsabilidad civil.', descEn:'Contracts, debts, successions, civil liability.' },
  { ico:'🛂', key:'mig', esp:'Derecho Migratorio', en:'Immigration Law', descEs:'Visas, residencias, trámites consulares, nacionalidad.', descEn:'Visas, residencies, consular procedures, nationality.' },
  { ico:'👨‍👩‍👧', key:'fam', esp:'Derecho Familiar', en:'Family Law', descEs:'Divorcios, herencias, custodia, pensión alimenticia.', descEn:'Divorces, inheritance, custody, child support.' },
  { ico:'🔒', key:'pen', esp:'Derecho Penal', en:'Criminal Law', descEs:'Defensa penal, amparos, extradición, asesoría criminal.', descEn:'Criminal defense, appeals, extradition.' },
  { ico:'🏠', key:'inm', esp:'Derecho Inmobiliario', en:'Real Estate Law', descEs:'Compraventa, escrituras, hipotecas, arrendamientos.', descEn:'Purchase, deeds, mortgages, leases.' },
  { ico:'📊', key:'mer', esp:'Derecho Mercantil', en:'Commercial Law', descEs:'Empresas, sociedades, contratos comerciales, quiebras.', descEn:'Companies, partnerships, commercial contracts.' },
  { ico:'🧾', key:'fis', esp:'Derecho Fiscal', en:'Tax Law', descEs:'SAT, declaraciones, controversias fiscales, impuestos.', descEn:'Tax returns, tax disputes, IRS equivalent.' },
  { ico:'🏥', key:'seg', esp:'Seguridad Social', en:'Social Security', descEs:'IMSS, ISSSTE, pensiones, incapacidades, prestaciones.', descEn:'IMSS, pensions, disability, benefits.' },
  { ico:'🏛️', key:'adm', esp:'Derecho Administrativo', en:'Administrative Law', descEs:'Trámites gubernamentales, licitaciones, permisos.', descEn:'Government procedures, bids, permits.' },
  { ico:'🌾', key:'agr', esp:'Derecho Agrario', en:'Agrarian Law', descEs:'Ejidos, tierras comunales, conflictos rurales.', descEn:'Ejidos, communal lands, rural conflicts.' },
]

export default function Landing() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [modal, setModal] = useState(null)
  const [hovSpec, setHovSpec] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 55)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function openConsult() {
    if (user) navigate('/dashboard')
    else setModal('register')
  }

  return (
    <div style={{ fontFamily: 'var(--sans)' }}>
      <Navbar scrolled={scrolled} />

      {/* ── HERO ── */}
      <section id="hero" style={{ position:'relative', minHeight:'100vh', display:'flex', alignItems:'center', overflow:'hidden', paddingTop:80, background:'var(--azul)' }}>
        {/* Map image right side */}
        <img src={MAP_URL} alt="Mapa conexiones USA-México" style={{ position:'absolute', right:0, top:0, width:'52%', height:'100%', objectFit:'cover', objectPosition:'center', zIndex:0 }}/>
        {/* Gradient overlay */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,24,61,1) 0%, rgba(0,24,61,.97) 38%, rgba(0,24,61,.75) 50%, rgba(0,24,61,.2) 68%, rgba(0,24,61,.05) 100%)', zIndex:1 }}/>
        {/* Content */}
        <div style={{ position:'relative', zIndex:2, maxWidth:580, marginLeft:'max(24px, calc((100vw - 1200px)/2))', padding:'60px 24px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(185,206,237,.1)', border:'1px solid rgba(185,206,237,.3)', color:'var(--celeste)', fontSize:'.78rem', fontWeight:600, letterSpacing:'.1em', padding:'7px 18px', borderRadius:50, marginBottom:24 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--dorado)', flexShrink:0 }}/>
            {t.heroBadge}
          </div>
          <h1 style={{ fontFamily:'var(--display)', fontSize:'clamp(2.4rem,5vw,4.2rem)', fontWeight:800, color:'#fff', lineHeight:1.08, marginBottom:20, letterSpacing:'-.03em' }}>
            {t.heroTitle}<br/>
            <span style={{ background:'linear-gradient(135deg,var(--celeste),var(--dorado))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{t.heroTitleEm}</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.72)', fontSize:'1.05rem', lineHeight:1.78, marginBottom:36, maxWidth:520 }}>{t.heroDesc}</p>
          <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:52 }}>
            <button onClick={openConsult} style={{ background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff', border:'none', padding:'15px 32px', borderRadius:11, fontSize:'1rem', fontWeight:700, cursor:'pointer', boxShadow:'0 8px 24px rgba(202,161,129,.35)', transition:'all .3s' }}>{t.heroCta1}</button>
            <button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({behavior:'smooth'})} style={{ background:'transparent', color:'#fff', border:'1.5px solid rgba(185,206,237,.4)', padding:'15px 32px', borderRadius:11, fontSize:'1rem', fontWeight:500, cursor:'pointer', backdropFilter:'blur(4px)', transition:'all .3s' }}>{t.heroCta2}</button>
          </div>
          <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:0 }}>
            {[['500+', t.stat1], ['32', t.stat2], ['$49.99', t.stat3]].map(([n, l], i) => (
              <div key={i} style={{ padding:'0 28px', borderRight: i<2 ? '1px solid rgba(185,206,237,.2)' : 'none', paddingLeft: i===0?0:28 }}>
                <div style={{ fontFamily:'var(--display)', fontSize:'2.1rem', fontWeight:800, color:'#fff', lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:'.72rem', color:'var(--celeste)', marginTop:4, letterSpacing:'.04em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" style={{ padding:'96px 0', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <h2 style={{ color:'var(--azul)', marginBottom:12, fontSize:'clamp(1.8rem,3vw,2.6rem)' }}>{t.howTitle}</h2>
            <p style={{ fontSize:'1.05rem', maxWidth:520, margin:'0 auto', color:'#666' }}>{t.howDesc}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:24 }}>
            {[
              { n:'01', ico:'📅', t:t.step1t, d:t.step1d },
              { n:'02', ico:'💳', t:t.step2t, d:t.step2d },
              { n:'03', ico:'📹', t:t.step3t, d:t.step3d },
              { n:'04', ico:'⚖️', t:t.step4t, d:t.step4d },
            ].map((s, i) => (
              <div key={i} style={{ background:'#fff', border:'1px solid #e8ecf2', borderRadius:20, padding:'36px 28px', position:'relative', boxShadow:'0 2px 12px rgba(0,24,61,.06)', transition:'all .3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 12px 36px rgba(0,24,61,.14)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,24,61,.06)' }}>
                <div style={{ position:'absolute', top:20, right:24, fontFamily:'var(--display)', fontSize:'3rem', fontWeight:800, color:'var(--celeste)', opacity:.25 }}>{s.n}</div>
                <div style={{ fontSize:'1.7rem', marginBottom:16 }}>{s.ico}</div>
                <h3 style={{ color:'var(--azul)', marginBottom:10, fontSize:'1.1rem' }}>{s.t}</h3>
                <p style={{ fontSize:'.9rem', color:'#666' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ESPECIALIDADES ── */}
      <section id="especialidades" style={{ padding:'96px 0', background:'var(--gris)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <h2 style={{ color:'var(--azul)', marginBottom:12 }}>{t.specsTitle}</h2>
            <p style={{ fontSize:'1.05rem', maxWidth:520, margin:'0 auto', color:'#666' }}>{t.specsDesc}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
            {SPECS.map(s => (
              <div key={s.key}
                onMouseEnter={() => setHovSpec(s.key)}
                onMouseLeave={() => setHovSpec(null)}
                onClick={openConsult}
                style={{ border:`1px solid ${hovSpec===s.key?'transparent':'#e2e8f0'}`, borderRadius:16, padding:'28px 20px', textAlign:'center', cursor:'pointer', background: hovSpec===s.key ? 'var(--azul)' : '#fff', transform: hovSpec===s.key?'translateY(-5px)':'none', boxShadow: hovSpec===s.key?'0 12px 32px rgba(0,24,61,.18)':'none', transition:'all .25s' }}>
                <div style={{ fontSize:'2.2rem', marginBottom:12, display:'inline-block', transition:'transform .25s', transform: hovSpec===s.key?'scale(1.15) rotate(-5deg)':'none' }}>{s.ico}</div>
                <h4 style={{ fontSize:'.95rem', fontWeight:700, color: hovSpec===s.key?'#fff':'var(--azul)', marginBottom:6, fontFamily:'var(--display)', transition:'color .25s' }}>{lang==='es' ? s.esp : s.en}</h4>
                <p style={{ fontSize:'.8rem', color: hovSpec===s.key?'rgba(255,255,255,.8)':'#777', transition:'color .25s' }}>{lang==='es' ? s.descEs : s.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCIA ── */}
      <section id="experiencia" style={{ padding:'96px 0', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
          <div>
            <h2 style={{ color:'var(--azul)', marginBottom:18 }}>{t.expTitle}</h2>
            <p style={{ marginBottom:14 }}>{t.expDesc1}</p>
            <p style={{ marginBottom:28 }}>{t.expDesc2}</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[['2,400+', lang==='es'?'Casos resueltos':'Cases resolved'], ['98%', lang==='es'?'Satisfacción':'Satisfaction'], ['24h', lang==='es'?'Respuesta':'Response'], ['$0', lang==='es'?'Registro':'Registration']].map(([n, l]) => (
                <div key={l} style={{ background:'var(--gris)', borderRadius:12, padding:18, borderLeft:'4px solid var(--dorado)' }}>
                  <div style={{ fontFamily:'var(--display)', fontSize:'1.9rem', fontWeight:800, color:'var(--azul)', lineHeight:1 }}>{n}</div>
                  <div style={{ fontSize:'.78rem', color:'#888', marginTop:4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position:'relative', borderRadius:20, overflow:'hidden', height:460, boxShadow:'0 16px 48px rgba(0,24,61,.16)' }}>
            <img src={VC_URL} alt="Abogado en videollamada" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,17,40,.85) 0%, transparent 55%)', display:'flex', alignItems:'flex-end', padding:32 }}>
              <div style={{ background:'rgba(255,255,255,.1)', backdropFilter:'blur(10px)', border:'1px solid rgba(185,206,237,.3)', borderRadius:14, padding:'20px 26px', color:'#fff' }}>
                <h4 style={{ fontSize:'1.1rem', marginBottom:6, color:'#fff' }}>{t.expCard}</h4>
                <p style={{ color:'rgba(255,255,255,.8)', fontSize:'.88rem', lineHeight:1.6 }}>{t.expCardDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PANEL ABOGADOS ── */}
      <section id="panel-abogados" style={{ padding:'96px 0', background:'var(--azul)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-30%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(202,161,129,.08) 0%, transparent 70%)' }}/>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <h2 style={{ color:'#fff', marginBottom:12 }}>{t.lawyersTitle}</h2>
            <p style={{ color:'rgba(185,206,237,.8)', fontSize:'1.05rem', maxWidth:500, margin:'0 auto' }}>{t.lawyersDesc}</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:24, marginBottom:48 }}>
            {[['📂', lang==='es'?'Casos Abiertos':'Open Cases', lang==='es'?'Expedientes activos, documentos del cliente, historial de videollamadas.':'Active files, client documents, video call history.'],
              ['✅', lang==='es'?'Casos Cerrados':'Closed Cases', lang==='es'?'Historial de casos resueltos con resultados, notas y calificaciones.':'History of resolved cases with results, notes and ratings.'],
              ['📆', lang==='es'?'Agenda & Pagos':'Schedule & Payments', lang==='es'?'Calendario, cobro automático vía Stripe Connect y reportes de ingresos.':'Calendar, automatic billing via Stripe Connect and income reports.']
            ].map(([ico, title, desc], i) => (
              <div key={i} style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(185,206,237,.15)', borderRadius:20, padding:'32px 26px', transition:'all .3s', position:'relative', overflow:'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.09)'; e.currentTarget.style.transform='translateY(-4px)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.transform='none' }}>
                <div style={{ fontSize:'2rem', marginBottom:16 }}>{ico}</div>
                <h3 style={{ color:'#fff', marginBottom:10, fontSize:'1.15rem' }}>{title}</h3>
                <p style={{ color:'rgba(185,206,237,.75)', fontSize:'.88rem', lineHeight:1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(202,161,129,.3)', borderRadius:20, padding:'44px 40px', textAlign:'center' }}>
            <h3 style={{ color:'#fff', fontSize:'1.5rem', marginBottom:10, fontFamily:'var(--display)' }}>{lang==='es'?'¿Eres abogado certificado?':'Are you a certified lawyer?'}</h3>
            <p style={{ color:'rgba(185,206,237,.8)', fontSize:'1rem', maxWidth:480, margin:'0 auto 24px' }}>{lang==='es'?'Únete a nuestra red, recibe clientes en línea y gestiona tu práctica legal 100% remota.':'Join our network, receive clients online and manage your legal practice 100% remotely.'}</p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => setModal('register')} style={{ background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff', border:'none', padding:'14px 32px', borderRadius:10, fontSize:'1rem', fontWeight:700, cursor:'pointer', boxShadow:'0 6px 20px rgba(202,161,129,.3)' }}>{lang==='es'?'Registrarme como abogado':'Register as a lawyer'}</button>
              <button onClick={() => setModal('login')} style={{ background:'transparent', color:'#fff', border:'1.5px solid rgba(185,206,237,.4)', padding:'14px 32px', borderRadius:10, fontSize:'1rem', fontWeight:500, cursor:'pointer' }}>{lang==='es'?'Iniciar sesión — Abogados':'Sign in — Lawyers'}</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" style={{ padding:'96px 0', background:'linear-gradient(180deg,var(--azul) 0%,var(--oscuro) 100%)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <h2 style={{ color:'#fff', marginBottom:12 }}>{t.priceTitle}</h2>
            <p style={{ color:'rgba(185,206,237,.8)', fontSize:'1.05rem', maxWidth:480, margin:'0 auto' }}>{t.priceDesc}</p>
          </div>
          <div style={{ maxWidth:520, margin:'0 auto', background:'rgba(255,255,255,.07)', border:'1.5px solid rgba(202,161,129,.35)', borderRadius:22, padding:'52px 48px', textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,.3)' }}>
            <span style={{ display:'inline-block', background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff', fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', padding:'5px 18px', borderRadius:50, marginBottom:28, boxShadow:'0 4px 14px rgba(202,161,129,.3)' }}>{t.priceBadge}</span>
            <div style={{ fontFamily:'var(--display)', fontSize:'4rem', fontWeight:800, color:'#fff', lineHeight:1, marginBottom:6 }}>$49.99 <span style={{ fontSize:'1.1rem', fontWeight:300, color:'var(--celeste)' }}>USD</span></div>
            <div style={{ color:'var(--celeste)', opacity:.7, marginBottom:28, fontSize:'.9rem' }}>≈ $850 MXN</div>
            <ul style={{ listStyle:'none', textAlign:'left', marginBottom:34 }}>
              {[t.priceFeat1,t.priceFeat2,t.priceFeat3,t.priceFeat4,t.priceFeat5,t.priceFeat6].map((f, i) => (
                <li key={i} style={{ color:'rgba(255,255,255,.82)', fontSize:'.92rem', padding:'10px 0', borderBottom:'1px solid rgba(185,206,237,.08)', display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ color:'var(--dorado)', fontWeight:700, fontSize:'1rem', flexShrink:0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={openConsult} style={{ width:'100%', background:'linear-gradient(135deg,#CAA181,#b88c6a)', color:'#fff', border:'none', padding:'16px', borderRadius:12, fontSize:'1.05rem', fontWeight:700, cursor:'pointer', boxShadow:'0 8px 24px rgba(202,161,129,.35)', transition:'all .3s' }}>{t.priceBtn}</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:'var(--oscuro)', padding:'60px 0 32px', borderTop:'1px solid rgba(185,206,237,.1)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:48 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <svg viewBox="0 0 230 160" width="28" height="20"><polygon points="0,155 31,155 73,0 42,0" fill="#000"/><polygon points="68,0 99,0 123,155 92,155" fill="#000"/><polygon points="105,155 136,155 169,0 138,0" fill="#000"/><polygon points="165,0 196,0 230,155 199,155" fill="#000"/><rect x="53" y="83" width="96" height="16" rx="3" fill="#B9CEED"/></svg>
                <span style={{ fontFamily:'var(--display)', fontSize:'1rem', fontWeight:700, color:'#fff', letterSpacing:'.06em' }}>ABOGAMÉXICO</span>
              </div>
              <p style={{ color:'rgba(185,206,237,.65)', fontSize:'.88rem', maxWidth:260, lineHeight:1.7 }}>{t.footDesc}</p>
            </div>
            {[[t.footPlatform,['Cómo funciona','Especialidades','Precios','Soy abogado']],[t.footLegal,['Términos de uso','Aviso de privacidad','Aviso legal']],[t.footContact,['hola@abogamexico.com','WhatsApp','Instagram','LinkedIn']]].map(([title, items]) => (
              <div key={title}>
                <h5 style={{ color:'#fff', fontSize:'.8rem', fontWeight:700, letterSpacing:'.07em', marginBottom:18, textTransform:'uppercase' }}>{title}</h5>
                {items.map(item => <a key={item} href="#" style={{ display:'block', color:'rgba(185,206,237,.6)', fontSize:'.85rem', marginBottom:10, transition:'color .2s' }} onMouseEnter={e=>e.target.style.color='var(--dorado)'} onMouseLeave={e=>e.target.style.color='rgba(185,206,237,.6)'}>{item}</a>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(185,206,237,.1)', paddingTop:24, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:'.8rem' }}>{t.footRights}</p>
            <p style={{ color:'rgba(255,255,255,.4)', fontSize:'.78rem' }}>{t.footDisclaimer}</p>
          </div>
        </div>
      </footer>

      {modal && <AuthModal type={modal} onClose={() => setModal(null)} onSwitch={setModal} />}
    </div>
  )
}
