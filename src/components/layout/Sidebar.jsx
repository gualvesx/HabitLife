import { useState } from 'react'
import { NAV_ITEMS } from '../../constants'
import s from './Sidebar.module.css'

function IconDashboard({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={[s.ico, active ? s.icoActive : ''].join(' ')}>
      <rect x="3" y="3" width="7" height="7" rx="1" className={s.icoRect1}/>
      <rect x="14" y="3" width="7" height="7" rx="1" className={s.icoRect2}/>
      <rect x="3" y="14" width="7" height="7" rx="1" className={s.icoRect3}/>
      <rect x="14" y="14" width="7" height="7" rx="1" className={s.icoRect4}/>
    </svg>
  )
}
function IconTasks({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={[s.ico, s.icoCheck, active ? s.icoActive : ''].join(' ')}>
      <polyline points="9 11 12 14 22 4" className={s.icoCheckmark}/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )
}
function IconCalendar({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={[s.ico, s.icoCalendar, active ? s.icoActive : ''].join(' ')}>
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6" className={s.icoPin}/>
      <line x1="8"  y1="2" x2="8"  y2="6" className={s.icoPin}/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
      <circle cx="8"  cy="15" r="0.8" fill="currentColor" className={s.icoDot1}/>
      <circle cx="12" cy="15" r="0.8" fill="currentColor" className={s.icoDot2}/>
      <circle cx="16" cy="15" r="0.8" fill="currentColor" className={s.icoDot3}/>
    </svg>
  )
}
function IconTimer({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={[s.ico, s.icoTimer, active ? s.icoActive : ''].join(' ')}>
      <circle cx="12" cy="13" r="8"/>
      <polyline points="12 9 12 13 15 15" className={s.icoHand}/>
      <line x1="12" y1="5" x2="12" y2="3"/>
      <line x1="5"  y1="3" x2="9"  y2="3" className={s.icoTopLine}/>
    </svg>
  )
}
function IconStats({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={[s.ico, s.icoStats, active ? s.icoActive : ''].join(' ')}>
      <line x1="18" y1="20" x2="18" y2="10" className={s.icoBar3}/>
      <line x1="12" y1="20" x2="12" y2="4"  className={s.icoBar2}/>
      <line x1="6"  y1="20" x2="6"  y2="14" className={s.icoBar1}/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  )
}
function IconSettings({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={[s.ico, s.icoCog, active ? s.icoActive : ''].join(' ')}>
      <circle cx="12" cy="12" r="3" className={s.icoCogCenter}/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" className={s.icoCogOuter}/>
    </svg>
  )
}

const NAV_ICON_MAP = {
  dashboard: IconDashboard,
  tasks:     IconTasks,
  calendar:  IconCalendar,
  timer:     IconTimer,
  stats:     IconStats,
  settings:  IconSettings,
}

export function Sidebar({ view, onNavigate, isOpen, collapsed, onToggleCollapse, onClose }) {
  const [hovered, setHovered] = useState(null)

  return (
    <nav className={[
      s.sidebar,
      isOpen     ? s.open      : '',
      collapsed  ? s.collapsed : '',
    ].join(' ')}>

      {/* Collapse toggle (desktop) */}
      <button className={s.collapseBtn} onClick={onToggleCollapse} title={collapsed ? 'Expandir menu' : 'Recolher menu'}>
        {collapsed ? (
          /* Expand icon — panel with arrow pointing right */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <polyline points="13 8 17 12 13 16"/>
          </svg>
        ) : (
          /* Collapse icon — panel with arrow pointing left */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <polyline points="17 8 13 12 17 16"/>
          </svg>
        )}
      </button>

      {!collapsed && <div className={s.label}>Navegação</div>}

      {NAV_ITEMS.map(({ id, label }) => {
        const NavIcon  = NAV_ICON_MAP[id]
        const isActive = view === id
        const isHov    = hovered === id
        return (
          <button
            key={id}
            className={[s.item, isActive ? s.active : '', isHov ? s.hovered : ''].join(' ')}
            onClick={() => onNavigate(id)}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            title={collapsed ? label : ''}
          >
            <span className={[s.icon, isActive ? s.iconActive : ''].join(' ')}>
              {NavIcon && <NavIcon active={isActive || isHov} />}
            </span>
            {!collapsed && <span className={s.itemLabel}>{label}</span>}
            {!collapsed && isActive && <span className={s.activeDot} />}
          </button>
        )
      })}

      {!collapsed && (
        <div className={s.footer}>
          <div className={s.status}>
            <div className={s.statusRow}><div className={s.dot} /><span>Sistema ativo</span></div>
            <p>Dados sincronizados</p>
          </div>
        </div>
      )}
    </nav>
  )
}
