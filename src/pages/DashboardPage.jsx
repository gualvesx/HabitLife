import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { CATEGORIES, WEEKDAYS_SHORT } from '../constants'
import { todayKey, dateKey } from '../utils/date'
import {
  getLevelFromXP, getXPData, addCoins, addFreezes, updateBestStreak,
  getBadges, ALL_BADGES, checkAndAwardBadges, getFocusLog, requestNotifPermission
} from '../hooks/useTasks'
import s from './DashboardPage.module.css'

function StatCard({ icon, iconBg, iconColor, value, label, trend, trendUp, sub }) {
  const handleMove = e => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <div className={s.statCard} onMouseMove={handleMove}>
      <div className={s.statIco} style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <div className={s.statVal}>{value}</div>
      <div className={s.statLbl}>{label}</div>
      {trend && <div className={[s.statTrend, trendUp ? s.up : s.muted].join(' ')}>{trend}</div>}
      {sub && <div className={s.statSub}>{sub}</div>}
    </div>
  )
}

function XPBar({ xp }) {
  const { level, progress, needed } = getLevelFromXP(xp)
  const pct = needed > 0 ? Math.min(100, Math.round(progress / needed * 100)) : 100
  return (
    <div className={s.xpBar}>
      <div className={s.xpTop}>
        <div className={s.xpLevelBadge}>
          <span className={s.xpLevelIcon}>⚡</span>
          <span className={s.xpLevel}>Nível {level}</span>
        </div>
        <span className={s.xpVal}>{xp} XP total</span>
      </div>
      <div className={s.xpTrack}>
        <div className={s.xpFill} style={{ width: `${pct}%` }}>
          <div className={s.xpShimmer} />
        </div>
      </div>
      <div className={s.xpBot}>
        <span>{progress} / {needed} XP</span>
        <span className={s.xpNext}>→ Nível {level + 1}</span>
      </div>
    </div>
  )
}

function QuantityProgress({ task, onUpdate }) {
  if (!task.goalValue || task.goalValue === 0) return null
  const cur = task.currentValue || 0
  const pct = Math.min(100, Math.round(cur / task.goalValue * 100))
  const step = task.goalStep || 1
  const unit = task.goalUnit || ''

  return (
    <div className={s.qWrap} onClick={e => e.stopPropagation()}>
      <div className={s.qTop}>
        <div className={s.qTrack}>
          <div className={s.qFill} style={{ width: `${pct}%` }} />
        </div>
        <span className={s.qPct}>{pct}%</span>
      </div>
      <div className={s.qBottom}>
        <span className={s.qLabel}>{cur}{unit ? ` ${unit}` : ''} / {task.goalValue}{unit ? ` ${unit}` : ''}</span>
        {!task.done && (
          <div className={s.qBtns}>
            {step > 1 && (
              <button className={s.qBtn} onClick={() => onUpdate(task.id, Math.max(0, cur - step))}>
                −{step}
              </button>
            )}
            <button className={[s.qBtn, s.qBtnPrimary].join(' ')}
              onClick={() => onUpdate(task.id, Math.min(cur + step, task.goalValue))}>
              +{step}{unit ? unit : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Badges popup ───────────────────────────────────────────────────────────
function BadgeToast({ badges, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])
  if (!badges || badges.length === 0) return null
  return (
    <div className={s.badgeToast}>
      {badges.map(b => (
        <div key={b.id} className={s.badgeToastItem}>
          <span className={s.badgeToastIcon}>🏆</span>
          <div>
            <div className={s.badgeToastTitle}>Conquista desbloqueada!</div>
            <div className={s.badgeToastName}>{b.label}</div>
            <div className={s.badgeToastDesc}>{b.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Shop modal ────────────────────────────────────────────────────────────
const SHOP_ITEMS = [
  { id: 'freeze',  label: '❄️ Congelar Streak',   desc: 'Proteja seu streak por 1 dia',    cost: 3,  type: 'freeze' },
  { id: 'freeze5', label: '❄️×5 Pacote de Gelos',  desc: 'Proteja seu streak por 5 dias',   cost: 12, type: 'freeze5' },
  { id: 'xp2x',   label: '⚡ XP Duplo (1h)',       desc: 'Dobra XP por 1 hora',             cost: 8,  type: 'xp2x' },
  { id: 'hint',   label: '💡 Dica de Método',      desc: 'Receba uma dica de estudo',        cost: 1,  type: 'hint' },
]

function ShopModal({ coins, onBuy, onClose }) {
  return (
    <div className={s.shopOverlay} onClick={onClose}>
      <div className={s.shopModal} onClick={e => e.stopPropagation()}>
        <div className={s.shopHeader}>
          <div className={s.shopTitle}>🏪 Loja de Evolução</div>
          <div className={s.shopCoins}>🪙 {coins} moedas</div>
          <button className={s.shopClose} onClick={onClose}>✕</button>
        </div>
        <div className={s.shopGrid}>
          {SHOP_ITEMS.map(item => (
            <div key={item.id} className={[s.shopItem, coins < item.cost ? s.shopItemDisabled : ''].join(' ')}>
              <div className={s.shopItemIcon}>{item.label.split(' ')[0]}</div>
              <div className={s.shopItemInfo}>
                <div className={s.shopItemName}>{item.label}</div>
                <div className={s.shopItemDesc}>{item.desc}</div>
              </div>
              <button className={s.shopBuyBtn}
                disabled={coins < item.cost}
                onClick={() => onBuy(item)}>
                🪙 {item.cost}
              </button>
            </div>
          ))}
        </div>
        <p className={s.shopNote}>💡 Ganhe moedas completando tarefas (+1 normal, +2 com meta)</p>
      </div>
    </div>
  )
}

const PRIORITY_COLORS = { 1: 'var(--red)', 2: 'var(--yellow)', 3: 'var(--green)' }

export function DashboardPage({ tasks, toggleTask, openModal, onStartFocus, updateTaskValue }) {
  const now        = new Date()
  const TODAY      = todayKey()
  const todayTasks = tasks.filter(t => t.date === TODAY)
  const done       = todayTasks.filter(t => t.done).length
  const pct        = todayTasks.length ? Math.round(done / todayTasks.length * 100) : 0
  const circ       = 2 * Math.PI * 44

  // Streak
  let streak = 0
  const chk = new Date()
  for (let i = 0; i < 365; i++) {
    const k  = dateKey(chk.getFullYear(), chk.getMonth(), chk.getDate())
    const dt = tasks.filter(t => t.date === k)
    if (dt.length && dt.every(t => t.done)) { streak++; chk.setDate(chk.getDate() - 1) }
    else if (i === 0) chk.setDate(chk.getDate() - 1)
    else break
  }

  const [xpData,    setXpData]    = useState(getXPData)
  const [shopOpen,  setShopOpen]  = useState(false)
  const [newBadges, setNewBadges] = useState([])
  const [notifPerm, setNotifPerm] = useState(Notification?.permission || 'default')

  // Badge checking
  const checkBadges = useCallback(() => {
    const focusLog = getFocusLog()
    const todayFocusMins = focusLog
      .filter(e => e.date === new Date().toISOString().slice(0,10))
      .reduce((a,e) => a + e.duration/60, 0)
    const { level } = getLevelFromXP(xpData.xp)
    const totalDone = tasks.filter(t => t.done).length
    const quantDone = tasks.filter(t => t.done && t.goalValue > 0).length
    const uniqueMethods = [...new Set(tasks.filter(t=>t.studyMethod).map(t=>t.studyMethod))].length
    // earlyTasks: tasks done before 8am (we can't know exact time without timestamps, use time field)
    const earlyTasks = tasks.filter(t => t.done && t.time && t.time !== '—' && parseInt(t.time.split(':')[0]) < 8).length
    // perfectDays: count days where all tasks done
    let perfectDays = 0
    for (let i = 0; i < 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const k = dateKey(d.getFullYear(), d.getMonth(), d.getDate())
      const dt = tasks.filter(t => t.date === k)
      if (dt.length > 0 && dt.every(t => t.done)) perfectDays++
    }
    const maxDayDone = Math.max(0, ...Object.entries(
      tasks.filter(t=>t.done).reduce((a,t) => { a[t.date]=(a[t.date]||0)+1; return a }, {})
    ).map(([,v])=>v))
    const awarded = checkAndAwardBadges({ totalDone, streak, level, todayFocusMins, earlyTasks, uniqueMethods, perfectDays, quantDone, maxDayDone })
    if (awarded.length > 0) setNewBadges(awarded)
  }, [tasks, streak, xpData.xp])

  useEffect(() => {
    updateBestStreak(streak)
    setXpData(getXPData())
    checkBadges()
  }, [streak, checkBadges])

  const handleBuy = (item) => {
    const cur = getXPData()
    if (cur.coins < item.cost) return
    addCoins(-item.cost)
    if (item.type === 'freeze')  addFreezes(1)
    if (item.type === 'freeze5') addFreezes(5)
    setXpData(getXPData())
    setShopOpen(false)
  }

  const handleRequestNotif = async () => {
    const p = await requestNotifPermission()
    setNotifPerm(p)
  }

  // Week bars
  const weekBars = WEEKDAYS_SHORT.map((d, i) => {
    const diff = i - now.getDay()
    const dt   = new Date(now); dt.setDate(now.getDate() + diff)
    const k    = dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate())
    const dayT = tasks.filter(t => t.date === k)
    const dayD = dayT.filter(t => t.done).length
    return { d, isToday: i === now.getDay(), pct: dayT.length ? Math.round(dayD / dayT.length * 100) : 0, has: dayT.length > 0 }
  })

  const sortedToday = [...todayTasks].sort((a, b) => (a.priority || 2) - (b.priority || 2))
  const earnedBadges = getBadges()
  const { level } = getLevelFromXP(xpData.xp)

  return (
    <div className={s.page}>
      {/* Badge toast */}
      {newBadges.length > 0 && <BadgeToast badges={newBadges} onDismiss={() => setNewBadges([])} />}
      {shopOpen && <ShopModal coins={xpData.coins} onBuy={handleBuy} onClose={() => setShopOpen(false)} />}

      {/* Notification permission prompt */}
      {notifPerm === 'default' && (
        <div className={s.notifBanner}>
          <span>🔔 Ative notificações para receber lembretes das suas tarefas</span>
          <button onClick={handleRequestNotif}>Ativar</button>
          <button className={s.notifDismiss} onClick={() => setNotifPerm('dismissed')}>✕</button>
        </div>
      )}

      {/* Stat Cards */}
      <div className={s.stats}>
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
          iconBg="var(--orange-soft)" iconColor="var(--orange)"
          value={`${streak}`} label="Streak atual"
          trend={streak > 0 ? `Recorde: ${xpData.bestStreak}d` : 'Comece hoje!'} trendUp={streak > 0}
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
          iconBg="var(--green-soft)" iconColor="var(--green)"
          value={`${done}/${todayTasks.length}`} label="Concluídas hoje"
          trend={`${pct}% do dia`} trendUp={pct > 50}
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
          iconBg="var(--yellow-soft)" iconColor="var(--yellow)"
          value={`Nv. ${level}`} label="Nível de evolução"
          trend={`${xpData.xp} XP total`} trendUp
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
          iconBg="var(--blue-soft)" iconColor="var(--blue)"
          value={`${xpData.coins}🪙`} label="Moedas"
          trend="Abrir loja" trendUp={xpData.coins > 0}
          sub={<button className={s.shopTrigger} onClick={() => setShopOpen(true)}>🏪 Loja</button>}
        />
      </div>

      <XPBar xp={xpData.xp} />

      <div className={s.grid}>
        {/* Today's tasks */}
        <Card>
          <CardHeader title="Tarefas de hoje" badge={`${pct}%`} action={
            <Button size="sm" variant="ghost"
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
              onClick={openModal}>Adicionar</Button>
          }/>
          {todayTasks.length === 0 ? (
            <div className={s.empty}>
              <div className={s.emptyIco}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <p>Nenhuma tarefa para hoje</p>
              <Button size="sm" onClick={openModal}
                icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>}
              >Adicionar tarefa</Button>
            </div>
          ) : (
            <div className={s.taskList}>
              {sortedToday.map(t => {
                const handleMove = e => {
                  const r = e.currentTarget.getBoundingClientRect()
                  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
                  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
                }
                return (
                  <div key={t.id} className={[s.taskRow, 'glow-card', t.done ? s.done : ''].join(' ')}
                    onMouseMove={handleMove} onClick={() => toggleTask(t.id)}>
                    <div className={s.priorityDot} style={{ background: PRIORITY_COLORS[t.priority || 2] }} />
                    <div className={[s.check, t.done ? s.checked : ''].join(' ')}>
                      {t.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <div className={s.taskInfo}>
                      <div className={s.taskNameRow}>
                        <span className={s.taskName}>{t.name}</span>
                        {t.project && <span className={s.taskProject}>{t.project}</span>}
                        {t.tags?.length > 0 && t.tags.slice(0,2).map(tag => (
                          <span key={tag} className={s.taskTag}>#{tag}</span>
                        ))}
                      </div>
                      {t.studyMethod && <span className={s.taskMethod}>📚 {t.studyMethod}</span>}
                      {t.goalValue > 0 && updateTaskValue && (
                        <QuantityProgress task={t} onUpdate={updateTaskValue} />
                      )}
                    </div>
                    <div className={s.taskMeta}>
                      {t.frequencyType && t.frequencyType !== 'none' && <span className={s.badge}>🔁</span>}
                      {t.alert && t.alert !== 'none' && <span className={s.badge}>{t.alert === 'alarm' ? '⏰' : '🔔'}</span>}
                      <span className={[s.tag, s[CATEGORIES[t.cat]?.cls || 'cat-study']].join(' ')}>
                        {CATEGORIES[t.cat]?.label || t.cat}
                      </span>
                      {onStartFocus && !t.done && (
                        <button className={s.focusBtn} title="Iniciar foco"
                          onClick={e => { e.stopPropagation(); onStartFocus(t) }}>
                          ▶
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <div className={s.right}>
          {/* Streak + freeze */}
          <Card>
            <CardHeader title="Sequência" />
            <div className={s.streakBadge}>
              <div className={s.streakIco}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div>
                <div className={s.streakVal}>{streak} dia{streak !== 1 ? 's' : ''}</div>
                <div className={s.streakSub}>Recorde: {xpData.bestStreak} dias 🏆</div>
              </div>
              <button className={[s.freezeBtn, xpData.freezes < 1 ? s.freezeDisabled : ''].join(' ')}
                onClick={() => {
                  if (xpData.freezes < 1) return
                  addFreezes(-1); setXpData(getXPData())
                  alert('❄️ Streak congelado! Você usou 1 congelamento.')
                }}
                title={xpData.freezes < 1 ? `Sem congelamentos (compre na loja 🏪)` : `${xpData.freezes} congelamentos disponíveis`}>
                ❄️ {xpData.freezes > 0 ? `×${xpData.freezes}` : ''}
              </button>
            </div>
            <div className={s.weekLabel}>Esta semana</div>
            <div className={s.weekBars}>
              {weekBars.map((b, i) => (
                <div key={i} className={s.barCol}>
                  <div className={[s.bar, b.isToday ? s.barToday : b.has ? s.barHas : ''].join(' ')}
                    style={{ height: `${Math.max(b.pct, 4)}%` }} />
                  <div className={[s.barDay, b.isToday ? s.barDayToday : ''].join(' ')}>{b.d}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Progress ring */}
          <Card style={{ textAlign: 'center' }}>
            <CardHeader title="Progresso" />
            <div className={s.ringWrap}>
              <svg width={108} height={108} viewBox="0 0 108 108">
                <defs>
                  <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#6d28d9" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <circle cx="54" cy="54" r="44" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
                <circle cx="54" cy="54" r="44" fill="none" stroke="url(#rg)" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - pct / 100)}
                  transform="rotate(-90 54 54)"
                  style={{ transition: 'stroke-dashoffset 0.9s var(--ease-out)' }}
                />
              </svg>
              <div className={s.ringLabel}>
                <div className={s.ringPct}>{pct}%</div>
                <div className={s.ringDay}>hoje</div>
              </div>
            </div>
            <p className={s.ringDesc}>{done} de {todayTasks.length} tarefas</p>
          </Card>

          {/* Badges / Conquistas */}
          <Card>
            <CardHeader title="🏆 Conquistas" badge={`${earnedBadges.length}/${ALL_BADGES.length}`} />
            <div className={s.badgeGrid}>
              {ALL_BADGES.map(b => {
                const earned = earnedBadges.includes(b.id)
                return (
                  <div key={b.id} className={[s.badgeItem, earned ? s.badgeEarned : ''].join(' ')} title={b.desc}>
                    <span className={s.badgeEmoji}>{b.label.split(' ')[0]}</span>
                    <span className={s.badgeName}>{b.label.split(' ').slice(1).join(' ')}</span>
                    {earned && <div className={s.badgeCheck}>✓</div>}
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
