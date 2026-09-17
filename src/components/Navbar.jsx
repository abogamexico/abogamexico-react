import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import AuthModal from './AuthModal'

const styles = {
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 900, transition: 'all .3s', padding: '14px 0' },
  navScrolled: { background: 'rgba(0,24,61,.9)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 20px rgba(0,0,0,.25)', padding: '10px 0' },
  inner: { maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 32 },
  logo: { display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 },
  logoText: { display: 'flex', flexDirection: 'column', lineHeight: 1.1 },
  logoName: { fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 700, color: '#fff', letterSpacing: '.07em' },
  logoSub: { fontSize: '.58rem', color: 'var(--celeste)', letterSpacing: '.08em' },
  sep: { width: 1, height: 26, background: 'rgba(185,206,237,.25)' },
  links: { display: 'flex', gap: 28, marginLeft: 'auto' },
  link: { color: 'rgba(255,255,255,.8)', fontSize: '.88rem', fontWeight: 500, cursor: 'pointer', transition: 'color .2s', background: 'none', padding: 0 },
  actions: { display: 'flex', gap: 10, alignItems: 'center' },
  btnLang: { background: 'rgba(185,206,237,.12)', color: '#fff', border: '1px solid rgba(185,206,237,.3)', padding: '8px 14px', borderRadius: 8, fontSize: '.8rem', fontWeight: 600 },
  btnOutline: { background: 'transparent', color: '#fff', border: '1.5px solid rgba(185,206,237,.4)', padding: '10px 20px', borderRadius: 9, fontSize: '.88rem', fontWeight: 600 },
  btnGold: { background: 'linear-gradient(135deg,#CAA181,#b88c6a)', color: '#fff', padding: '10px 20px', borderRadius: 9, fontSize: '.88rem', fontWeight: 600, boxShadow: '0 4px 14px rgba(202,161,129,.3)' },
  userName: { color: 'rgba(255,255,255,.75)', fontSize: '.82rem' },
  ham: { display: 'none', flexDirection: 'column', gap: 5, background: 'none', marginLeft: 'auto' },
  hamLine: { display: 'block', width: 22, height: 2, background: '#fff', borderRadius: 2 },
}

export default function Navbar({ scrolled }) {
  const { user, signOut } = useAuth()
  const { t, toggleLang, lang } = useLang()
  const navigate = useNavigate()
  const [modal, setModal] = useState(null) // 'login' | 'register'

  function goToPanel() {
    const tipo = user?.user_metadata?.tipo
    navigate(tipo === 'abogado' ? '/abogado' : '/dashboard')
  }

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
        <div style={styles.inner}>
          {/* Logo */}
          <div style={styles.logo}>
            <svg viewBox="0 0 230 160" width="34" height="24">
              <polygon points="0,155 31,155 73,0 42,0" fill="#000"/>
              <polygon points="68,0 99,0 123,155 92,155" fill="#000"/>
              <polygon points="105,155 136,155 169,0 138,0" fill="#000"/>
              <polygon points="165,0 196,0 230,155 199,155" fill="#000"/>
              <rect x="53" y="83" width="96" height="16" rx="3" fill="#B9CEED"/>
            </svg>
            <div style={styles.sep}/>
            <div style={styles.logoText}>
              <span style={styles.logoName}>ABOGAMÉXICO</span>
              <span style={styles.logoSub}>Consultorio Jurídico Virtual</span>
            </div>
          </div>

          {/* Nav links */}
          <div style={styles.links}>
            {[['como-funciona', t.navHow], ['especialidades', t.navSpecs], ['panel-abogados', t.navLawyers], ['precios', t.navPricing]].map(([id, label]) => (
              <button key={id} style={styles.link} onClick={() => scrollTo(id)}
                onMouseEnter={e => e.target.style.color = 'var(--celeste)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.8)'}>{label}</button>
            ))}
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button style={styles.btnLang} onClick={toggleLang}>🌐 {lang === 'es' ? 'EN' : 'ES'}</button>
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
        </div>
      </nav>

      {modal && <AuthModal type={modal} onClose={() => setModal(null)} onSwitch={setModal} />}
    </>
  )
}
