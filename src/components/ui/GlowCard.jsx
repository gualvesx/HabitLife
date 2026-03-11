/**
 * GlowCard — wraps any content with a radial purple glow that follows the cursor.
 * Usage: <GlowCard className={s.myCard}>content</GlowCard>
 * Or attach the hook manually: const { ref, handleMove } = useGlowCard()
 */
export function useGlowCard() {
  const handleMove = e => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return { handleMove }
}

export function GlowCard({ children, className = '', style, onClick, as: Tag = 'div' }) {
  const { handleMove } = useGlowCard()
  return (
    <Tag
      className={`glow-card ${className}`}
      style={style}
      onMouseMove={handleMove}
      onClick={onClick}
    >
      {children}
    </Tag>
  )
}
