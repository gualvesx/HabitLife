import { useState } from 'react'
import { Modal }  from '../ui/Modal'
import { Input }  from '../ui/Input'
import { Button } from '../ui/Button'
import { todayKey } from '../../utils/date'
import s from './TaskModal.module.css'

const CATS = [
  { id: 'study',    label: '📚 Estudo'  },
  { id: 'activity', label: '⚡ Hábito'  },
  { id: 'leisure',  label: '🔁 Revisão' },
]
const PRIORITIES = [
  { id: 1, label: '🔴 Alta',  color: 'var(--red)'    },
  { id: 2, label: '🟡 Média', color: 'var(--yellow)' },
  { id: 3, label: '🟢 Baixa', color: 'var(--green)'  },
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
  { id: 'none',   label: 'Nenhum'         },
  { id: 'notify', label: '🔔 Notificação' },
  { id: 'alarm',  label: '⏰ Alarme'       },
]
const GOAL_UNITS = ['ml', 'l', 'km', 'm', 'páginas', 'capítulos', 'minutos', 'horas', 'repetições', 'copos', 'tarefas', 'exercícios', 'séries', 'unidades']

// ── 20 Study Methods ─────────────────────────────────────────────────────
const STUDY_METHODS = [
  // Memorização & Recall
  { id: 'active_recall',  label: '🧠 Active Recall',      desc: 'Teste-se sem olhar para as notas', group: 'Memorização' },
  { id: 'spaced',         label: '📅 Repetição Espaçada',  desc: 'Revise em intervalos crescentes', group: 'Memorização' },
  { id: 'flashcards',     label: '🃏 Flashcards',           desc: 'Cartões com perguntas e respostas', group: 'Memorização' },
  { id: 'loci',           label: '🏛️ Palácio da Memória',   desc: 'Associe conceitos a locais mentais', group: 'Memorização' },
  // Compreensão & Síntese
  { id: 'feynman',        label: '🧑‍🏫 Técnica Feynman',     desc: 'Explique como se fosse a um leigo', group: 'Compreensão' },
  { id: 'elaborative',    label: '🔗 Elaboração',            desc: 'Conecte ao que já sabe', group: 'Compreensão' },
  { id: 'mind_map',       label: '🗺 Mapa Mental',           desc: 'Visualize conexões entre conceitos', group: 'Compreensão' },
  { id: 'blurting',       label: '✍️ Blurting',              desc: 'Escreva tudo que lembrar do tema', group: 'Compreensão' },
  { id: 'sq3r',           label: '📖 SQ3R',                  desc: 'Survey, Question, Read, Recite, Review', group: 'Compreensão' },
  // Organização & Notas
  { id: 'cornell',        label: '📝 Cornell Notes',         desc: 'Notas estruturadas em 3 colunas', group: 'Organização' },
  { id: 'outline',        label: '📋 Método Outline',        desc: 'Hierarquia de tópicos e subtópicos', group: 'Organização' },
  { id: 'boxing',         label: '📦 Método Boxing',         desc: 'Agrupe conceitos em caixas temáticas', group: 'Organização' },
  // Concentração & Fluxo
  { id: 'pomodoro',       label: '🍅 Pomodoro',              desc: '25 min foco + 5 min pausa', group: 'Concentração' },
  { id: 'deep_work',      label: '🔒 Deep Work',             desc: 'Blocos de 90 min sem interrupção', group: 'Concentração' },
  { id: 'time_blocking',  label: '⏱ Time Blocking',          desc: 'Reserve horários fixos para estudo', group: 'Concentração' },
  // Prática & Aplicação
  { id: 'interleaving',   label: '🔀 Interleaving',          desc: 'Alterne entre matérias diferentes', group: 'Prática' },
  { id: 'dual_coding',    label: '🎨 Codificação Dupla',     desc: 'Combine texto + imagem/diagrama', group: 'Prática' },
  { id: 'practice_test',  label: '📝 Provas Simuladas',      desc: 'Faça testes como se fosse uma prova real', group: 'Prática' },
  { id: 'teach_back',     label: '👥 Ensine de Volta',        desc: 'Ensine o conteúdo para outra pessoa', group: 'Prática' },
  { id: 'case_study',     label: '🔬 Estudo de Caso',        desc: 'Aplique teoria a situações reais', group: 'Prática' },
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
    { id: 'basic',  label: '📋 Básico'    },
    { id: 'repeat', label: '🔁 Repetição' },
    { id: 'goal',   label: '🎯 Meta'      },
    { id: 'method', label: '📚 Método'    },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Nova Tarefa">
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
            <div className={s.chipRow}>
              {CATS.map(c => (
                <button key={c.id} type="button"
                  className={[s.chip, form.cat === c.id ? s.chipActive : ''].join(' ')}
                  onClick={() => set('cat', c.id)}>{c.label}</button>
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
                  onClick={() => set('priority', p.id)}>{p.label}</button>
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
            <div className={s.tagList}>
              {form.tags.map(t => (
                <span key={t} className={s.tagChip}>#{t}
                  <button type="button" className={s.tagDel} onClick={() => set('tags', form.tags.filter(x => x !== t))}>×</button>
                </span>
              ))}
            </div>
            <div className={s.subInput}>
              <input className={s.subInputField} placeholder="Adicionar tag... (Enter)"
                value={newTag} onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addTag()} }} />
              <button type="button" className={s.subAddBtn} onClick={addTag}>+</button>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <div className={s.label}>Subtarefas</div>
            {form.subtasks.map((sub, i) => (
              <div key={sub.id} className={s.subRow}>
                <span className={s.subText}>{sub.text}</span>
                <button type="button" className={s.subDel}
                  onClick={() => set('subtasks', form.subtasks.filter((_,j)=>j!==i))}>✕</button>
              </div>
            ))}
            <div className={s.subInput}>
              <input className={s.subInputField} placeholder="Adicionar subtarefa..." value={newSub}
                onChange={e => setNewSub(e.target.value)}
                onKeyDown={e => { if(e.key==='Enter'){e.preventDefault();addSub()} }} />
              <button type="button" className={s.subAddBtn} onClick={addSub}>+</button>
            </div>
          </div>

          <div>
            <div className={s.label}>Descrição / Notas (opcional)</div>
            <textarea className={s.textarea} placeholder="Notas detalhadas, links, referências, contexto..."
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
              <div className={s.label}>Lembretes múltiplos</div>
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
                  🔔 Selecionados: {form.reminders.map(r => REMINDER_OPTS.find(o=>o.id===r)?.label).join(', ')}
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
            <div className={s.goalInfoIcon}>🎯</div>
            <div>
              <div className={s.goalInfoTitle}>Metas quantitativas</div>
              <div className={s.goalInfoDesc}>Defina uma meta numérica. Ex: "Beber 8 copos", "Ler 50 páginas", "Correr 5 km".</div>
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
                <div className={s.label}>Incremento por clique (+Step)</div>
                <div className={s.intervalRow}>
                  <button type="button" className={s.intervalBtn}
                    onClick={() => set('goalStep', Math.max(1, (parseInt(form.goalStep)||1) - 1))}>−</button>
                  <span className={s.intervalVal}>+{form.goalStep || 1}</span>
                  <button type="button" className={s.intervalBtn}
                    onClick={() => set('goalStep', (parseInt(form.goalStep)||1) + 1)}>+</button>
                  {form.goalUnit && <span className={s.intervalUnit}>{form.goalUnit}</span>}
                </div>
              </div>

              <div className={s.goalPreview}>
                <div className={s.goalPreviewBar}>
                  <div className={s.goalPreviewFill} style={{ width: '0%' }} />
                </div>
                <span>0 / {form.goalValue}{form.goalUnit ? ` ${form.goalUnit}` : ''}</span>
                <span className={s.goalXP}>+20 XP ao completar</span>
              </div>
            </>
          )}

          {form.goalValue === 0 && (
            <div className={s.xpNote}>
              <span>⚡</span>
              <span>Tarefas normais dão <strong>10 XP</strong>. Tarefas com meta dão <strong>20 XP</strong>.</span>
            </div>
          )}
        </div>
      )}

      {/* ── MÉTODO DE ESTUDO ── */}
      {tab === 'method' && (
        <div className={s.tabContent}>
          <div className={s.methodInfo}>
            Escolha uma técnica científica para esta sessão. O método fica registado na tarefa.
          </div>
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
