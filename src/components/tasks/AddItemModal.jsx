import { useState, useEffect } from 'react'
import { Modal }  from '../ui/Modal'
import { Input }  from '../ui/Input'
import { Button } from '../ui/Button'
import { Icon }   from '../../constants/icons'
import { todayKey } from '../../utils/date'
import s from './AddItemModal.module.css'

const CATS = [
  { id: 'study',    label: 'Estudo'   },
  { id: 'activity', label: 'Esporte' },
  { id: 'leisure',  label: 'Lazer'   },
  { id: 'health',   label: 'Saúde'   },
  { id: 'work',     label: 'Trabalho'},
  { id: 'finance',  label: 'Finanças'},
  { id: 'social',   label: 'Social'  },
  { id: 'general',  label: 'Geral'   },
]

const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

// ── Notification picker ───────────────────────────────────────────────────
function NotifPicker({ value, onChange }) {
  const opts = [
    { id: 'none',   label: 'Nenhuma',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M17.73 17.73A10.9 10.9 0 0 1 12 20a10.9 10.9 0 0 1-5.73-1.73M21 21l-2.27-2.27M3 3l2.27 2.27M10 20a2 2 0 0 0 4 0"/></svg> },
    { id: 'system', label: 'Notificação',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M10 20a2 2 0 0 0 4 0"/></svg> },
    { id: 'alarm',  label: 'Alarme',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6M22 6l-3-3"/></svg> },
    { id: 'both',   label: 'Ambos',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><circle cx="19" cy="5" r="3" fill="currentColor"/></svg> },
  ]
  return (
    <div>
      <div className={s.label}>Notificação</div>
      <div className={s.notifRow}>
        {opts.map(o => (
          <button key={o.id} type="button"
            className={[s.notifBtn, value === o.id ? s.notifActive : ''].join(' ')}
            onClick={() => onChange(o.id)}>
            {o.icon}<span>{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Type chooser ──────────────────────────────────────────────────────────
function TypeChooser({ onChoose }) {
  return (
    <div className={s.typeWrap}>
      <p className={s.typeHint}>O que deseja adicionar?</p>
      <div className={s.typeCards}>
        <button className={s.typeCard} onClick={() => onChoose('habit')}>
          <div className={[s.typeIcon, s.iconHabit].join(' ')}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity=".3"/>
              <path d="M8 12l3 3 5-5"/><path d="M12 6v2M12 16v2M6 12H4M20 12h-2"/>
            </svg>
          </div>
          <div className={s.typeInfo}>
            <span className={s.typeTitle}>Hábito</span>
            <span className={s.typeDesc}>Repete automaticamente — diário, semanal ou mensal</span>
          </div>
          <Icon.ChevRight width={16} height={16} className={s.typeArrow} />
        </button>
        <button className={s.typeCard} onClick={() => onChoose('task')}>
          <div className={[s.typeIcon, s.iconTask].join(' ')}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/>
            </svg>
          </div>
          <div className={s.typeInfo}>
            <span className={s.typeTitle}>Tarefa</span>
            <span className={s.typeDesc}>Aparece todos os dias até ser concluída</span>
          </div>
          <Icon.ChevRight width={16} height={16} className={s.typeArrow} />
        </button>
      </div>
    </div>
  )
}

// ── Frequency options for habits ─────────────────────────────────────────
const FREQ_OPTS = [
  { id: 'daily',         label: 'Diariamente',    sub: 'Todos os dias' },
  { id: 'weekly',        label: 'Semanalmente',   sub: 'Uma vez por semana' },
  { id: 'monthly',       label: 'Mensalmente',    sub: 'Uma vez por mês' },
  { id: 'specific_days', label: 'Dias específicos', sub: 'Escolha os dias' },
]

// ── Habit form ────────────────────────────────────────────────────────────
function HabitForm({ onSave, onBack, defaultDate, initial }) {
  const inferFreq = t => {
    if (!t) return 'daily'
    if (t.frequencyType === 'weekly')  return 'weekly'
    if (t.frequencyType === 'monthly') return 'monthly'
    if (t.frequencyType === 'specific_days') return 'specific_days'
    return 'daily'
  }

  const [name,  setName]  = useState(initial?.name || '')
  const [cat,   setCat]   = useState(initial?.cat  || 'activity')
  const [freq,  setFreq]  = useState(inferFreq(initial))
  const [days,  setDays]  = useState(
    initial?.frequencyType === 'specific_days' && initial?.frequencyDays?.length
      ? initial.frequencyDays.map(Number)
      : []
  )
  const [time,  setTime]  = useState(initial?.time === '—' ? '' : (initial?.time || ''))
  const [goal,  setGoal]  = useState(initial?.goalValue || 0)
  const [unit,  setUnit]  = useState(initial?.goalUnit  || '')
  const [notif, setNotif] = useState(initial?.alert     || 'none')

  const toggleDay = d => setDays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  )

  const handleSave = () => {
    if (!name.trim()) return
    if (freq === 'specific_days' && days.length === 0) return

    const cleanDays = freq === 'specific_days'
      ? days.map(Number).filter(d => !isNaN(d))
      : []

    onSave({
      name:              name.trim(),
      cat,
      time:              time || '—',
      date:              defaultDate || todayKey(),
      done:              false,
      frequencyType:     freq,
      frequencyDays:     cleanDays,
      frequencyInterval: 1,
      goalValue:         parseInt(goal) || 0,
      goalUnit:          unit,
      goalStep:          1,
      currentValue:      0,
      alert:             notif,
      xpValue:           goal > 0 ? 20 : 10,
      priority:          2,
      desc:              '',
      project:           '',
      subtasks:          [],
      reminders:         [],
      endDate:           null,
    })
  }

  const canSave = name.trim() && (freq !== 'specific_days' || days.length > 0)

  return (
    <div className={s.form}>
      <button className={s.backBtn} onClick={onBack}>
        <Icon.ChevLeft width={14} height={14} /> Voltar
      </button>

      <div className={s.formHeader}>
        <div className={[s.formHeaderIcon, s.iconHabit].join(' ')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 12l3 3 5-5"/><circle cx="12" cy="12" r="10"/>
          </svg>
        </div>
        <div>
          <div className={s.formHeaderTitle}>{initial ? 'Editar Hábito' : 'Novo Hábito'}</div>
          <div className={s.formHeaderSub}>Repete automaticamente conforme a frequência</div>
        </div>
      </div>

      <Input label="Nome do hábito *" placeholder="Ex: Meditar, Beber água, Ler..."
        value={name} autoFocus onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && canSave && handleSave()} />

      {/* Categoria */}
      <div>
        <div className={s.label}>Categoria</div>
        <div className={s.catGrid}>
          {CATS.map(c => (
            <button key={c.id} type="button"
              className={[s.catBtn, cat === c.id ? s.catActive : ''].join(' ')}
              onClick={() => setCat(c.id)}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Frequência */}
      <div>
        <div className={s.label}>Frequência</div>
        <div className={s.freqGrid}>
          {FREQ_OPTS.map(f => (
            <button key={f.id} type="button"
              className={[s.freqBtn, freq === f.id ? s.freqActive : ''].join(' ')}
              onClick={() => setFreq(f.id)}>
              <span className={s.freqLabel}>{f.label}</span>
              <span className={s.freqSub}>{f.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dias específicos — só aparece quando selecionado */}
      {freq === 'specific_days' && (
        <div>
          <div className={s.label}>Dias da semana</div>
          <div className={s.dayRow}>
            {WEEKDAYS.map((d, i) => (
              <button key={i} type="button"
                className={[s.dayBtn, days.includes(i) ? s.dayActive : ''].join(' ')}
                onClick={() => toggleDay(i)}>{d.slice(0,3)}</button>
            ))}
          </div>
          {days.length === 0 && (
            <div className={s.dayHint}>Selecione pelo menos um dia</div>
          )}
        </div>
      )}

      <Input label="Horário (opcional)" type="time" value={time}
        onChange={e => setTime(e.target.value)} />

      {/* Meta */}
      <div>
        <div className={s.label}>Meta diária (opcional)</div>
        <div className={s.goalRow}>
          <div className={s.stepRow}>
            <button type="button" className={s.stepBtn} onClick={() => setGoal(Math.max(0, goal - 1))}>−</button>
            <span className={s.stepVal}>{goal}</span>
            <button type="button" className={s.stepBtn} onClick={() => setGoal(goal + 1)}>+</button>
          </div>
          {goal > 0 && (
            <Input placeholder="Unidade (ml, km, min...)" value={unit}
              onChange={e => setUnit(e.target.value)} />
          )}
        </div>
      </div>

      <NotifPicker value={notif} onChange={setNotif} />

      <div className={s.footer}>
        <Button variant="outline" onClick={onBack}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!canSave}>
          {initial ? 'Salvar alterações' : 'Criar hábito'}
        </Button>
      </div>
    </div>
  )
}

// ── Task form ─────────────────────────────────────────────────────────────
const REMINDER_OPTS = [
  { id: '07:00', label: '7h' },
  { id: '08:00', label: '8h' },
  { id: '09:00', label: '9h' },
  { id: '12:00', label: '12h' },
  { id: '18:00', label: '18h' },
  { id: '20:00', label: '20h' },
  { id: '21:00', label: '21h' },
  { id: 'custom', label: 'Outro' },
]

function TaskForm({ onSave, onBack, defaultDate, initial }) {
  const [name,         setName]         = useState(initial?.name || '')
  const [cat,          setCat]          = useState(initial?.cat  || 'study')
  const [date,         setDate]         = useState(initial?.date || defaultDate || todayKey())
  const [time,         setTime]         = useState(initial?.time === '—' ? '' : (initial?.time || ''))
  const [prio,         setPrio]         = useState(initial?.priority || 2)
  const [goal,         setGoal]         = useState(initial?.goalValue || 0)
  const [unit,         setUnit]         = useState(initial?.goalUnit  || '')
  const [desc,         setDesc]         = useState(initial?.desc  || '')
  const [notif,        setNotif]        = useState(initial?.alert || 'none')
  const [reminder,     setReminder]     = useState(initial?.reminders?.[0] || '')
  const [customTime,   setCustomTime]   = useState('')
  const [showCustom,   setShowCustom]   = useState(false)

  const handleReminderPick = id => {
    if (id === 'custom') { setShowCustom(true); return }
    setShowCustom(false)
    setReminder(reminder === id ? '' : id)
  }

  const effectiveReminder = showCustom ? customTime : reminder

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name:              name.trim(),
      cat,
      time:              time || '—',
      date,
      done:              false,
      priority:          prio,
      frequencyType:     'daily_until_done',
      frequencyDays:     [],
      frequencyInterval: 1,
      goalValue:         parseInt(goal) || 0,
      goalUnit:          unit,
      goalStep:          1,
      currentValue:      0,
      desc,
      alert:             notif,
      xpValue:           goal > 0 ? 20 : 10,
      project:           '',
      subtasks:          [],
      reminders:         effectiveReminder ? [effectiveReminder] : [],
      endDate:           null,
    })
  }

  const PRIOS = [
    { id: 1, label: 'Alta',  color: 'var(--red)'    },
    { id: 2, label: 'Média', color: 'var(--yellow)' },
    { id: 3, label: 'Baixa', color: 'var(--green)'  },
  ]

  return (
    <div className={s.form}>
      <button className={s.backBtn} onClick={onBack}>
        <Icon.ChevLeft width={14} height={14} /> Voltar
      </button>

      <div className={s.formHeader}>
        <div className={[s.formHeaderIcon, s.iconTask].join(' ')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/>
          </svg>
        </div>
        <div>
          <div className={s.formHeaderTitle}>{initial ? 'Editar Tarefa' : 'Nova Tarefa'}</div>
          <div className={s.formHeaderSub}>Aparece todo dia até você concluir</div>
        </div>
      </div>

      <Input label="Nome da tarefa *" placeholder="Ex: Revisar capítulo 3, Enviar relatório..."
        value={name} autoFocus onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && name.trim() && handleSave()} />

      {/* Categoria */}
      <div>
        <div className={s.label}>Categoria</div>
        <div className={s.catGrid}>
          {CATS.map(c => (
            <button key={c.id} type="button"
              className={[s.catBtn, cat === c.id ? s.catActive : ''].join(' ')}
              onClick={() => setCat(c.id)}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* Prioridade */}
      <div>
        <div className={s.label}>Prioridade</div>
        <div className={s.prioRow}>
          {PRIOS.map(p => (
            <button key={p.id} type="button"
              className={[s.prioBtn, prio === p.id ? s.prioActive : ''].join(' ')}
              style={prio === p.id ? { borderColor: p.color, color: p.color, background: p.color + '18' } : {}}
              onClick={() => setPrio(p.id)}>
              <span className={s.prioDot} style={{ background: p.color }} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.row2}>
        <Input label="A partir de" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Input label="Horário"     type="time" value={time} onChange={e => setTime(e.target.value)} />
      </div>

      {/* Lembrete diário */}
      <div>
        <div className={s.label}>Lembrete diário (opcional)</div>
        <div className={s.reminderGrid}>
          {REMINDER_OPTS.map(r => (
            <button key={r.id} type="button"
              className={[s.reminderBtn,
                (r.id !== 'custom' && reminder === r.id && !showCustom) ||
                (r.id === 'custom' && showCustom)
                  ? s.reminderActive : ''
              ].join(' ')}
              onClick={() => handleReminderPick(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
        {showCustom && (
          <div style={{ marginTop: 8 }}>
            <Input label="Horário personalizado" type="time" value={customTime}
              onChange={e => setCustomTime(e.target.value)} />
          </div>
        )}
        {effectiveReminder && (
          <div className={s.reminderSet}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Lembrete às {effectiveReminder} todos os dias
            <button className={s.reminderClear} onClick={() => { setReminder(''); setShowCustom(false); setCustomTime('') }}>×</button>
          </div>
        )}
      </div>

      {/* Meta */}
      <div>
        <div className={s.label}>Meta quantitativa (opcional)</div>
        <div className={s.goalRow}>
          <div className={s.stepRow}>
            <button type="button" className={s.stepBtn} onClick={() => setGoal(Math.max(0, goal - 1))}>−</button>
            <span className={s.stepVal}>{goal}</span>
            <button type="button" className={s.stepBtn} onClick={() => setGoal(goal + 1)}>+</button>
          </div>
          {goal > 0 && (
            <Input placeholder="Unidade (páginas, km, ml...)" value={unit}
              onChange={e => setUnit(e.target.value)} />
          )}
        </div>
      </div>

      {/* Notas */}
      <div>
        <div className={s.label}>Notas (opcional)</div>
        <textarea className={s.textarea} placeholder="Descrição, links, referências..."
          value={desc} onChange={e => setDesc(e.target.value)} rows={2} />
      </div>

      <NotifPicker value={notif} onChange={setNotif} />

      <div className={s.footer}>
        <Button variant="outline" onClick={onBack}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!name.trim()}>
          {initial ? 'Salvar alterações' : 'Criar tarefa'}
        </Button>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────
export function AddItemModal({ open, onClose, onSave, defaultDate, editTask }) {
  const inferType = t => {
    if (!t) return null
    if (t.frequencyType === 'daily' || t.frequencyType === 'specific_days' ||
        t.frequencyType === 'weekly' || t.frequencyType === 'monthly') return 'habit'
    return 'task'
  }

  const [type, setType] = useState(null)

  useEffect(() => {
    if (open && editTask) setType(inferType(editTask))
    if (!open) setType(null)
  }, [open, editTask])

  const handleClose = () => { setType(null); onClose() }
  const handleSave  = task => {
    if (typeof onSave !== 'function') { console.error('AddItemModal: onSave is not a function'); return }
    onSave(task); setType(null); onClose()
  }

  const isEdit = !!editTask
  const title  = isEdit
    ? (type === 'habit' ? 'Editar Hábito' : 'Editar Tarefa')
    : (type === 'habit' ? 'Novo Hábito'   : type === 'task' ? 'Nova Tarefa' : 'Adicionar item')

  return (
    <Modal open={open} onClose={handleClose} title={title} maxWidth={480}>
      {!type && <TypeChooser onChoose={setType} />}
      {type === 'habit' && (
        <HabitForm onSave={handleSave} onBack={() => setType(null)} defaultDate={defaultDate} initial={editTask} />
      )}
      {type === 'task' && (
        <TaskForm onSave={handleSave} onBack={() => setType(null)} defaultDate={defaultDate} initial={editTask} />
      )}
    </Modal>
  )
}
