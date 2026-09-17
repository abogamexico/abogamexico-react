import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { supabase } from '../lib/supabase'

const S = {
  overlay: { position:'fixed',inset:0,background:'rgba(0,17,40,.75)',backdropFilter:'blur(6px)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 },
  modal: { background:'#fff',borderRadius:20,maxWidth:520,width:'100%',maxHeight:'90vh',overflowY:'auto',position:'relative',boxShadow:'0 24px 64px rgba(0,0,0,.4)',animation:'mIn .3s ease' },
  close: { position:'absolute',top:14,right:14,width:34,height:34,borderRadius:'50%',background:'#f0f0f0',border:'none',fontSize:'1rem',color:'#777',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2 },
  body: { padding:'40px 36px 34px' },
  head: { marginBottom:24 },
  h3: { fontFamily:'var(--display)',fontSize:'1.6rem',color:'var(--azul)',marginBottom:6 },
  p: { fontSize:'.88rem',color:'#777' },
  tabs: { display:'flex',background:'#f0f4f8',borderRadius:10,padding:4,marginBottom:22 },
  tab: { flex:1,padding:'10px',borderRadius:8,border:'none',fontFamily:'var(--sans)',fontSize:'.88rem',fontWeight:600,cursor:'pointer',transition:'all .2s' },
  tabOn: { background:'var(--azul)',color:'#fff',boxShadow:'0 3px 10px rgba(0,24,61,.2)' },
  tabOff: { background:'none',color:'#888' },
  fg: { marginBottom:15 },
  label: { display:'block',fontSize:'.78rem',fontWeight:600,color:'#555',marginBottom:5 },
  input: { width:'100%',padding:'11px 13px',border:'1.5px solid #e0e4ea',borderRadius:9,fontFamily:'var(--sans)',fontSize:'.9rem',color:'#111',outline:'none',transition:'border-color .2s',background:'#fff' },
  row: { display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 },
  btn: { width:'100%',marginTop:6,padding:'13px',borderRadius:10,border:'none',fontFamily:'var(--sans)',fontSize:'.95rem',fontWeight:700,cursor:'pointer',background:'linear-gradient(135deg,#CAA181,#b88c6a)',color:'#fff',boxShadow:'0 6px 20px rgba(202,161,129,.3)',transition:'all .2s' },
  note: { fontSize:'.78rem',color:'#999',textAlign:'center',marginTop:12 },
  noteLink: { color:'var(--dorado)',cursor:'pointer',fontWeight:600 },
  err: { color:'#dc2626',fontSize:'.76rem',marginTop:4 },
  ok: { color:'#16a34a',fontSize:'.76rem',marginTop:4 },
  select: { width:'100%',padding:'11px 13px',border:'1.5px solid #e0e4ea',borderRadius:9,fontFamily:'var(--sans)',fontSize:'.9rem',color:'#111',outline:'none',background:'#fff' },
  textarea: { width:'100%',padding:'11px 13px',border:'1.5px solid #e0e4ea',borderRadius:9,fontFamily:'var(--sans)',fontSize:'.9rem',color:'#111',outline:'none',background:'#fff',resize:'vertical',minHeight:70 },
  successBox: { textAlign:'center',padding:'16px 0' },
  successIco: { fontSize:'3rem',marginBottom:14 },
  stripeNote: { textAlign:'center',fontSize:'.73rem',color:'#ccc',marginTop:10 },
}

const ESTADOS_MX = ['Ciudad de México','Jalisco','Nuevo León','Puebla','Yucatán','Guanajuato','Veracruz','Chihuahua','Coahuila','Oaxaca','Guerrero','Hidalgo','Michoacán','Sinaloa','Tamaulipas']
const ESPECIALIDADES = ['Derecho Civil','Derecho Migratorio','Derecho Familiar','Derecho Penal','Derecho Inmobiliario','Derecho Mercantil','Derecho Fiscal','Seguridad Social','Derecho Administrativo','Derecho Agrario']

export default function AuthModal({ type, onClose, onSwitch }) {
  const { t } = useLang()
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('client') // 'client' | 'lawyer'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [cedErr, setCedErr] = useState('')
  const [cedOk, setCedOk] = useState('')

  // Form fields
  const [form, setForm] = useState({
    nombre:'', apellido:'', email:'', password:'', telefono:'',
    pais:'Estados Unidos', ciudad:'', cedula:'', especialidad:'Derecho Civil',
    estado:'', bio:''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function validateCedula(v) {
    const clean = v.replace(/\D/g,'').slice(0,8)
    set('cedula', clean)
    if (clean.length >= 6 && clean.length <= 8) { setCedOk(t.cedValid); setCedErr('') }
    else if (clean.length > 0) { setCedErr(t.cedError); setCedOk('') }
    else { setCedErr(''); setCedOk('') }
  }

  async function handleLogin() {
    setError(''); setLoading(true)
    try {
      const { user } = await signIn(form.email, form.password)
      const tipo = user?.user_metadata?.tipo
      onClose()
      navigate(tipo === 'abogado' ? '/abogado' : '/dashboard')
    } catch (e) {
      setError(e.message.includes('Invalid') ? 'Correo o contraseña incorrectos.' : e.message)
    } finally { setLoading(false) }
  }

  async function handleRegisterClient() {
    if (!form.nombre || !form.email || !form.password) { setError('Completa nombre, correo y contraseña.'); return }
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setError(''); setLoading(true)
    try {
      const { user } = await signUp(form.email, form.password, { nombre: form.nombre, apellido: form.apellido, tipo: 'cliente' })
      if (user) {
        await supabase.from('usuarios').upsert({ id: user.id, email: form.email, nombre: form.nombre, apellido: form.apellido, pais: form.pais, telefono: form.telefono, ciudad: form.ciudad })
      }
      setSuccess(true)
    } catch (e) {
      setError(e.message.includes('already') ? 'Este correo ya está registrado.' : e.message)
    } finally { setLoading(false) }
  }

  async function handleRegisterLawyer() {
    if (!form.cedula || form.cedula.length < 6) { setCedErr(t.cedError); return }
    if (!form.nombre || !form.email || !form.password) { setError('Completa nombre, correo y contraseña.'); return }
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    setError(''); setLoading(true)
    try {
      const { user } = await signUp(form.email, form.password, { nombre: form.nombre, apellido: form.apellido, tipo: 'abogado', cedula: form.cedula })
      if (user) {
        await supabase.from('abogados').upsert({ id: user.id, email: form.email, nombre: form.nombre, apellido: form.apellido, telefono: form.telefono, cedula: form.cedula, especialidad: form.especialidad, estado: form.estado, ciudad: form.ciudad, bio: form.bio, verificado: false })
      }
      setSuccess(true)
    } catch (e) {
      setError(e.message.includes('already') ? 'Este correo ya está registrado.' : e.message)
    } finally { setLoading(false) }
  }

  if (success) return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.body}>
          <div style={S.successBox}>
            <div style={S.successIco}>{type === 'register' && tab === 'lawyer' ? '⚖️' : '🎉'}</div>
            <h3 style={{...S.h3, textAlign:'center', marginBottom:10}}>{tab === 'lawyer' ? 'Solicitud enviada' : '¡Cuenta creada!'}</h3>
            <p style={{...S.p, textAlign:'center', marginBottom:20}}>
              {tab === 'lawyer'
                ? `Verificaremos tu cédula ${form.cedula} con la SEP en 24–48 horas y activaremos tu perfil.`
                : `Bienvenido, ${form.nombre}. Revisa tu correo ${form.email} para verificar tu cuenta.`}
            </p>
            <button style={S.btn} onClick={onClose}>Entendido</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <button style={S.close} onClick={onClose}>✕</button>
        <div style={S.body}>
          {type === 'login' ? (
            <>
              <div style={S.head}>
                <h3 style={S.h3}>{t.loginTitle}</h3>
                <p style={S.p}>{t.loginDesc}</p>
              </div>
              <div style={S.tabs}>
                <button style={{...S.tab, ...(tab==='client'?S.tabOn:S.tabOff)}} onClick={() => setTab('client')}>{t.asClient}</button>
                <button style={{...S.tab, ...(tab==='lawyer'?S.tabOn:S.tabOff)}} onClick={() => setTab('lawyer')}>{t.asLawyer}</button>
              </div>
              <div style={S.fg}><label style={S.label}>{t.email}</label><input style={S.input} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.com" onKeyDown={e => e.key==='Enter' && handleLogin()}/></div>
              <div style={S.fg}><label style={S.label}>{t.password}</label><input style={S.input} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" onKeyDown={e => e.key==='Enter' && handleLogin()}/></div>
              {error && <p style={S.err}>{error}</p>}
              <button style={{...S.btn, opacity: loading?.8:1}} onClick={handleLogin} disabled={loading}>
                {loading ? 'Verificando...' : (tab==='lawyer' ? t.enterPanel : t.enterBtn)}
              </button>
              <p style={S.note}>{t.noAccount} <span style={S.noteLink} onClick={() => onSwitch('register')}>{t.registerFree}</span></p>
            </>
          ) : (
            <>
              <div style={S.head}>
                <h3 style={S.h3}>{t.registerTitle}</h3>
                <p style={S.p}>{t.registerDesc}</p>
              </div>
              <div style={S.tabs}>
                <button style={{...S.tab, ...(tab==='client'?S.tabOn:S.tabOff)}} onClick={() => setTab('client')}>{t.asClient}</button>
                <button style={{...S.tab, ...(tab==='lawyer'?S.tabOn:S.tabOff)}} onClick={() => setTab('lawyer')}>{t.asLawyer}</button>
              </div>
              {tab === 'client' ? (
                <>
                  <div style={S.row}>
                    <div style={S.fg}><label style={S.label}>{t.firstName}</label><input style={S.input} value={form.nombre} onChange={e => set('nombre',e.target.value)} placeholder="Juan"/></div>
                    <div style={S.fg}><label style={S.label}>{t.lastName}</label><input style={S.input} value={form.apellido} onChange={e => set('apellido',e.target.value)} placeholder="García"/></div>
                  </div>
                  <div style={S.fg}><label style={S.label}>{t.email}</label><input style={S.input} type="email" value={form.email} onChange={e => set('email',e.target.value)} placeholder="juan@ejemplo.com"/></div>
                  <div style={S.fg}><label style={S.label}>{t.phone}</label><input style={S.input} type="tel" value={form.telefono} onChange={e => set('telefono',e.target.value)} placeholder="+1 312 555 0100"/></div>
                  <div style={S.row}>
                    <div style={S.fg}><label style={S.label}>{t.country}</label><select style={S.select} value={form.pais} onChange={e => set('pais',e.target.value)}><option>Estados Unidos</option><option>México</option><option>Otro</option></select></div>
                    <div style={S.fg}><label style={S.label}>{t.city}</label><input style={S.input} value={form.ciudad} onChange={e => set('ciudad',e.target.value)} placeholder="Chicago, IL"/></div>
                  </div>
                  <div style={S.fg}><label style={S.label}>{t.minPass}</label><input style={S.input} type="password" value={form.password} onChange={e => set('password',e.target.value)} placeholder="••••••••"/></div>
                  {error && <p style={S.err}>{error}</p>}
                  <button style={{...S.btn, opacity:loading?.8:1}} onClick={handleRegisterClient} disabled={loading}>{loading ? 'Creando...' : t.createBtn}</button>
                  <p style={S.note}>{t.terms} <span style={S.noteLink}>{t.termsLink}</span></p>
                  <p style={S.note}>{t.alreadyAccount} <span style={S.noteLink} onClick={() => onSwitch('login')}>{t.loginLink}</span></p>
                </>
              ) : (
                <>
                  <div style={{...S.fg, background:'#f8faff', padding:'10px 14px', borderRadius:9, marginBottom:14, fontSize:'.8rem', color:'#555', borderLeft:'3px solid var(--dorado)'}}>DATOS PERSONALES</div>
                  <div style={S.row}>
                    <div style={S.fg}><label style={S.label}>{t.firstName}</label><input style={S.input} value={form.nombre} onChange={e => set('nombre',e.target.value)} placeholder="María"/></div>
                    <div style={S.fg}><label style={S.label}>{t.lastName}</label><input style={S.input} value={form.apellido} onChange={e => set('apellido',e.target.value)} placeholder="López"/></div>
                  </div>
                  <div style={S.fg}><label style={S.label}>{t.email}</label><input style={S.input} type="email" value={form.email} onChange={e => set('email',e.target.value)} placeholder="lic@despacho.com"/></div>
                  <div style={S.fg}><label style={S.label}>{t.phone}</label><input style={S.input} type="tel" value={form.telefono} onChange={e => set('telefono',e.target.value)} placeholder="+52 55 1234 5678"/></div>
                  <div style={{...S.fg, background:'#f8faff', padding:'10px 14px', borderRadius:9, marginBottom:14, marginTop:8, fontSize:'.8rem', color:'#555', borderLeft:'3px solid var(--dorado)'}}>DATOS PROFESIONALES</div>
                  <div style={S.fg}>
                    <label style={S.label}>{t.cedula}</label>
                    <input style={S.input} value={form.cedula} onChange={e => validateCedula(e.target.value)} placeholder="Ej. 3821045" maxLength={8}/>
                    {cedErr && <p style={S.err}>{cedErr}</p>}
                    {cedOk && <p style={S.ok}>{cedOk}</p>}
                  </div>
                  <div style={S.row}>
                    <div style={S.fg}><label style={S.label}>{t.stateDrop}</label><select style={S.select} value={form.estado} onChange={e => set('estado',e.target.value)}><option value="">Selecciona...</option>{ESTADOS_MX.map(e => <option key={e}>{e}</option>)}</select></div>
                    <div style={S.fg}><label style={S.label}>{t.city}</label><input style={S.input} value={form.ciudad} onChange={e => set('ciudad',e.target.value)} placeholder="Guadalajara"/></div>
                  </div>
                  <div style={S.fg}><label style={S.label}>{t.specialty}</label><select style={S.select} value={form.especialidad} onChange={e => set('especialidad',e.target.value)}>{ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}</select></div>
                  <div style={S.fg}><label style={S.label}>{t.bio}</label><textarea style={S.textarea} value={form.bio} onChange={e => set('bio',e.target.value)} placeholder={t.bioPlaceholder}/></div>
                  <div style={S.fg}><label style={S.label}>{t.minPass}</label><input style={S.input} type="password" value={form.password} onChange={e => set('password',e.target.value)} placeholder="••••••••"/></div>
                  {error && <p style={S.err}>{error}</p>}
                  <button style={{...S.btn, opacity:loading?.8:1}} onClick={handleRegisterLawyer} disabled={loading}>{loading ? 'Enviando...' : t.requestBtn}</button>
                  <p style={S.note}>{t.cedulaNote}</p>
                  <p style={S.note}>{t.alreadyAccount} <span style={S.noteLink} onClick={() => onSwitch('login')}>{t.loginLink}</span></p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
