import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import AuthModal from './AuthModal'
import Logo from './Logo'

const styles = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900, transition: 'all .3s', padding: '14px 0' },
  navScrolled: { background: 'rgba(0,24,61,.92)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 20px rgba(0,0,0,.25)', padding: '10px 0' },
  inner: { maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 28 },
  links: { display: 'flex', gap: 26, marginLeft: 'auto' },
  link: { color: 'rgba(255,255,255,.85)', fontSize: '.88rem', fontWeight: 500, cursor: 'pointer', transition: 'color .2s', background: 'none', padding: 0 },
  actions: { display: 'flex', gap: 10, alignItems: 'center' },
  btnLang: { background: 'rgba(185,206,237,.12)', color: '#fff', border: '1px solid rgba(185,206,237,.3)', padding: '8px 14px', borderRadius: 8, fontSize: '.8rem', fontWeight: 600 },
  btnOutline: { background: 'transparent', color: '#fff', border: '1.5px solid rgba(185,206,237,.4)', padding: '10px 20px', borderRadius: 9, fontSize: '.88rem', fontWeight: 600 },
  btnGold: { background: 'var(--grad-acento)', color: 'var(--sobre-acento)', padding: '10px 20px', borderRadius: 9, fontSize: '.88rem', fontWeight: 600, boxShadow: '0 4px 14px rgba(var(--acento-rgb),.3)' },
  userName: { color: 'rgba(255,255,255,.75)', fontSize: '.82rem' },
  ham: { flexDirection: 'column', justifyContent: 'center', gap: 5, background: 'none', marginLeft: 'auto', width: 44, height: 44, alignItems: 'center' },
  hamLine: { display: 'block', width: 22, height: 2, background: '#fff', borderRadius: 2 },
}

export default function Navbar({ scrolled }) {
  const { user, signOut } = useAuth()
  const { t, toggleLang, lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [modal, setModal] = useState(null) // 'login' | 'register'
  const [open, setOpen] = useState(false)

  function goToPanel() {
    setOpen(false)
    const tipo = user?.user_metadata?.tipo
    navigate(tipo === 'abogado' ? '/abogado' : '/dashboard')
  }

  function scrollTo(id) {
    setOpen(false)
    if (location.pathname !== '/') { navigate('/#' + id); return }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  function openModal(m) { setOpen(false); setModal(m) }

  const navItems = [['como-funciona', t.navHow], ['especialidades', t.navSpecs], ['panel-abogados', t.navLawyers], ['precios', t.navPricing]]

  return (
    <>
      <nav style={{ ...styles.nav, ...(scrolled || open ? styles.navScrolled : {}) }}>
        <div style={styles.inner}>
          <a href="/" style={{ display: 'flex' }}>
            <Logo size={34} sub={lang === 'es' ? 'Consultorio Jurídico Virtual' : 'Virtual Legal Office'} />
          </a>

          <div className="nav-links" style={styles.links}>
            {navItems.map(([id, label]) => (
              <button key={id} style={styles.link} onClick={() => scrollTo(id)}
                onMouseEnter={e => e.target.style.color = 'var(--celeste)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.85)'}>{label}</button>
            ))}
          </div>

          <div className="nav-actions" style={styles.actions}>
            <button style={styles.btnLang} onClick={toggleLang}>{lang === 'es' ? 'EN' : 'ES'}</button>
            {user ? (
              <>
                <span style={styles.userName}>{user.user_metadata?.nombre || user.email.split('@')[0]}</span>
                <button style={styles.btnGold} onClick={goToPanel}>{t.navPanel}</button>
                <button style={styles.btnOutline} onClick={signOut}>{t.navSignOut}</button>
              </>
            ) : (
              <>
                <button style={styles.btnOutline} onClick={() => setModal('login')}>{t.navLogin}</button>
                <button style={styles.btnGold} onClick={() => setModal('register')}>{t.navRegister}</button>
              </>
            )}
          </div>

          <button className="nav-ham" style={styles.ham} onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open}>
            <span style={{ ...styles.hamLine, transform: open ? 'translateY(7px) rotate(45deg)' : 'none', transition: 'transform .2s' }} />
            <span style={{ ...styles.hamLine, opacity: open ? 0 : 1, transition: 'opacity .2s' }} />
            <span style={{ ...styles.hamLine, transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none', transition: 'transform .2s' }} />
          </button>
        </div>
      </nav>

      <div className="nav-drawer" hidden={!open}>
        {navItems.map(([id, label]) => <button key={id} onClick={() => scrollTo(id)}>{label}</button>)}
        <button onClick={() => { toggleLang(); setOpen(false) }}>{lang === 'es' ? 'English' : 'Español'}</button>
        {user ? (
          <>
            <button className="drawer-cta" onClick={goToPanel}>{t.navPanel}</button>
            <button className="drawer-sec" onClick={() => { setOpen(false); signOut() }}>{t.navSignOut}</button>
          </>
        ) : (
          <>
            <button className="drawer-cta" onClick={() => openModal('register')}>{t.navRegister}</button>
            <button className="drawer-sec" onClick={() => openModal('login')}>{t.navLogin}</button>
          </>
        )}
      </div>

      {modal && <AuthModal type={modal} onClose={() => setModal(null)} onSwitch={setModal} />}
    </>
  )
}
