import { forwardRef } from 'react'
import { Icon } from '../../constants/icons'
import { relativeTime } from '../../utils/date'
import { NOTIF_TYPES } from '../../constants'
import s from './NotifPanel.module.css'

const NOTIF_ICONS = {
  achievement: <Icon.Trophy width={15} height={15} style={{ color: '#fff' }} />,
  alarm:       <Icon.Bell   width={15} height={15} style={{ color: '#fff' }} />,
  reminder:    <Icon.Clock  width={15} height={15} style={{ color: '#fff' }} />,
  system:      <Icon.Zap    width={15} height={15} style={{ color: '#fff' }} />,
}

export const NotifPanel = forwardRef(function NotifPanel({ notifs, onClose }, ref) {
  const { notifs: list, markRead, markAllRead, remove, clear, unread } = notifs

  return (
    <div className={s.panel} ref={ref}>
      <div className={s.header}>
        <div className={s.headerLeft}>
          <Icon.Bell width={14} height={14} style={{ color: 'var(--accent)' }} />
          <span className={s.title}>Notificações</span>
          {unread > 0 && <span className={s.count}>{unread} nova{unread > 1 ? 's' : ''}</span>}
        </div>
        <div className={s.actions}>
          {list.length > 0 && <>
            <button className={s.act} title="Marcar todas lidas" onClick={markAllRead}>
              <Icon.Check width={12} height={12} />
            </button>
            <button className={[s.act, s.danger].join(' ')} title="Limpar tudo" onClick={clear}>
              <Icon.Trash width={12} height={12} />
            </button>
          </>}
          <button className={s.act} onClick={onClose}>
            <Icon.X width={12} height={12} />
          </button>
        </div>
      </div>

      <div className={s.list}>
        {list.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}><Icon.BellOff width={20} height={20} /></div>
            <p>Sem notificações</p>
            <span>Tudo limpo por aqui</span>
          </div>
        ) : list.map((n, i) => (
          <div
            key={n.id}
            className={[s.item, n.read ? '' : s.unread].join(' ')}
            style={{ animationDelay: `${i * 30}ms` }}
            onClick={() => markRead(n.id)}
          >
            {!n.read && <div className={s.dot} />}
            <div
              className={s.typeIcon}
              style={{ background: NOTIF_TYPES[n.type]?.gradient }}
            >
              {NOTIF_ICONS[n.type]}
            </div>
            <div className={s.body}>
              <div className={s.nTitle}>{n.title}</div>
              <div className={s.nMsg}>{n.message}</div>
              <div className={s.nTime}>{relativeTime(n.ts)}</div>
            </div>
            <button
              className={s.del}
              onClick={e => { e.stopPropagation(); remove(n.id) }}
            >
              <Icon.X width={10} height={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
})
