// Logo AbogaMéxico — símbolo "El Puente" (A con arco) + nombre.
// El color de acento sale de la variable CSS --acento (ver src/index.css).

export function LogoMark({ size = 34, onDark = true }) {
  const main = onDark ? '#FFFFFF' : 'var(--azul)'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M10 56 L32 9 L54 56" fill="none" stroke={main} strokeWidth="7" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M17 41 Q32 26 47 41" fill="none" stroke="var(--acento)" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Logo({ size = 34, onDark = true, sub }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }} aria-label="AbogaMéxico">
      <LogoMark size={size} onDark={onDark} />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
        <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: size * 0.56, letterSpacing: '-.02em', color: onDark ? '#fff' : 'var(--azul)' }}>
          Aboga<span style={{ color: 'var(--acento)' }}>México</span>
        </span>
        {sub && <span style={{ fontSize: Math.max(9, size * 0.28), color: onDark ? 'var(--celeste)' : '#4A5A75', letterSpacing: '.08em', marginTop: 3 }}>{sub}</span>}
      </span>
    </span>
  )
}
