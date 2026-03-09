import { useState, useEffect, useRef, useCallback } from 'react'
import { useGlowCard } from '../components/ui/GlowCard'
import { Icon } from '../constants/icons'
import { Card } from '../components/ui/Card'
import { addFocusEntry, getFocusLog } from '../hooks/useTasks'
import { CATEGORIES } from '../constants'
import s from './TimerPage.module.css'

const MODES = {
  focus:  { label: '🍅 Foco',         secs: 25 * 60, color: '#6d28d9', desc: 'Sessão de foco profundo' },
  short:  { label: '☕ Pausa curta',   secs: 5  * 60, color: '#059669', desc: 'Descanso rápido' },
  long:   { label: '🌿 Pausa longa',   secs: 15 * 60, color: '#0284c7', desc: 'Recuperação completa' },
  deep:   { label: '🔒 Deep Work',     secs: 90 * 60, color: '#b45309', desc: '90 min de trabalho profundo' },
  custom: { label: '⚙️ Personalizado', secs: 30 * 60, color: '#d97706', desc: 'Defina sua duração' },
}

const SOUNDS = [
  { id: 'none',    label: '🔇 Silêncio'    },
  { id: 'white',   label: '🌫️ Ruído branco' },
  { id: 'brown',   label: '☕ Ruído marrom' },
  { id: 'rain',    label: '🌧️ Chuva'        },
  { id: 'storm',   label: '⛈️ Tempestade'   },
  { id: 'forest',  label: '🌿 Floresta'     },
  { id: 'ocean',   label: '🌊 Oceano'       },
  { id: 'fire',    label: '🔥 Lareira'      },
  { id: 'cafe',    label: '☕ Café'          },
  { id: 'keyboard',label: '⌨️ Teclado'      },
]

// ── Web Audio Ambient Generator ────────────────────────────────────────────
function createAmbient(type, ctx) {
  if (!ctx || type === 'none') return null
  const size = 4096
  const nodes = []
  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.13
  masterGain.connect(ctx.destination)

  const noise = (gain = 1) => {
    const s = ctx.createScriptProcessor(size, 1, 1)
    s.onaudioprocess = e => {
      const out = e.outputBuffer.getChannelData(0)
      for (let i = 0; i < size; i++) out[i] = (Math.random() * 2 - 1) * gain
    }
    return s
  }
  const lfo = (freq, gainVal) => {
    const o = ctx.createOscillator(); o.frequency.value = freq
    const g = ctx.createGain();       g.gain.value = gainVal
    o.connect(g); o.start(); return { osc: o, gain: g }
  }
  const bpf = (freq, q) => {
    const f = ctx.createBiquadFilter(); f.type='bandpass'
    f.frequency.value=freq; f.Q.value=q; return f
  }
  const lpf = (freq) => {
    const f = ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=freq; return f
  }

  if (type === 'white') {
    const n = noise(); n.connect(masterGain); nodes.push(n)
  } else if (type === 'brown') {
    let last = 0
    const s2 = ctx.createScriptProcessor(size, 1, 1)
    s2.onaudioprocess = e => {
      const out = e.outputBuffer.getChannelData(0)
      for (let i = 0; i < size; i++) {
        const w = Math.random() * 2 - 1
        out[i] = (last + 0.02 * w) / 1.02; last = out[i]; out[i] *= 3.5
      }
    }
    s2.connect(masterGain); nodes.push(s2)
  } else if (type === 'rain') {
    for (let f = 0; f < 5; f++) {
      const n = noise(0.5); const fl = bpf(200 + f * 700, 0.4)
      const { osc: lo, gain: lg } = lfo(0.05 + f * 0.03, 0.04)
      lo.connect(masterGain.gain)
      n.connect(fl); fl.connect(masterGain)
      nodes.push(n, fl, lo, lg)
    }
  } else if (type === 'storm') {
    for (let f = 0; f < 4; f++) {
      const n = noise(0.7); const fl = bpf(100 + f * 400, 0.3)
      const { osc: lo, gain: lg } = lfo(0.03 + f * 0.02, 0.06)
      lo.connect(masterGain.gain)
      n.connect(fl); fl.connect(masterGain)
      nodes.push(n, fl, lo, lg)
    }
    // Thunder rumble
    const thunder = () => {
      if (!ctx || ctx.state === 'closed') return
      const osc = ctx.createOscillator(); const g = ctx.createGain()
      osc.frequency.value = 30 + Math.random() * 40
      g.gain.setValueAtTime(0, ctx.currentTime)
      g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.3)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2)
      osc.connect(g); g.connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + 2)
      setTimeout(thunder, 8000 + Math.random() * 15000)
    }
    setTimeout(thunder, 2000)
  } else if (type === 'forest') {
    const n = noise(0.3); const fl = ctx.createBiquadFilter()
    fl.type = 'highpass'; fl.frequency.value = 800
    n.connect(fl); fl.connect(masterGain); nodes.push(n, fl)
    const chirp = () => {
      if (!ctx || ctx.state === 'closed') return
      const osc = ctx.createOscillator(); const og = ctx.createGain()
      osc.frequency.setValueAtTime(2200 + Math.random() * 800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.1)
      og.gain.setValueAtTime(0.04, ctx.currentTime)
      og.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
      osc.connect(og); og.connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + 0.15)
      setTimeout(chirp, 2000 + Math.random() * 5000)
    }
    setTimeout(chirp, 500)
  } else if (type === 'ocean') {
    for (let w = 0; w < 3; w++) {
      const n = noise(); const fl = lpf(500)
      const { osc: lo, gain: lg } = lfo(0.06 + w * 0.03, 0.07)
      lo.connect(masterGain.gain)
      n.connect(fl); fl.connect(masterGain)
      nodes.push(n, fl, lo, lg)
    }
  } else if (type === 'fire') {
    const n = noise(0.4); const fl = bpf(400, 0.6)
    const { osc: lo, gain: lg } = lfo(0.15, 0.05)
    lo.connect(masterGain.gain)
    const crackle = () => {
      if (!ctx || ctx.state === 'closed') return
      const osc = ctx.createOscillator(); const g = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.value = 80 + Math.random() * 200
      g.gain.setValueAtTime(0.06, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
      osc.connect(g); g.connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + 0.08)
      setTimeout(crackle, 300 + Math.random() * 900)
    }
    n.connect(fl); fl.connect(masterGain); nodes.push(n, fl, lo, lg)
    setTimeout(crackle, 200)
  } else if (type === 'cafe') {
    // Low ambient murmur
    const n = noise(0.15); const fl = bpf(800, 0.3)
    n.connect(fl); fl.connect(masterGain); nodes.push(n, fl)
    const clink = () => {
      if (!ctx || ctx.state === 'closed') return
      const osc = ctx.createOscillator(); const g = ctx.createGain()
      osc.frequency.value = 1200 + Math.random() * 600
      g.gain.setValueAtTime(0.03, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.connect(g); g.connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + 0.4)
      setTimeout(clink, 4000 + Math.random() * 8000)
    }
    setTimeout(clink, 1000)
  } else if (type === 'keyboard') {
    const click = () => {
      if (!ctx || ctx.state === 'closed') return
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
      const src = ctx.createBufferSource(); const g = ctx.createGain()
      const fl2 = bpf(3000 + Math.random() * 2000, 1)
      g.gain.value = 0.18
      src.buffer = buf; src.connect(fl2); fl2.connect(g); g.connect(ctx.destination)
      src.start()
      setTimeout(click, 80 + Math.random() * 250)
    }
    setTimeout(click, 200)
  }

  return { gain: masterGain, nodes, stop: () => { masterGain.disconnect(); nodes.forEach(n => { try { n.disconnect() } catch{} }) } }
}

// ── Pomodoro cycle counter ─────────────────────────────────────────────────
const POMO_KEY = 'hl_pomo_count'
function getPomoCount() { try { return parseInt(localStorage.getItem(POMO_KEY)||'0') } catch { return 0 } }
function incPomoCount() { try { localStorage.setItem(POMO_KEY, String(getPomoCount()+1)) } catch {} }

export function TimerPage({ tasks = [], focusTask, setFocusTask }) {
  const [mode,       setMode]      = useState('focus')
  const [sec,        setSec]       = useState(MODES.focus.secs)
  const [run,        setRun]       = useState(false)
  const [sound,      setSound]     = useState('none')
  const [volume,     setVolume]    = useState(0.13)
  const [customMin,  setCustomMin] = useState(30)
  const [focusLog,   setFocusLog]  = useState(() => getFocusLog().slice(0, 10))
  const [pomoCount,  setPomoCount] = useState(getPomoCount)
  const [elapsed,    setElapsed]   = useState(0) // seconds elapsed this session
  const timerRef    = useRef()
  const audioCtxRef = useRef(null)
  const ambientRef  = useRef(null)
  const sessionStart = useRef(null)

  const currentMode = { ...MODES[mode], secs: mode === 'custom' ? customMin * 60 : MODES[mode].secs }

  const stopAmbient = useCallback(() => {
    ambientRef.current?.stop()
    ambientRef.current = null
  }, [])

  const startAmbient = useCallback(soundId => {
    stopAmbient()
    if (soundId === 'none') return
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed')
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    const am = createAmbient(soundId, audioCtxRef.current)
    if (am) {
      am.gain.gain.value = volume
      ambientRef.current = am
    }
  }, [stopAmbient, volume])

  // Sync volume to running ambient
  useEffect(() => {
    if (ambientRef.current) ambientRef.current.gain.gain.value = volume
  }, [volume])

  useEffect(() => () => { clearInterval(timerRef.current); stopAmbient() }, [stopAmbient])

  useEffect(() => {
    if (focusTask) { setMode('focus'); setSec(MODES.focus.secs) }
  }, [focusTask])

  const handleToggle = () => {
    if (!run) {
      sessionStart.current = Date.now()
      if (sound !== 'none') startAmbient(sound)
      timerRef.current = setInterval(() => {
        setSec(s => {
          if (s <= 1) {
            clearInterval(timerRef.current)
            setRun(false)
            // Auto-complete: log & notify
            if (mode === 'focus') {
              incPomoCount()
              setPomoCount(getPomoCount())
            }
            try { new Notification('⏱ HabitLife', { body: `${currentMode.label} concluído!`, icon: '/logo.svg' }) } catch {}
            return 0
          }
          return s - 1
        })
        setElapsed(e => e + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current)
      stopAmbient()
      if (sessionStart.current) {
        const secs = Math.round((Date.now() - sessionStart.current) / 1000)
        if (secs > 60) {
          addFocusEntry({
            task:     focusTask?.name || 'Sessão livre',
            cat:      focusTask?.cat  || 'study',
            duration: secs,
            date:     new Date().toISOString().slice(0, 10),
          })
          setFocusLog(getFocusLog().slice(0, 10))
        }
        sessionStart.current = null
      }
    }
    setRun(v => !v)
  }

  const handleReset = () => {
    clearInterval(timerRef.current); stopAmbient()
    setRun(false); setElapsed(0)
    setSec(mode === 'custom' ? customMin * 60 : MODES[mode].secs)
    sessionStart.current = null
  }

  const handleSetMode = m => {
    handleReset(); setMode(m)
    setSec(m === 'custom' ? customMin * 60 : MODES[m].secs)
  }

  const handleSoundChange = id => {
    setSound(id)
    if (run) { if (id === 'none') stopAmbient(); else startAmbient(id) }
  }

  const modeSecs = mode === 'custom' ? customMin * 60 : MODES[mode].secs
  const mm    = String(Math.floor(sec / 60)).padStart(2, '0')
  const ss    = String(sec % 60).padStart(2, '0')
  const R     = 100  // ring radius
  const circ  = 2 * Math.PI * R
  const pct   = sec / (modeSecs || 1)
  const color = currentMode.color
  const SVG_SIZE = 260
  const CENTER   = SVG_SIZE / 2

  const totalFocusMins = focusLog.reduce((a, e) => a + Math.round(e.duration / 60), 0)
  const elapsedMins    = Math.round(elapsed / 60)

  // 🍅 Pomodoro suggestion: after 4 pomos, suggest long break
  const nextBreak = pomoCount > 0 && pomoCount % 4 === 0 && mode === 'focus'
    ? '🌿 Hora da pausa longa!'
    : null

  return (
    <div className={s.page}>
      {/* Pomodoro suggestion banner */}
      {nextBreak && (
        <div className={s.pomoBanner}>
          <span>{nextBreak}</span>
          <button onClick={() => handleSetMode('long')}>Iniciar pausa longa →</button>
        </div>
      )}

      <div className={s.layout}>
        {/* ── Timer column ─────────────────────────────────────────────── */}
        <div className={s.timerCol}>
          {/* Linked task */}
          {focusTask && (
            <div className={s.linkedTask}>
              <span className={s.linkedIcon}>🎯</span>
              <div className={s.linkedInfo}>
                <span className={s.linkedName}>{focusTask.name}</span>
                <span className={s.linkedCat}>{focusTask.cat}</span>
              </div>
              <button className={s.linkedClear} onClick={() => setFocusTask?.(null)}>✕</button>
            </div>
          )}

          {/* Mode tabs */}
          <div className={s.modes}>
            {Object.entries(MODES).map(([k, v]) => (
              <button key={k}
                className={[s.modeBtn, mode === k ? s.active : ''].join(' ')}
                onClick={() => handleSetMode(k)}>
                {v.label}
              </button>
            ))}
          </div>

          {mode === 'custom' && (
            <div className={s.customRow}>
              <span className={s.customLabel}>Duração:</span>
              <button className={s.adjBtn} onClick={() => { setCustomMin(m => Math.max(1, m - 5)); handleReset() }}>−</button>
              <span className={s.customVal}>{customMin} min</span>
              <button className={s.adjBtn} onClick={() => { setCustomMin(m => Math.min(480, m + 5)); handleReset() }}>+</button>
            </div>
          )}

          {/* ── Giant Ring ── */}
          <div className={s.ringWrap}>
            {/* Ambient glow */}
            <div className={s.ringGlow} style={{ background: `radial-gradient(circle, ${color}33 0%, transparent 70%)` }} />

            <svg width={SVG_SIZE} height={SVG_SIZE} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`} className={s.ringSvg}>
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color} />
                  <stop offset="100%" stopColor={color + 'bb'} />
                </linearGradient>
                <filter id="timerGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              {/* Track */}
              <circle cx={CENTER} cy={CENTER} r={R}
                fill="none" stroke="var(--surface-2)" strokeWidth="10" />
              {/* Ticks */}
              {Array.from({ length: 60 }, (_, i) => {
                const a = (i / 60) * 2 * Math.PI - Math.PI / 2
                const r1 = R + 15, r2 = R + (i % 5 === 0 ? 22 : 17)
                return (
                  <line key={i}
                    x1={CENTER + r1 * Math.cos(a)} y1={CENTER + r1 * Math.sin(a)}
                    x2={CENTER + r2 * Math.cos(a)} y2={CENTER + r2 * Math.sin(a)}
                    stroke={i % 5 === 0 ? 'var(--text-3)' : 'var(--border)'}
                    strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
                  />
                )
              })}
              {/* Progress arc */}
              <circle cx={CENTER} cy={CENTER} r={R}
                fill="none" stroke="url(#timerGrad)" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct)}
                transform={`rotate(-90 ${CENTER} ${CENTER})`}
                filter="url(#timerGlow)"
                style={{ transition: run ? 'stroke-dashoffset 0.9s linear' : 'stroke-dashoffset 0.5s ease' }}
              />
              {/* Dot on arc end */}
              {pct > 0.01 && (
                <circle
                  cx={CENTER + R * Math.cos(-Math.PI/2 + (1-pct) * 2 * Math.PI)}
                  cy={CENTER + R * Math.sin(-Math.PI/2 + (1-pct) * 2 * Math.PI)}
                  r="6" fill={color}
                  style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                />
              )}
            </svg>

            <div className={s.ringLabel}>
              <div className={s.time}>{mm}:{ss}</div>
              <div className={s.modeName}>{currentMode.label}</div>
              <div className={s.modeDesc}>{currentMode.desc}</div>
              {run && <div className={s.runDot} />}
              {elapsedMins > 0 && <div className={s.elapsed}>+{elapsedMins}m decorridos</div>}
            </div>
          </div>

          {/* Pomo counter */}
          <div className={s.pomoRow}>
            {Array.from({ length: Math.max(4, (Math.floor(pomoCount / 4) + 1) * 4) }, (_, i) => (
              <div key={i} className={[s.pomoDot, i < pomoCount ? s.pomoDone : ''].join(' ')} />
            )).slice(Math.floor(pomoCount / 4) * 4, Math.floor(pomoCount / 4) * 4 + 4)}
            <span className={s.pomoLabel}>🍅 ×{pomoCount}</span>
          </div>

          {/* Controls */}
          <div className={s.btns}>
            <button className={s.primary} style={{ '--accent-color': color }}
              onClick={handleToggle}>
              {run
                ? <><Icon.Pause width={20} height={20} /> Pausar</>
                : <><Icon.Play  width={20} height={20} /> {sec === modeSecs ? 'Iniciar' : 'Retomar'}</>
              }
            </button>
            <button className={s.secondary} onClick={handleReset}>
              <Icon.RefreshCw width={16} height={16} /> Reiniciar
            </button>
          </div>

          {/* Volume */}
          <div className={s.volumeRow}>
            <span className={s.volIcon}>🔊</span>
            <input type="range" min="0" max="1" step="0.01" value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className={s.volSlider} />
            <span className={s.volVal}>{Math.round(volume * 100)}%</span>
          </div>

          {/* Sound grid */}
          <div className={s.soundSection}>
            <div className={s.sectionLabel}>Som ambiente</div>
            <div className={s.soundGrid}>
              {SOUNDS.map(snd => (
                <button key={snd.id}
                  className={[s.soundBtn, sound === snd.id ? s.soundActive : ''].join(' ')}
                  onClick={() => handleSoundChange(snd.id)}>
                  {snd.label}
                </button>
              ))}
            </div>
          </div>

          {/* Link to task */}
          {!focusTask && tasks.length > 0 && (
            <div className={s.linkSection}>
              <div className={s.sectionLabel}>Vincular tarefa</div>
              <div className={s.taskPicker}>
                {tasks.filter(t => !t.done).slice(0, 8).map(t => (
                  <button key={t.id} className={s.taskPickBtn}
                    onClick={() => setFocusTask?.(t)}>
                    <span className={[s.pickCat, s[CATEGORIES[t.cat]?.cls]].join(' ')} />
                    <span className={s.pickName}>{t.name}</span>
                    {t.studyMethod && <span className={s.pickMethod}>📚</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Stats column ─────────────────────────────────────────────── */}
        <div className={s.statsCol}>
          {/* Today's summary */}
          <Card>
            <div className={s.statTitle}>📊 Sessão atual</div>
            <div className={s.sessionGrid}>
              <div className={s.sessItem}>
                <div className={s.sessVal}>{elapsedMins}</div>
                <div className={s.sessLbl}>min decorridos</div>
              </div>
              <div className={s.sessItem}>
                <div className={s.sessVal}>{pomoCount}</div>
                <div className={s.sessLbl}>pomodoros hoje</div>
              </div>
              <div className={s.sessItem}>
                <div className={s.sessVal}>{totalFocusMins}</div>
                <div className={s.sessLbl}>min focados total</div>
              </div>
              <div className={s.sessItem}>
                <div className={s.sessVal}>{focusLog.length}</div>
                <div className={s.sessLbl}>sessões salvas</div>
              </div>
            </div>
          </Card>

          {/* Focus log */}
          <Card>
            <div className={s.statTitle}>🕒 Histórico de foco</div>
            {focusLog.length === 0 ? (
              <div className={s.logEmpty}>Inicie uma sessão (>1 min) para ver o histórico aqui.</div>
            ) : (
              <div className={s.logList}>
                {focusLog.map((e, i) => (
                  <div key={i} className={s.logRow}>
                    <div className={[s.logCat, s[CATEGORIES[e.cat]?.cls || 'cat-study']].join(' ')} />
                    <div className={s.logInfo}>
                      <div className={s.logTask}>{e.task}</div>
                      <div className={s.logMeta}>{e.date} · {Math.round(e.duration / 60)} min</div>
                    </div>
                    <div className={s.logBar}>
                      <div className={s.logBarFill}
                        style={{ width: `${Math.min(100, Math.round(e.duration / 90))}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Method tips by mode */}
          <Card>
            <div className={s.statTitle}>💡 Dicas da sessão</div>
            <div className={s.tipList}>
              {(focusTask?.studyMethod ? TIPS_BY_METHOD[focusTask.studyMethod] : TIPS_BY_MODE[mode] || TIPS_BY_MODE.focus).map((tip, i) => (
                <div key={i} className={s.tip}>{tip}</div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

const TIPS_BY_MODE = {
  focus: [
    '🍅 25 min de foco total, sem distrações',
    '📵 Celular no silencioso e tela virada',
    '📝 Anote distrações para revisar depois',
    '🎯 Defina UMA tarefa principal antes de começar',
    '💧 Tenha água por perto',
  ],
  short: [
    '🚶 Levante-se e caminhe um pouco',
    '👁️ Olhe para longe para descansar os olhos',
    '🧘 Respire fundo por 30 segundos',
    '💧 Hidrate-se',
  ],
  long: [
    '🌿 Faça uma pausa longa após 4 pomodoros',
    '🍎 Coma algo leve se necessário',
    '🚿 Levante, mova-se, refresqe-se',
    '🧘 Medite 5 minutos para recarregar',
  ],
  deep: [
    '🔒 Deep Work: sem redes sociais, sem e-mail',
    '📴 Desative TODAS as notificações',
    '🎯 Objetivo claro antes de começar',
    '⏰ 90 min é o ciclo natural de concentração',
    '🏆 Este bloco vale 3× um bloco normal',
  ],
  custom: [
    '⚙️ Adapte o tempo às suas necessidades',
    '📊 Experimente diferentes durações',
    '🎵 O som certo aumenta concentração em 15%',
  ],
}

const TIPS_BY_METHOD = {
  pomodoro: ['🍅 25 min foco → 5 min pausa', '📋 Planeje quantos pomodoros a tarefa precisa', '❌ Interrupções destroem o pomodoro — recomece'],
  feynman:  ['✏️ Explique o conceito como se tivesse 12 anos', '🔍 Identifique onde a explicação falha', '📚 Volte à fonte apenas onde travar'],
  active_recall: ['🚫 Feche o livro antes de testar', '🗒️ Escreva tudo que lembrar do tema', '✅ Confira apenas depois'],
  spaced:   ['📅 Revise em: 1 dia → 3 dias → 7 dias → 21 dias', '🧠 A desconfortabilidade de lembrar É o aprendizado', '⏰ Use um app de flashcards com SRS'],
  cornell:  ['📝 Coluna esquerda: conceitos-chave', '📝 Coluna direita: notas detalhadas', '📝 Rodapé: resumo em suas palavras'],
  deep_work: ['🔒 Sem redes sociais por toda a sessão', '🎯 Defina o output esperado antes', '📈 Aumente 15 min por semana gradualmente'],
}
