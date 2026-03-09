import { useState } from 'react'
import { Modal }  from '../ui/Modal'
import { Input }  from '../ui/Input'
import { Button } from '../ui/Button'
import { Icon }   from '../../constants/icons'
import { todayKey } from '../../utils/date'
import s from './AddItemModal.module.css'

const CATS = [
  { id: 'study',    label: 'Estudo'   },
  { id: 'activity', label: 'Hábito'  },
  { id: 'sport',    label: 'Esporte' },
  { id: 'health',   label: 'Saúde'   },
  { id: 'work',     label: 'Trabalho'},
  { id: 'personal', label: 'Pessoal' },
  { id: 'leisure',  label: 'Lazer'   },
  { id: 'other',    label: 'Outros'  },
]

const WEEKDAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

// ── Type chooser ──────────────────────────────────────────────────────────
function TypeChooser({ onChoose }) {
  return (
    <div className={s.typeWrap}>
      <p className={s.typeHint}>O que deseja adicionar?</p>
      <div className={s.typeCards}>

        {/* Hábito */}
        <button className={s.typeCard} onClick={() => onChoose('habit')}>
          <div className={[s.typeIcon, s.iconHabit].join(' ')}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity=".3"/>
              <path d="M8 12l3 3 5-5"/>
              <path d="M12 6v2M12 16v2M6 12H4M20 12h-2"/>
            </svg>
          </div>
          <div className={s.typeInfo}>
            <span className={s.typeTitle}>Hábito</span>
            <span className={s.typeDesc}>Repete todo dia automaticamente</span>
          </div>
          <Icon.ChevRight width={16} height={16} className={s.typeArrow} />
        </button>

        {/* Tarefa */}
        <button className={s.typeCard} onClick={() => onChoose('task')}>
          <div className={[s.typeIcon, s.iconTask].join(' ')}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8"  y1="2" x2="8"  y2="6"/>
              <line x1="3"  y1="10" x2="21" y2="10"/>
              <polyline points="9 16 11 18 15 14"/>
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

// ── Habit form ────────────────────────────────────────────────────────────
function HabitForm({ onSave, onBack, defaultDate }) {
  const [name,   setName]   = useState('')
  const [cat,    setCat]    = useState('activity')
  const [time,   setTime]   = useState('')
  const [days,   setDays]   = useState([0,1,2,3,4,5,6]) // all days by default
  const [goal,   setGoal]   = useState(0)
  const [unit,   setUnit]   = useState('')

  const toggleDay = d => setDays(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  )

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      id:            Math.random().toString(36).slice(2),
      name:          name.trim(),
      cat,
      time:          time || '—',
      date:          defaultDate || todayKey(),
      done:          false,
      frequencyType: days.length === 7 ? 'daily' : 'specific_days',
      frequencyDays: days,
      goalValue:     parseInt(goal) || 0,
      goalUnit:      unit,
      goalStep:      1,
      currentValue:  0,
      xpValue:       goal > 0 ? 20 : 10,
      isHabit:       true,
    })
  }

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
          <div className={s.formHeaderTitle}>Novo Hábito</div>
          <div className={s.formHeaderSub}>Repete diariamente de forma automática</div>
        </div>
      </div>

      <Input label="Nome do hábito *" placeholder="Ex: Meditar, Beber água, Ler..."
        value={name} autoFocus onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSave()} />

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

      <div>
        <div className={s.label}>Dias da semana</div>
        <div className={s.dayRow}>
          {WEEKDAYS.map((d, i) => (
            <button key={i} type="button"
              className={[s.dayBtn, days.includes(i) ? s.dayActive : ''].join(' ')}
              onClick={() => toggleDay(i)}>{d[0]}</button>
          ))}
          <button type="button" className={s.dayAllBtn}
            onClick={() => setDays(days.length === 7 ? [] : [0,1,2,3,4,5,6])}>
            {days.length === 7 ? 'Limpar' : 'Todos'}
          </button>
        </div>
      </div>

      <Input label="Horário (opcional)" type="time" value={time} onChange={e => setTime(e.target.value)} />

      <div>
        <div className={s.label}>Meta diária (opcional)</div>
        <div className={s.goalRow}>
          <div className={s.stepRow}>
            <button type="button" className={s.stepBtn}
              onClick={() => setGoal(Math.max(0, goal - 1))}>−</button>
            <span className={s.stepVal}>{goal}</span>
            <button type="button" className={s.stepBtn}
              onClick={() => setGoal(goal + 1)}>+</button>
          </div>
          {goal > 0 && (
            <Input placeholder="Unidade (ml, km, min...)" value={unit}
              onChange={e => setUnit(e.target.value)} />
          )}
        </div>
      </div>

      <div className={s.footer}>
        <Button variant="outline" onClick={onBack}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!name.trim() || days.length === 0}>
          Criar hábito
        </Button>
      </div>
    </div>
  )
}

// ── Task form ─────────────────────────────────────────────────────────────
function TaskForm({ onSave, onBack, defaultDate }) {
  const [name,   setName]   = useState('')
  const [cat,    setCat]    = useState('study')
  const [date,   setDate]   = useState(defaultDate || todayKey())
  const [time,   setTime]   = useState('')
  const [prio,   setPrio]   = useState(2)
  const [goal,   setGoal]   = useState(0)
  const [unit,   setUnit]   = useState('')
  const [desc,   setDesc]   = useState('')

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      id:            Math.random().toString(36).slice(2),
      name:          name.trim(),
      cat,
      time:          time || '—',
      date,
      done:          false,
      priority:      prio,
      // Repeats every day until marked done
      frequencyType: 'daily_until_done',
      frequencyDays: [],
      goalValue:     parseInt(goal) || 0,
      goalUnit:      unit,
      goalStep:      1,
      currentValue:  0,
      desc,
      xpValue:       goal > 0 ? 20 : 10,
      isHabit:       false,
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
            <line x1="3" y1="10" x2="21" y2="10"/>
            <polyline points="9 16 11 18 15 14"/>
          </svg>
        </div>
        <div>
          <div className={s.formHeaderTitle}>Nova Tarefa</div>
          <div className={s.formHeaderSub}>Aparece todo dia até você concluir</div>
        </div>
      </div>

      <Input label="Nome da tarefa *" placeholder="Ex: Revisar capítulo 3, Enviar relatório..."
        value={name} autoFocus onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSave()} />

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
        <Input label="Horário" type="time" value={time} onChange={e => setTime(e.target.value)} />
      </div>

      <div>
        <div className={s.label}>Meta quantitativa (opcional)</div>
        <div className={s.goalRow}>
          <div className={s.stepRow}>
            <button type="button" className={s.stepBtn}
              onClick={() => setGoal(Math.max(0, goal - 1))}>−</button>
            <span className={s.stepVal}>{goal}</span>
            <button type="button" className={s.stepBtn}
              onClick={() => setGoal(goal + 1)}>+</button>
          </div>
          {goal > 0 && (
            <Input placeholder="Unidade (páginas, km, ml...)" value={unit}
              onChange={e => setUnit(e.target.value)} />
          )}
        </div>
      </div>

      <div>
        <div className={s.label}>Notas (opcional)</div>
        <textarea className={s.textarea} placeholder="Descrição, links, referências..."
          value={desc} onChange={e => setDesc(e.target.value)} rows={2} />
      </div>

      <div className={s.footer}>
        <Button variant="outline" onClick={onBack}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!name.trim()}>Criar tarefa</Button>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────
export function AddItemModal({ open, onClose, onSave, defaultDate }) {
  const [type, setType] = useState(null) // null | 'habit' | 'task'

  const handleClose = () => { setType(null); onClose() }
  const handleSave  = task => { onSave(task); setType(null); onClose() }

  return (
    <Modal open={open} onClose={handleClose}
      title={type === 'habit' ? 'Novo Hábito' : type === 'task' ? 'Nova Tarefa' : 'Adicionar item'}
      maxWidth={480}>
      {!type && <TypeChooser onChoose={setType} />}
      {type === 'habit' && (
        <HabitForm onSave={handleSave} onBack={() => setType(null)} defaultDate={defaultDate} />
      )}
      {type === 'task' && (
        <TaskForm onSave={handleSave} onBack={() => setType(null)} defaultDate={defaultDate} />
      )}
    </Modal>
  )
}
