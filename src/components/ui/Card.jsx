import s from './Card.module.css'

export function Card({ children, className = '', hover = false, glow = true, style, ...rest }) {
  const handleMove = glow ? e => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  } : undefined

  return (
    <div
      className={[s.card, hover ? s.hover : '', glow ? 'glow-card' : '', className].filter(Boolean).join(' ')}
      style={style}
      onMouseMove={handleMove}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, badge, action, children }) {
  return (
    <div className={s.header}>
      <div className={s.headerLeft}>
        <span className={s.title}>{title}</span>
        {badge && <span className={s.badge}>{badge}</span>}
      </div>
      {action && <div>{action}</div>}
      {children}
    </div>
  )
}
