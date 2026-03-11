import { useState } from 'react'
import { Modal }  from '../ui/Modal'
import { Input }  from '../ui/Input'
import { Button } from '../ui/Button'
import { Icon }   from '../../constants/icons'
import { todayKey } from '../../utils/date'
import s from './TaskModal.module.css'

// ── SVG icons for categories ──────────────────────────────────────────────
const CatIcon = {
  study:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  activity: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  sport:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M3 9.5h2v5H3z"/><path d="M5 7h2v10H5z"/><path d="M17 7h2v10h-2z"/><path d="M19 9.5h2v5h-2z"/></svg>,
  health:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  work:     <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  personal: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  leisure:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
  other:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
}

const CATS = [
  { id: 'study',    label: 'Estudo'    },
  { id: 'activity', label: 'Hábito'   },
  { id: 'sport',    label: 'Esporte'  },
  { id: 'health',   label: 'Saúde'    },
  { id: 'work',     label: 'Trabalho' },
  { id: 'personal', label: 'Pessoal'  },
  { id: 'leisure',  label: 'Lazer'    },
  { id: 'other',    label: 'Outros'   },
]

const PRIORITIES = [
  { id: 1, label: 'Alta',  color: 'var(--red)'    },
  { id: 2, label: 'Média', color: 'var(--yellow)' },
  { id: 3, label: 'Baixa', color: 'var(--green)'  },
]

const FREQ_TYPES = [
  { id: 'none',          label: 'Único'           },
  { id: 'daily',         label: 'Diário'          },
  { id: 'specific_days', label: 'Dias específicos' },
  { id: 'interval',      label: 'Intervalo'       },
  { id: 'weekly',        label: 'Semanal'         },
  { id: 'monthly',       label: 'Mensal'          },
]

const WEEKDAYS = [
  { id: 0, label: 'D' }, { id: 1, label: 'S' }, { id: 2, label: 'T' },
  { id: 3, label: 'Q' }, { id: 4, label: 'Q' }, { id: 5, label: 'S' }, { id: 6, label: 'S' },
]

const REMINDER_OPTS = [
  { id: '15min', label: '15 min' }, { id: '30min', label: '30 min' },
  { id: '1h',    label: '1 hora'  }, { id: '2h',   label: '2 horas' },
  { id: '4h',    label: '4 horas' }, { id: '1d',   label: '1 dia'   },
]

const ALERT_OPTS = [
  { id: 'none',   label: 'Nenhum'       },
  { id: 'notify', label: 'Notificação'  },
  { id: 'alarm',  label: 'Alarme'       },
]

const GOAL_UNITS = ['ml', 'l', 'km', 'm', 'páginas', 'capítulos', 'minutos', 'horas', 'repetições', 'copos', 'séries', 'unidades']

// ── 20 Study Methods ──────────────────────────────────────────────────────
const STUDY_METHODS = [
  { id: 'active_recall',  label: 'Active Recall',     desc: 'Teste-se sem olhar para as notas',              group: 'Memorização' },
  { id: 'spaced',         label: 'Repetição Espaçada', desc: 'Revise em intervalos crescentes',               group: 'Memorização' },
  { id: 'flashcards',     label: 'Flashcards',          desc: 'Cartões com perguntas e respostas',             group: 'Memorização' },
  { id: 'loci',           label: 'Palácio da Memória',  desc: 'Associe conceitos a locais mentais',           group: 'Memorização' },
  { id: 'feynman',        label: 'Técnica Feynman',     desc: 'Explique como se fosse a um leigo',             group: 'Compreensão' },
  { id: 'elaborative',    label: 'Elaboração',           desc: 'Conecte ao que já sabe',                       group: 'Compreensão' },
  { id: 'mind_map',       label: 'Mapa Mental',          desc: 'Visualize conexões entre conceitos',           group: 'Compreensão' },
  { id: 'blurting',       label: 'Blurting',             desc: 'Escreva tudo que lembrar do tema',             group: 'Compreensão' },
  { id: 'sq3r',           label: 'SQ3R',                 desc: 'Survey, Question, Read, Recite, Review',       group: 'Compreensão' },
  { id: 'cornell',        label: 'Cornell Notes',        desc: 'Notas estruturadas em 3 colunas',              group: 'Organização' },
  { id: 'outline',        label: 'Método Outline',       desc: 'Hierarquia de tópicos e subtópicos',           group: 'Organização' },
  { id: 'boxing',         label: 'Método Boxing',        desc: 'Agrupe conceitos em caixas temáticas',         group: 'Organização' },
  { id: 'pomodoro',       label: 'Pomodoro',             desc: '25 min foco + 5 min pausa',                    group: 'Concentração' },
  { id: 'deep_work',      label: 'Deep Work',            desc: 'Blocos de 90 min sem interrupção',             group: 'Concentração' },
  { id: 'time_blocking',  label: 'Time Blocking',        desc: 'Reserve horários fixos para estudo',           group: 'Concentração' },
  { id: 'interleaving',   label: 'Interleaving',         desc: 'Alterne entre matérias diferentes',            group: 'Prática' },
  { id: 'dual_coding',    label: 'Codificação Dupla',    desc: 'Combine texto + imagem/diagrama',              group: 'Prática' },
  { id: 'practice_test',  label: 'Provas Simuladas',     desc: 'Faça testes como se fosse uma prova real',     group: 'Prática' },
  { id: 'teach_back',     label: 'Ensine de Volta',      desc: 'Ensine o conteúdo para outra pessoa',          group: 'Prática' },
  { id: 'case_study',     label: 'Estudo de Caso',       desc: 'Aplique teoria a situações reais',             group: 'Prática' },
]

const METHOD_GROUPS = ['Memorização', 'Compreensão', 'Organização', 'Concentração', 'Prática']

const EMPTY = {
  name: '', cat: 'study', time: '', date: todayKey(), desc: '',
  priority: 2, frequencyType: 'none', frequencyDays: [], frequencyInterval: 2,
  goalValue: 0, goalUnit: '', goalStep: 1,
  project: '', tags: [],
  subtasks: [], reminders: [],
  alert: 'none', studyMethod: '',
  endDate: '',
}

export function TaskModal({ open, onClose, onSave, defaultDate }) {
  const [form,   setForm]   = useState({ ...EMPTY, date: defaultDate || todayKey() })
  const [tab,    setTab]    = useState('basic')
  const [newSub, setNewSub] = useState('')
  const [newTag, setNewTag] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleDay = d => set('frequencyDays',
    form.frequencyDays.includes(d) ? form.frequencyDays.filter(x => x !== d) : [...form.frequencyDays, d]
  )
  const addReminder = r => { if (!form.reminders.includes(r)) set('reminders', [...form.reminders, r]) }
  const removeReminder = r => set('reminders', form.reminders.filter(x => x !== r))

  const addSub = () => {
    if (!newSub.trim()) return
    set('subtasks', [...form.subtasks, { id: Date.now(), text: newSub.trim(), done: false }])
    setNewSub('')
  }
  const addTag = () => {
    const t = newTag.trim().toLowerCase()
    if (!t || form.tags.includes(t)) return
    set('tags', [...form.tags, t])
    setNewTag('')
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave({
      id:                Math.random().toString(36).slice(2),
      name:              form.name.trim(),
      cat:               form.cat,
      time:              form.time || '—',
      date:              form.date || defaultDate || todayKey(),
      desc:              form.desc,
      done:              false,
      priority:          form.priority,
      frequencyType:     form.frequencyType,
      frequencyDays:     form.frequencyDays,
      frequencyInterval: form.frequencyInterval,
      goalValue:         parseInt(form.goalValue) || 0,
      goalUnit:          form.goalUnit,
      goalStep:          parseInt(form.goalStep) || 1,
      currentValue:      0,
      project:           form.project,
      tags:              form.tags,
      subtasks:          form.subtasks,
      reminders:         form.reminders,
      alert:             form.alert,
      studyMethod:       form.studyMethod,
      endDate:           form.endDate,
      xpValue:           form.goalValue > 0 ? 20 : 10,
    })
    setForm({ ...EMPTY, date: defaultDate || todayKey() })
    setTab('basic')
    onClose()
  }

  const TABS = [
    { id: 'basic',  label: 'Básico'    },
    { id: 'repeat', label: 'Repetição' },
    { id: 'goal',   label: 'Meta'      },
    { id: 'method', label: 'Método'    },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Nova Tarefa" maxWidth={500}>
      {/* Tab bar — fixed, doesn't scroll */}
      <div className={s.tabs}>
        {TABS.map(t => (
          <button key={t.id} type="button"
            className={[s.tabBtn, tab === t.id ? s.tabActive : ''].join(' ')}
            onClick={() => setTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {/* ── BÁSICO ── */}
      {tab === 'basic' && (
        <div className={s.tabContent}>
          <Input label="Nome da tarefa *" placeholder="Ex: Revisar capítulo 3"
            value={form.name} autoFocus
            onChange={e => set('name', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />

          <div>
            <div className={s.label}>Categoria</div>
            <div className={s.catGrid}>
              {CATS.map(c => (
                <button key={c.id} type="button"
                  className={[s.catBtn, form.cat === c.id ? s.catActive : ''].join(' ')}
                  onClick={() => set('cat', c.id)}>
                  <span className={[s.catIcon, s[`cat-${c.id}`]].join(' ')}>{CatIcon[c.id]}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className={s.label}>Prioridade</div>
            <div className={s.chipRow}>
              {PRIORITIES.map(p => (
                <button key={p.id} type="button"
                  className={[s.chip, form.priority === p.id ? s.chipActive : ''].join(' ')}
                  style={form.priority === p.id ? { borderColor: p.color, color: p.color, background: `${p.color}18` } : {}}
                  onClick={() => set('priority', p.id)}>
                  <span className={s.priorityDot} style={{ background: p.color }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.row2}>
            <Input label="Data"    type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            <Input label="Horário" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
          </div>

          <Input label="Projeto / Lista (opcional)" placeholder="Ex: Faculdade, Saúde..."
            value={form.project} onChange={e => set('project', e.target.value)} />

          {/* Tags */}
          <div>
            <div className={s.label}>Tags</div>
            {form.tags.length > 0 && (
              <div className={s.tagList}>
                {form.tags.map(t => (
                  <span key={t} className={s.tagChip}>#{t}
                    <button type="button" className={s.tagDel} onClick={() => set('tags', form.tags.filter(x => x !== t))}>×</button>
                  </span>
                ))}
              </div>
            )}
            <div className={s.subInput}>
              <input className={s.subInputField} placeholder="Adicionar tag..."
                value={newTag} onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addTag()} }} />
              <button type="button" className={s.subAddBtn} onClick={addTag}>
                <Icon.Plus width={14} height={14} />
              </button>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <div className={s.label}>Subtarefas</div>
            {form.subtasks.map((sub, i) => (
              <div key={sub.id} className={s.subRow}>
                <Icon.List width={11} height={11} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                <span className={s.subText}>{sub.text}</span>
                <button type="button" className={s.subDel}
                  onClick={() => set('subtasks', form.subtasks.filter((_,j)=>j!==i))}>
                  <Icon.X width={11} height={11} />
                </button>
              </div>
            ))}
            <div className={s.subInput}>
              <input className={s.subInputField} placeholder="Adicionar subtarefa..." value={newSub}
                onChange={e => setNewSub(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addSub()} }} />
              <button type="button" className={s.subAddBtn} onClick={addSub}>
                <Icon.Plus width={14} height={14} />
              </button>
            </div>
          </div>

          <div>
            <div className={s.label}>Descrição / Notas</div>
            <textarea className={s.textarea} placeholder="Notas, links, referências..."
              value={form.desc} onChange={e => set('desc', e.target.value)} rows={3} />
          </div>
        </div>
      )}

      {/* ── REPETIÇÃO ── */}
      {tab === 'repeat' && (
        <div className={s.tabContent}>
          <div>
            <div className={s.label}>Tipo de repetição</div>
            <div className={s.chipRow}>
              {FREQ_TYPES.map(f => (
                <button key={f.id} type="button"
                  className={[s.chip, form.frequencyType === f.id ? s.chipActive : ''].join(' ')}
                  onClick={() => set('frequencyType', f.id)}>{f.label}</button>
              ))}
            </div>
          </div>

          {form.frequencyType === 'specific_days' && (
            <div>
              <div className={s.label}>Dias da semana</div>
              <div className={s.dayRow}>
                {WEEKDAYS.map((d) => (
                  <button key={d.id} type="button"
                    className={[s.dayBtn, form.frequencyDays.includes(d.id) ? s.dayActive : ''].join(' ')}
                    onClick={() => toggleDay(d.id)}>{d.label}</button>
                ))}
              </div>
            </div>
          )}

          {form.frequencyType === 'interval' && (
            <div>
              <div className={s.label}>Repetir a cada</div>
              <div className={s.intervalRow}>
                <button type="button" className={s.intervalBtn} onClick={() => set('frequencyInterval', Math.max(1, form.frequencyInterval - 1))}>−</button>
                <span className={s.intervalVal}>{form.frequencyInterval}</span>
                <button type="button" className={s.intervalBtn} onClick={() => set('frequencyInterval', form.frequencyInterval + 1)}>+</button>
                <span className={s.intervalUnit}>dias</span>
              </div>
            </div>
          )}

          <div>
            <div className={s.label}>Data de término (opcional)</div>
            <Input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
          </div>

          <div>
            <div className={s.label}>Alerta</div>
            <div className={s.chipRow}>
              {ALERT_OPTS.map(a => (
                <button key={a.id} type="button"
                  className={[s.chip, form.alert === a.id ? s.chipActive : ''].join(' ')}
                  onClick={() => set('alert', a.id)}>{a.label}</button>
              ))}
            </div>
          </div>

          {form.alert !== 'none' && (
            <div>
              <div className={s.label}>Lembretes</div>
              <div className={s.chipRow}>
                {REMINDER_OPTS.map(r => (
                  <button key={r.id} type="button"
                    className={[s.chip, form.reminders.includes(r.id) ? s.chipActive : ''].join(' ')}
                    onClick={() => form.reminders.includes(r.id) ? removeReminder(r.id) : addReminder(r.id)}
                  >{r.label}</button>
                ))}
              </div>
              {form.reminders.length > 0 && (
                <div className={s.reminderList}>
                  Selecionados: {form.reminders.map(r => REMINDER_OPTS.find(o=>o.id===r)?.label).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── META QUANTITATIVA ── */}
      {tab === 'goal' && (
        <div className={s.tabContent}>
          <div className={s.goalInfo}>
            <Icon.Target width={18} height={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <div>
              <div className={s.goalInfoTitle}>Metas quantitativas</div>
              <div className={s.goalInfoDesc}>Ex: "Beber 8 copos", "Ler 50 páginas", "Correr 5 km".</div>
            </div>
          </div>

          <div>
            <div className={s.label}>Quantidade alvo (0 = apenas check)</div>
            <div className={s.intervalRow}>
              <button type="button" className={s.intervalBtn}
                onClick={() => set('goalValue', Math.max(0, (parseInt(form.goalValue)||0) - 1))}>−</button>
              <span className={s.intervalVal}>{form.goalValue || 0}</span>
              <button type="button" className={s.intervalBtn}
                onClick={() => set('goalValue', (parseInt(form.goalValue)||0) + 1)}>+</button>
            </div>
          </div>

          {form.goalValue > 0 && (
            <>
              <div>
                <div className={s.label}>Unidade de medida</div>
                <div className={s.chipRow}>
                  {GOAL_UNITS.map(u => (
                    <button key={u} type="button"
                      className={[s.chip, form.goalUnit === u ? s.chipActive : ''].join(' ')}
                      onClick={() => set('goalUnit', form.goalUnit === u ? '' : u)}>{u}</button>
                  ))}
                </div>
                <Input placeholder="Ou escreva a sua unidade..."
                  value={GOAL_UNITS.includes(form.goalUnit) ? '' : form.goalUnit}
                  onChange={e => set('goalUnit', e.target.value)} />
              </div>

              <div>
                <div className={s.label}>Incremento por clique</div>
                <div className={s.intervalRow}>
                  <button type="button" className={s.intervalBtn}
                    onClick={() => set('goalStep', Math.max(1, (parseInt(form.goalStep)||1) - 1))}>−</button>
                  <span className={s.intervalVal}>+{form.goalStep || 1}</span>
                  <button type="button" className={s.intervalBtn}
                    onClick={() => set('goalStep', (parseInt(form.goalStep)||1) + 1)}>+</button>
                  {form.goalUnit && <span className={s.intervalUnit}>{form.goalUnit}</span>}
                </div>
              </div>
            </>
          )}

          <div className={s.xpNote}>
            <Icon.Zap width={13} height={13} style={{ color: 'var(--accent)' }} />
            <span>Tarefas normais: <strong>10 XP</strong>. Com meta: <strong>20 XP</strong>.</span>
          </div>
        </div>
      )}

      {/* ── MÉTODO DE ESTUDO ── */}
      {tab === 'method' && (
        <div className={s.tabContent}>
          <p className={s.methodInfo}>
            Escolha uma técnica científica para esta sessão. Fica registado na tarefa.
          </p>
          {METHOD_GROUPS.map(group => (
            <div key={group}>
              <div className={s.methodGroup}>{group}</div>
              <div className={s.methodGrid}>
                {STUDY_METHODS.filter(m => m.group === group).map(m => (
                  <button key={m.id} type="button"
                    className={[s.methodCard, form.studyMethod === m.id ? s.methodActive : ''].join(' ')}
                    onClick={() => set('studyMethod', form.studyMethod === m.id ? '' : m.id)}
                  >
                    <div className={s.methodLabel}>{m.label}</div>
                    <div className={s.methodDesc}>{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={s.footer}>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={!form.name.trim()}>Criar tarefa</Button>
      </div>
    </Modal>
  )
}
