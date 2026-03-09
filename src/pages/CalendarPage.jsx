import { useState } from 'react'
import { useGlowCard } from '../components/ui/GlowCard'
import { Icon } from '../constants/icons'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { MONTHS, WEEKDAYS_SHORT, CATEGORIES } from '../constants'
import { dateKey, todayKey, capitalize, formatDate } from '../utils/date'
import s from './CalendarPage.module.css'

export function CalendarPage({ tasks, toggleTask, deleteTask, addTask, addNotif }) {
  const now = new Date()
  const [y, setY] = useState(now.getFullYear())
  const [m, setM] = useState(now.getMonth())
  const [selDay, setSelDay] = useState(now.getDate())
  const [addModal, setAddModal] = useState(false)

  const fd  = new Date(y, m, 1).getDay()
  const dim = new Date(y, m + 1, 0).getDate()

  const prev = () => { if (m === 0) { setM(11); setY(v => v - 1) } else setM(v => v - 1); setSelDay(null) }
  const next = () => { if (m === 11) { setM(0); setY(v => v + 1) } else setM(v => v + 1); setSelDay(null) }

  const cells = []
  for (let i = 0; i < fd; i++) cells.push(null)
  for (let d = 1; d <= dim; d++) cells.push(d)

  const selKey   = selDay ? dateKey(y, m, selDay) : null
  const selTasks = selKey ? tasks.filter(t => t.date === selKey) : []

  const tasksByDay = {}
  tasks.forEach(t => { if (!tasksByDay[t.date]) tasksByDay[t.date] = []; tasksByDay[t.date].push(t) })

  const today   = todayKey()
  const dayName = selDay ? capitalize(formatDate(y, m, selDay, { weekday: 'long' })) : ''

  return (
    <div className={s.layout}>
      {/* Grid */}
      <Card>
        <div className={s.nav}>
          <button className={s.navBtn} onClick={prev}><Icon.ChevLeft width={14} height={14} /></button>
          <span className={s.navTitle}>{MONTHS[m]} {y}</span>
          <button className={s.navBtn} onClick={next}><Icon.ChevRight width={14} height={14} /></button>
        </div>

        <div className={s.grid}>
          {WEEKDAYS_SHORT.map(d => <div key={d} className={s.dayLabel}>{d}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div key={i} className={s.empty} />
            const k    = dateKey(y, m, d)
            const dayT = tasksByDay[k] || []
            const isToday = k === today
            const isSel   = d === selDay
            return (
              <div
                key={i}
                className={[s.day, 'glow-card', isToday ? s.today : '', isSel ? s.selected : '', dayT.length ? s.hasTask : ''].join(' ')}
                onClick={() => setSelDay(d === selDay ? null : d)}
                title={dayT.length ? `${dayT.length} tarefa${dayT.length > 1 ? 's' : ''}` : ''}
              >
                {d}
                {dayT.length > 0 && (
                  <div className={s.dots}>
                    {dayT.slice(0, 3).map((t, ti) => (
                      <div key={ti} className={[s.dot, t.done ? s.dotDone : ''].join(' ')} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className={s.legend}>
          <div className={s.legendItem}><div className={s.legendDot} style={{ background: 'var(--accent)', opacity: 0.6 }} />Tarefas</div>
          <div className={s.legendItem}><div className={s.legendDot} style={{ background: 'var(--green)' }} />Concluídas</div>
        </div>
      </Card>

      {/* Day panel */}
      <Card>
        {selDay ? (
          <>
            <div className={s.panelHead}>
              <div>
                <div className={s.panelTitle}>{selDay} de {MONTHS[m]}</div>
                <div className={s.panelSub}>{dayName}</div>
              </div>
              {selTasks.length > 0 && (
                <span className={s.panelBadge}>{selTasks.filter(t => t.done).length}/{selTasks.length}</span>
              )}
            </div>

            {selTasks.length === 0 ? (
              <div className={s.dayEmpty}>
                <Icon.Inbox width={22} height={22} style={{ color: 'var(--text-3)' }} />
                <p>Nenhuma tarefa neste dia</p>
              </div>
            ) : (
              <div className={s.dayTasks}>
                {selTasks.map(t => (
                  <div key={t.id} className={[s.dayTask, 'glow-card', t.done ? s.dayDone : ''].join(' ')} onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--mx',e.clientX-r.left+'px');e.currentTarget.style.setProperty('--my',e.clientY-r.top+'px')}} onClick={() => toggleTask(t.id)}>
                    <div className={[s.check, t.done ? s.checked : ''].join(' ')}>
                      {t.done && <Icon.Check width={9} height={9} />}
                    </div>
                    <div className={s.dayTaskInfo}>
                      <div className={s.dayTaskName}>{t.name}</div>
                      <div className={s.dayTaskMeta}>{t.time} · <span className={[s.tag, s[CATEGORIES[t.cat]?.cls]].join(' ')}>{CATEGORIES[t.cat]?.label}</span></div>
                    </div>
                    <button className={s.delBtn} onClick={e => { e.stopPropagation(); deleteTask(t.id) }}>
                      <Icon.Trash width={11} height={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button className={s.addDay} onClick={() => setAddModal(true)}>
              <Icon.Plus width={13} height={13} />
              Adicionar neste dia
            </button>
          </>
        ) : (
          <div className={s.noSel}>
            <Icon.Calendar width={28} height={28} style={{ color: 'var(--text-3)', marginBottom: 10 }} />
            <p className={s.noSelTitle}>Selecione um dia</p>
            <p className={s.noSelSub}>Clique em qualquer data para ver as tarefas</p>
          </div>
        )}
      </Card>

      {/* Lazy import avoids circular — just inline a small modal here */}
      {addModal && selKey && (
        <QuickAddModal
          date={selKey}
          onClose={() => setAddModal(false)}
          onSave={task => {
            addTask(task)
            addNotif({ type: 'achievement', title: 'Tarefa criada!', message: `"${task.name}" adicionada` })
            setAddModal(false)
          }}
        />
      )}
    </div>
  )
}

// Inline quick-add (avoids extra import cycle)
function QuickAddModal({ date, onClose, onSave }) {
  const [name, setName] = useState('')
  const [cat,  setCat]  = useState('activity')
  const [time, setTime] = useState('')
  const save = () => {
    if (!name.trim()) return
    onSave({ id: Math.random().toString(36).slice(2), name: name.trim(), cat, time: time || '—', date, done: false })
  }
  return (
    <div className={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={s.qModal}>
        <div className={s.qHead}>
          <span>Nova tarefa — {date}</span>
          <button onClick={onClose}><Icon.X width={15} height={15} /></button>
        </div>
        <div className={s.qBody}>
          <input className={s.qInput} placeholder="Nome da tarefa" value={name} autoFocus
            onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()} />
          <div className={s.qRow}>
            <select className={s.qSel} value={cat} onChange={e => setCat(e.target.value)}>
              <option value="activity">Hábito</option>
              <option value="study">Estudo</option>
              <option value="leisure">Lazer</option>
            </select>
            <input className={s.qInput} type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>
          <div className={s.qFoot}>
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            <Button size="sm" onClick={save} disabled={!name.trim()}>Criar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
