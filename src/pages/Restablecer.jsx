import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

// Página a la que llega el enlace de "¿Olvidaste tu contraseña?"
export default function Restablecer() {
  const navigate = useNavigate()
  const [listo, setListo] = useState(false)      // ya hay sesión de recuperación
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [msg, setMsg] = useState(null)           // { tipo: 'ok'|'error', texto }
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    document.title = 'Nueva contraseña — AbogaMéxico'
    const err = new URLSearchParams(window.location.hash.slice(1)).get('error_code')
    if (err) setMsg({ tipo: 'error', texto: 'El enlace ya expiró o ya se usó. Pide uno nuevo desde "Iniciar sesión" → "¿Olvidaste tu contraseña?".' })
    supabase.auth.getSession().then(({ data }) => { if (data.session) setListo(true) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((ev, session) => {
      if (session && (ev === 'PASSWORD_RECOVERY' || ev === 'SIGNED_IN')) setListo(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function guardar() {
    setMsg(null)
    if (p1.length < 8) return setMsg({ tipo: 'error', texto: 'La contraseña debe tener al menos 8 caracteres.' })
    if (p1 !== p2) return setMsg({ tipo: 'error', texto: 'Las contraseñas no coinciden.' })
    setGuardando(true)
    const { data, error } = await supabase.auth.updateUser({ password: p1 })
    setGuardando(false)
    if (error) return setMsg({ tipo: 'error', texto: 'No pudimos cambiarla: ' + error.message })
    setMsg({ tipo: 'ok', texto: '¡Listo! Tu contraseña se actualizó.' })
    const tipo = data.user?.user_metadata?.tipo
    setTimeout(() => navigate(tipo === 'abogado' ? '/abogado' : '/dashboard'), 1500)
  }

  const input = { width: '100%', padding: '12px 14px', border: '1.5px solid #d5dbe5', borderRadius: 9, fontSize: '.95rem', marginTop: 6 }
  return (
    <div style={{ background: 'var(--gris)', minHeight: '100vh' }}>
      <Navbar scrolled />
      <main style={{ maxWidth: 460, margin: '0 auto', padding: '130px 20px 60px' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: 'var(--sh)' }}>
          <h1 style={{ color: 'var(--azul)', fontSize: '1.6rem', marginBottom: 8 }}>Crea una contraseña nueva</h1>
          {!listo && !msg && <p>Verificando tu enlace…</p>}
          {listo && (
            <>
              <label style={{ display: 'block', marginTop: 18, fontSize: '.85rem', fontWeight: 600, color: '#444' }}>Nueva contraseña (mín. 8 caracteres)
                <input type="password" style={input} value={p1} onChange={e => setP1(e.target.value)} autoComplete="new-password" />
              </label>
              <label style={{ display: 'block', marginTop: 14, fontSize: '.85rem', fontWeight: 600, color: '#444' }}>Repítela
                <input type="password" style={input} value={p2} onChange={e => setP2(e.target.value)} autoComplete="new-password" onKeyDown={e => e.key === 'Enter' && guardar()} />
              </label>
              <button onClick={guardar} disabled={guardando} style={{ width: '100%', marginTop: 20, padding: 14, borderRadius: 10, background: 'var(--grad-acento)', color: 'var(--sobre-acento)', fontWeight: 700, fontSize: '1rem' }}>
                {guardando ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </>
          )}
          {msg && <p role="status" style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, fontSize: '.9rem', background: msg.tipo === 'ok' ? '#e8f5e9' : '#fdecea', color: msg.tipo === 'ok' ? '#1b5e20' : '#b3261e' }}>{msg.texto}</p>}
        </div>
      </main>
    </div>
  )
}
