import { useState } from 'react'
import { useGlowCard } from '../components/ui/GlowCard'
import { Icon }  from '../constants/icons'
import { Button } from '../components/ui/Button'
import { CATEGORIES } from '../constants'
import s from './TasksPage.module.css'

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
          {t.studyMethod && <span className={s.methodBadge}>📚 {t.studyMethod}</span>}
          {t.frequencyType && t.frequencyType !== 'none' && <span className={s.badge}>🔁</span>}
          {t.alert && t.alert !== 'none' && <span className={s.badge}>{t.alert === 'alarm' ? '⏰' : '🔔'}</span>}
          {t.reminders && t.reminders.length > 1 && <span className={s.badge}>🔔×{t.reminders.length}</span>}
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
          <button className={s.focusBtn} title="Iniciar foco" onClick={e => { e.stopPropagation(); onStartFocus(t) }}>▶</button>
        )}
        {hasDetails && (
          <button className={s.expandBtn} onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}>
            {expanded ? '▲' : '▼'}
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
  const [filter,  setFilter]  = useState('all')
  const [project, setProject] = useState('')
  const [search,  setSearch]  = useState('')

  const today = new Date().toISOString().slice(0, 10)

  const projects = [...new Set(tasks.map(t => t.project).filter(Boolean))]

  const filtered = tasks
    .filter(t => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
      if (project && t.project !== project) return false
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

  return (
    <div className={s.wrap}>
      {/* Toolbar */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={s.searchIcon}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className={s.search} placeholder="Buscar tarefa..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button size="sm" icon={<Icon.Plus width={13} height={13} />} onClick={openModal}>Nova tarefa</Button>
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
            {search ? 'Tente outro termo de busca' : 'Clique em "Nova tarefa" para começar'}
          </p>
          {!search && <Button size="sm" onClick={openModal} icon={<Icon.Plus width={12} height={12} />}>Criar primeira tarefa</Button>}
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
