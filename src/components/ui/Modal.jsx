import { useEffect } from 'react'
import { Icon } from '../../constants/icons'
import s from './Modal.module.css'

export function Modal({ open, onClose, title, children, maxWidth = 480 }) {
  useEffect(() => {
    if (!open) return
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.modal} style={{ maxWidth }}>
        <div className={s.header}>
          <span className={s.title}>{title}</span>
          <button className={s.close} onClick={onClose}>
            <Icon.X width={16} height={16} />
          </button>
        </div>
        <div className={s.body}>{children}</div>
      </div>
    </div>
  )
}
