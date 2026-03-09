import { useState, useRef } from 'react'
import { useGlowCard } from '../components/ui/GlowCard'
import { Icon }  from '../constants/icons'
import { Button } from '../components/ui/Button'
import { CATEGORIES } from '../constants'
import { WEEKDAYS_SHORT, MONTHS } from '../constants'
import s from './TasksPage.module.css'

// ── Horizontal date strip (14 days: 7 past + today + 6 future) ──────────────
function DateStrip({ tasks, selectedDate, onSelect }) {
  const today = new Date()
  const days = []
  for (let i = -7; i <= 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }

  const stripRef = useRef(null)
  // Scroll to today on first render
  const didScroll = useRef(false)
  const todayRef = useRef(null)
  const setTodayRef = el => {
    todayRef.current = el
    if (el && !didScroll.current) {
      didScroll.current = true
      setTimeout(() => el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }), 80)
    }
  }

  return (
    <div className={s.stripWrap}>
      <div className={s.strip} ref={stripRef}>
        {days.map((d, i) => {
          const key  = d.toISOString().slice(0, 10)
          const isToday = key === today.toISOString().slice(0, 10)
          const isSel   = key === selectedDate
          const dayTasks = tasks.filter(t => t.date === key)
          const done     = dayTasks.filter(t => t.done).length
          const total    = dayTasks.length

          return (
            <button
              key={key}
              ref={isToday ? setTodayRef : null}
              className={[s.dayCell, isSel ? s.dayCellSel : '', isToday ? s.dayCellToday : ''].join(' ')}
              onClick={() => onSelect(key)}
            >
              <span className={s.dayName}>{WEEKDAYS_SHORT[d.getDay()]}</span>
              <span className={s.dayNum}>{d.getDate()}</span>
              {total > 0 && (
                <div className={s.dayDots}>
                  {Array.from({length: Math.min(total, 3)}, (_, j) => (
                    <span key={j} className={[s.dayDot, j < done ? s.dayDotDone : ''].join(' ')} />
                  ))}
                  {total > 3 && <span className={s.dayMore}>+{total-3}</span>}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const PRIORITY_COLORS = { 1: 'var(--red)', 2: 'var(--yellow)', 3: 'var(--green)' }
const PRIORITY_LABELS = { 1: 'Alta', 2: 'Média', 3: 'Baixa' }

function SubtaskList({ task, onUpdateSubtasks }) {
  if (!task.subtasks || task.subtasks.length === 0) return null
  const toggle = sub => {
    const updated = task.subtasks.map(s => s.id === sub.id ? { ...s, done: !s.done } : s)
    onUpdateSubtasks(task.id, updated)
  }
  return (
    <div className={s.subtasks} onClick={e => e.stopPropagation()}>
      {task.subtasks.map(sub => (
        <div key={sub.id} className={[s.sub, sub.done ? s.subDone : ''].join(' ')} onClick={() => toggle(sub)}>
          <div className={[s.subCheck, sub.done ? s.subChecked : ''].join(' ')}>
            {sub.done && <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <span>{sub.text}</span>
        </div>
      ))}
    </div>
  )
}

function TaskRow({ t, toggleTask, deleteTask, onStartFocus, updateTaskValue, updateSubtasks }) {
  const { handleMove } = useGlowCard()
  const [expanded, setExpanded] = useState(false)

  const hasDetails = (t.subtasks && t.subtasks.length > 0) || t.desc || (t.goalValue > 0)

  return (
    <div className={[s.row, 'glow-card', t.done ? s.done : ''].join(' ')} onMouseMove={handleMove}>
      {/* Priority indicator */}
      <div className={s.priorityBar} style={{ background: PRIORITY_COLORS[t.priority || 2] }} title={`Prioridade ${PRIORITY_LABELS[t.priority || 2]}`} />

      {/* Checkbox */}
      <div className={[s.check, t.done ? s.checked : ''].join(' ')} onClick={() => toggleTask(t.id)}>
        {t.done && <Icon.Check width={10} height={10} />}
      </div>

      {/* Content */}
      <div className={s.content} onClick={() => toggleTask(t.id)}>
        <div className={s.nameRow}>
          <span className={s.name}>{t.name}</span>
          {t.project && <span className={s.projectTag}>{t.project}</span>}
        </div>

        <div className={s.metaRow}>
          <span className={s.metaDate}>{t.date}{t.time && t.time !== '—' ? ` · ${t.time}` : ''}</span>
          {t.studyMethod && <span className={s.methodBadge}><svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'><path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z'/><path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'/></svg> {t.studyMethod}</span>}
          {t.frequencyType && t.frequencyType !== 'none' && <span className={s.badge} title='Recorrente'><svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'><polyline points='23 4 23 10 17 10'/><polyline points='1 20 1 14 7 14'/><path d='M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15'/></svg></span>}
          {t.alert && t.alert !== 'none' && <span className={s.badge}><svg width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round'><path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/></svg></span>}
          {t.reminders && t.reminders.length > 1 && <span className={s.badge}>{t.reminders.length}×</span>}
        </div>

        {/* Quantitative progress */}
        {t.goalValue > 0 && (
          <div className={s.qProgress} onClick={e => e.stopPropagation()}>
            <div className={s.qTrack}>
              <div className={s.qFill} style={{ width: `${Math.min(100, Math.round((t.currentValue||0)/t.goalValue*100))}%` }} />
            </div>
            <span className={s.qLabel}>{t.currentValue||0}/{t.goalValue}</span>
            {!t.done && updateTaskValue && (
              <button className={s.qBtn} onClick={() => updateTaskValue(t.id, (t.currentValue||0)+1)}>+1</button>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className={s.actions}>
        <span className={[s.tag, s[CATEGORIES[t.cat]?.cls || 'cat-study']].join(' ')}>
          {CATEGORIES[t.cat]?.label || t.cat}
        </span>
        {onStartFocus && !t.done && (
          <button className={s.focusBtn} title="Iniciar foco" onClick={e => { e.stopPropagation(); onStartFocus(t) }}><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
        )}
        {hasDetails && (
          <button className={s.expandBtn} onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}>
            {expanded ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg> : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>}
          </button>
        )}
        <button className={s.del} onClick={e => { e.stopPropagation(); deleteTask(t.id) }}>
          <Icon.Trash width={13} height={13} />
        </button>
      </div>

      {/* Expanded: subtasks + description */}
      {expanded && (
        <div className={s.details}>
          {t.desc && <div className={s.descText}>{t.desc}</div>}
          <SubtaskList task={t} onUpdateSubtasks={updateSubtasks} />
        </div>
      )}
    </div>
  )
}

const FILTER_OPTS = [
  { id: 'all',      label: 'Todas'    },
  { id: 'today',    label: 'Hoje'     },
  { id: 'pending',  label: 'Pendentes'},
  { id: 'done',     label: 'Concluídas'},
  { id: 'high',     label: '🔴 Alta'  },
]

const PROJECT_COLORS = ['#6d28d9','#0284c7','#059669','#d97706','#dc2626','#7c3aed']

export function TasksPage({ tasks, toggleTask, deleteTask, openModal, onStartFocus, updateTaskValue, updateSubtasks }) {
  const todayStr = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [filter,  setFilter]  = useState('all')
  const [project, setProject] = useState('')
  const [search,  setSearch]  = useState('')

  const today = todayStr

  const projects = [...new Set(tasks.map(t => t.project).filter(Boolean))]

  const filtered = tasks
    .filter(t => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
      if (project && t.project !== project) return false
      // Date strip filter — always filter by selected date unless a status filter is active
      if (filter === 'all') {
        // daily_until_done: show on every day from start date until completed
        if (t.frequencyType === 'daily_until_done') {
          if (t.date > selectedDate) return false  // not started yet
          if (t.done && t.date !== selectedDate) return false  // done, only show on its own date
          return true
        }
        // daily habits: show on every day
        if (t.frequencyType === 'daily' || t.isHabit) return true
        if (t.date !== selectedDate) return false
      }
      if (filter === 'today')   return t.date === today
      if (filter === 'pending') return !t.done
      if (filter === 'done')    return t.done
      if (filter === 'high')    return t.priority === 1
      return true
    })
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      if ((a.priority||2) !== (b.priority||2)) return (a.priority||2) - (b.priority||2)
      return a.date.localeCompare(b.date)
    })

  const selDateObj = new Date(selectedDate + 'T12:00:00')
  const selLabel = selectedDate === today ? 'Hoje' :
    selDateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className={s.wrap}>
      {/* ── Horizontal date strip ── */}
      <DateStrip tasks={tasks} selectedDate={selectedDate} onSelect={d => { setSelectedDate(d); setFilter('all') }} />

      {/* Date header */}
      <div className={s.dateHeader}>
        <span className={s.dateHeaderLabel}>{selLabel}</span>
        {selectedDate !== today && (
          <button className={s.backToday} onClick={() => { setSelectedDate(today); setFilter('all') }}>
            Ir para hoje
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={s.searchIcon}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className={s.search} placeholder="Buscar tarefa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button size="sm" icon={<Icon.Plus width={13} height={13} />} onClick={openModal}>Adicionar item</Button>
      </div>

      {/* Projects filter */}
      {projects.length > 0 && (
        <div className={s.projects}>
          <button className={[s.projBtn, !project ? s.projActive : ''].join(' ')} onClick={() => setProject('')}>
            Todos
          </button>
          {projects.map((p, i) => (
            <button key={p} className={[s.projBtn, project === p ? s.projActive : ''].join(' ')}
              style={project === p ? { borderColor: PROJECT_COLORS[i % PROJECT_COLORS.length], color: PROJECT_COLORS[i % PROJECT_COLORS.length], background: PROJECT_COLORS[i % PROJECT_COLORS.length] + '15' } : {}}
              onClick={() => setProject(project === p ? '' : p)}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Status filter */}
      <div className={s.filters}>
        {FILTER_OPTS.map(f => (
          <button key={f.id} className={[s.filterBtn, filter === f.id ? s.filterActive : ''].join(' ')}
            onClick={() => setFilter(f.id)}>{f.label}</button>
        ))}
        <span className={s.count}>{filtered.length} tarefa{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIco}><Icon.Inbox width={28} height={28} /></div>
          <p className={s.emptyTitle}>Nenhuma tarefa encontrada</p>
          <p className={s.emptyDesc}>
            {search ? 'Tente outro termo de busca' : 'Clique em "Adicionar item" para começar'}
          </p>
          {!search && <Button size="sm" onClick={openModal} icon={<Icon.Plus width={12} height={12} />}>Adicionar item</Button>}
        </div>
      ) : filtered.map(t => (
        <TaskRow key={t.id} t={t}
          toggleTask={toggleTask} deleteTask={deleteTask}
          onStartFocus={onStartFocus}
          updateTaskValue={updateTaskValue}
          updateSubtasks={updateSubtasks}
        />
      ))}
    </div>
  )
}
