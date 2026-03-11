import { useRef, useState, useEffect } from 'react'
import { Icon } from '../../constants/icons'
import { Button } from '../ui/Button'
import { NotifPanel } from './NotifPanel'
import { LogoIcon } from '../ui/LogoIcon'
import s from './Header.module.css'

export function Header({ dark, onToggleTheme, notifs, onAddTask, user, onLogout, onMenuToggle }) {
  const [panelOpen, setPanelOpen] = useState(false)
  const [ring, setRing]           = useState(false)
  const bellRef = useRef()
  const panRef  = useRef()
  const unread  = notifs.unread

  useEffect(() => {
    const h = e => {
      if (panelOpen && panRef.current && !panRef.current.contains(e.target)
        && bellRef.current && !bellRef.current.contains(e.target)) setPanelOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [panelOpen])

  const handleBell = () => { setRing(true); setTimeout(() => setRing(false), 660); setPanelOpen(v => !v) }

  return (
    <header className={s.header}>
      <div className={s.left}>
        <button className={s.menuBtn} onClick={onMenuToggle} aria-label="Menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className={s.logo}>
          <div className={s.logoIcon}>
            <LogoIcon size={28} />
            <div className={s.logoDot} />
          </div>
          <div>
            <div className={s.logoName}>HabitLife</div>
            <div className={s.logoSub}>Evolução</div>
          </div>
        </div>
      </div>

      <div className={s.right}>
        <div className={s.bellWrap} ref={bellRef}>
          <button className={[s.iconBtn, panelOpen ? s.active : ''].join(' ')} onClick={handleBell}>
            <Icon.Bell width={18} height={18} className={ring ? s.ring : ''} />
            {unread > 0 && <span className={s.badge}>{unread > 9 ? '9+' : unread}</span>}
          </button>
          {panelOpen && <NotifPanel ref={panRef} notifs={notifs} onClose={() => setPanelOpen(false)} />}
        </div>

        <button className={s.iconBtn} onClick={onToggleTheme} title="Alternar tema">
          {dark ? <Icon.Sun width={18} height={18} /> : <Icon.Moon width={18} height={18} />}
        </button>

        {user && (
          <div className={s.userWrap}>
            <button className={s.avatar} title={user.name}>{user.name.charAt(0).toUpperCase()}</button>
            <button className={[s.iconBtn, s.logoutBtn].join(' ')} onClick={onLogout} title="Sair">
              <Icon.LogOut width={17} height={17} />
            </button>
          </div>
        )}

        <Button icon={<Icon.Plus width={14} height={14} />} onClick={onAddTask} size="sm">
          <span className={s.newTaskLabel}>Adicionar item</span>
        </Button>
      </div>
    </header>
  )
}
