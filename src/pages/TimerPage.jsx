import { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from '../constants/icons'
import { Card } from '../components/ui/Card'
import { addFocusEntry, getFocusLog } from '../hooks/useTasks'
import { useNativeAlarm, fireAlarmNow } from '../hooks/useNativeAlarm'
import { CATEGORIES } from '../constants'
import s from './TimerPage.module.css'

const MODES = {
  focus:  { label: 'Pomodoro',     secs: 25 * 60, color: '#6d28d9' },
  short:  { label: 'Pausa curta',  secs: 5  * 60, color: '#059669' },
  long:   { label: 'Pausa longa',  secs: 15 * 60, color: '#0284c7' },
  deep:   { label: 'Foco profundo',secs: 90 * 60, color: '#b45309' },
  custom: { label: 'Personalizado',secs: 30 * 60, color: '#d97706' },
}

const SOUNDS = [
  { id: 'none',    label: 'Silêncio'    },
  { id: 'white',   label: 'Ruído branco'},
  { id: 'brown',   label: 'Ruído marrom'},
  { id: 'rain',    label: 'Chuva'       },
  { id: 'storm',   label: 'Tempestade'  },
  { id: 'forest',  label: 'Floresta'    },
  { id: 'ocean',   label: 'Oceano'      },
  { id: 'fire',    label: 'Lareira'     },
  { id: 'cafe',    label: 'Café'        },
  { id: 'keyboard',label: 'Teclado'     },
]

// ── Web Audio Ambient ──────────────────────────────────────────────────────
function createAmbient(type, ctx) {
  if (!ctx || type === 'none') return null
  const size = 4096
  const nodes = []
  const mg = ctx.createGain(); mg.gain.value = 0.13; mg.connect(ctx.destination)

  const noise = (gain = 1) => {
    const s2 = ctx.createScriptProcessor(size, 1, 1)
    s2.onaudioprocess = e => { const o = e.outputBuffer.getChannelData(0); for (let i=0;i<size;i++) o[i]=(Math.random()*2-1)*gain }
    return s2
  }
  const lfo = (freq, gainVal) => {
    const o = ctx.createOscillator(); o.frequency.value = freq
    const g = ctx.createGain(); g.gain.value = gainVal
    o.connect(g); o.start(); return { osc:o, gain:g }
  }
  const bpf = (freq, q) => { const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=freq;f.Q.value=q;return f }
  const lpf = (freq)    => { const f=ctx.createBiquadFilter();f.type='lowpass'; f.frequency.value=freq;return f }

  if (type === 'white') { const n=noise(); n.connect(mg); nodes.push(n) }
  else if (type === 'brown') {
    let last = 0
    const s2 = ctx.createScriptProcessor(size,1,1)
    s2.onaudioprocess = e => { const o=e.outputBuffer.getChannelData(0); for(let i=0;i<size;i++){const w=Math.random()*2-1;o[i]=(last+0.02*w)/1.02;last=o[i];o[i]*=3.5} }
    s2.connect(mg); nodes.push(s2)
  } else if (type === 'rain') {
    for(let f=0;f<5;f++){const n=noise(0.5);const fl=bpf(200+f*700,0.4);const {osc:lo}=lfo(0.05+f*0.03,0.04);lo.connect(mg.gain);n.connect(fl);fl.connect(mg);nodes.push(n,fl,lo)}
  } else if (type === 'storm') {
    for(let f=0;f<4;f++){const n=noise(0.7);const fl=bpf(100+f*400,0.3);const {osc:lo}=lfo(0.03+f*0.02,0.06);lo.connect(mg.gain);n.connect(fl);fl.connect(mg);nodes.push(n,fl,lo)}
    const thunder=()=>{if(!ctx||ctx.state==='closed')return;const o=ctx.createOscillator();const g=ctx.createGain();o.frequency.value=30+Math.random()*40;g.gain.setValueAtTime(0,ctx.currentTime);g.gain.linearRampToValueAtTime(0.3,ctx.currentTime+0.3);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+2);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+2);setTimeout(thunder,8000+Math.random()*15000)};setTimeout(thunder,2000)
  } else if (type === 'forest') {
    const n=noise(0.3);const fl=ctx.createBiquadFilter();fl.type='highpass';fl.frequency.value=800;n.connect(fl);fl.connect(mg);nodes.push(n,fl)
    const chirp=()=>{if(!ctx||ctx.state==='closed')return;const o=ctx.createOscillator();const g=ctx.createGain();o.frequency.setValueAtTime(2200+Math.random()*800,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(1800,ctx.currentTime+0.1);g.gain.setValueAtTime(0.04,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.15);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+0.15);setTimeout(chirp,2000+Math.random()*5000)};setTimeout(chirp,500)
  } else if (type === 'ocean') {
    for(let w=0;w<3;w++){const n=noise();const fl=lpf(500);const {osc:lo}=lfo(0.06+w*0.03,0.07);lo.connect(mg.gain);n.connect(fl);fl.connect(mg);nodes.push(n,fl,lo)}
  } else if (type === 'fire') {
    const n=noise(0.4);const fl=bpf(400,0.6);const {osc:lo}=lfo(0.15,0.05);lo.connect(mg.gain);n.connect(fl);fl.connect(mg);nodes.push(n,fl,lo)
    const crackle=()=>{if(!ctx||ctx.state==='closed')return;const o=ctx.createOscillator();const g=ctx.createGain();o.type='sawtooth';o.frequency.value=80+Math.random()*200;g.gain.setValueAtTime(0.06,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.08);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+0.08);setTimeout(crackle,300+Math.random()*900)};setTimeout(crackle,200)
  } else if (type === 'cafe') {
    const n=noise(0.15);const fl=bpf(800,0.3);n.connect(fl);fl.connect(mg);nodes.push(n,fl)
    const clink=()=>{if(!ctx||ctx.state==='closed')return;const o=ctx.createOscillator();const g=ctx.createGain();o.frequency.value=1200+Math.random()*600;g.gain.setValueAtTime(0.03,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+0.4);setTimeout(clink,4000+Math.random()*8000)};setTimeout(clink,1000)
  } else if (type === 'keyboard') {
    const click=()=>{if(!ctx||ctx.state==='closed')return;const buf=ctx.createBuffer(1,ctx.sampleRate*0.05,ctx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const src=ctx.createBufferSource();const g=ctx.createGain();const fl=bpf(3000+Math.random()*2000,1);g.gain.value=0.18;src.buffer=buf;src.connect(fl);fl.connect(g);g.connect(ctx.destination);src.start();setTimeout(click,80+Math.random()*250)};setTimeout(click,200)
  }
  return { gain: mg, nodes, stop: () => { mg.disconnect(); nodes.forEach(n=>{ try{n.disconnect()}catch{} }) } }
}

const POMO_KEY = 'hl_pomo_count'
function getPomoCount() { try { return parseInt(localStorage.getItem(POMO_KEY)||'0') } catch { return 0 } }
function incPomoCount() { try { localStorage.setItem(POMO_KEY, String(getPomoCount()+1)) } catch {} }

export function TimerPage({ tasks = [], focusTask, setFocusTask }) {
  const { fireNow } = useNativeAlarm()
  const [mode,       setMode]      = useState('focus')
  const [sec,        setSec]       = useState(MODES.focus.secs)
  const [run,        setRun]       = useState(false)
  const [sound,      setSound]     = useState('none')
  const [volume,     setVolume]    = useState(0.13)
  const [customMin,  setCustomMin] = useState(30)
  const [focusLog,   setFocusLog]  = useState(() => getFocusLog().slice(0, 8))
  const [pomoCount,  setPomoCount] = useState(getPomoCount)
  const [elapsed,    setElapsed]   = useState(0)
  const timerRef    = useRef()
  const audioCtxRef = useRef(null)
  const ambientRef  = useRef(null)
  const sessionStart = useRef(null)

  const currentMode = { ...MODES[mode], secs: mode === 'custom' ? customMin * 60 : MODES[mode].secs }

  const stopAmbient = useCallback(() => { ambientRef.current?.stop(); ambientRef.current = null }, [])

  const startAmbient = useCallback(soundId => {
    stopAmbient()
    if (soundId === 'none') return
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed')
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    const am = createAmbient(soundId, audioCtxRef.current)
    if (am) { am.gain.gain.value = volume; ambientRef.current = am }
  }, [stopAmbient, volume])

  useEffect(() => { if (ambientRef.current) ambientRef.current.gain.gain.value = volume }, [volume])
  useEffect(() => () => { clearInterval(timerRef.current); stopAmbient() }, [stopAmbient])
  useEffect(() => { if (focusTask) { setMode('focus'); setSec(MODES.focus.secs) } }, [focusTask])

  const handleToggle = () => {
    if (!run) {
      sessionStart.current = Date.now()
      if (sound !== 'none') startAmbient(sound)
      timerRef.current = setInterval(() => {
        setSec(s => {
          if (s <= 1) {
            clearInterval(timerRef.current); setRun(false)
            if (mode === 'focus') { incPomoCount(); setPomoCount(getPomoCount()) }
            fireAlarmNow('HabitLife ✓', `${currentMode.label} concluído! Bom trabalho.`)
            return 0
          }
          return s - 1
        })
        setElapsed(e => e + 1)
      }, 1000)
    } else {
      clearInterval(timerRef.current); stopAmbient()
      if (sessionStart.current) {
        const secs = Math.round((Date.now() - sessionStart.current) / 1000)
        if (secs > 60) {
          addFocusEntry({ task: focusTask?.name || 'Sessão livre', cat: focusTask?.cat || 'study', duration: secs, date: new Date().toISOString().slice(0, 10) })
          setFocusLog(getFocusLog().slice(0, 8))
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

  const handleSetMode = m => { handleReset(); setMode(m); setSec(m === 'custom' ? customMin * 60 : MODES[m].secs) }
  const handleSoundChange = id => { setSound(id); if (run) { if (id === 'none') stopAmbient(); else startAmbient(id) } }

  const modeSecs = mode === 'custom' ? customMin * 60 : MODES[mode].secs
  const mm   = String(Math.floor(sec / 60)).padStart(2, '0')
  const ss2  = String(sec % 60).padStart(2, '0')
  const R    = 110
  const circ = 2 * Math.PI * R
  const pct  = sec / (modeSecs || 1)
  const color = currentMode.color
  const SZ   = 280; const C = SZ / 2

  const totalFocusMins = focusLog.reduce((a, e) => a + Math.round(e.duration / 60), 0)
  const elapsedMins    = Math.round(elapsed / 60)

  return (
    <div className={s.page}>
      <div className={s.center}>
        {/* Linked task */}
        {focusTask && (
          <div className={s.linkedTask}>
            <Icon.Target width={14} height={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span className={s.linkedName}>{focusTask.name}</span>
            <button className={s.linkedClear} onClick={() => setFocusTask?.(null)}>
              <Icon.X width={12} height={12} />
            </button>
          </div>
        )}

        {/* Mode tabs */}
        <div className={s.modes}>
          {Object.entries(MODES).map(([k, v]) => (
            <button key={k}
              className={[s.modeBtn, mode === k ? s.active : ''].join(' ')}
              style={mode === k ? { borderColor: v.color, color: v.color, background: v.color + '18' } : {}}
              onClick={() => handleSetMode(k)}>
              {v.label}
            </button>
          ))}
        </div>

        {mode === 'custom' && (
          <div className={s.customRow}>
            <span className={s.customLabel}>Duração:</span>
            <button className={s.adjBtn} onClick={() => { setCustomMin(m => Math.max(1, m-5)); handleReset() }}>−</button>
            <span className={s.customVal}>{customMin} min</span>
            <button className={s.adjBtn} onClick={() => { setCustomMin(m => Math.min(480, m+5)); handleReset() }}>+</button>
          </div>
        )}

        {/* ── Giant Ring ── */}
        <div className={s.ringWrap}>
          <div className={s.ringGlow} style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)` }} />
          <svg width={SZ} height={SZ} viewBox={`0 0 ${SZ} ${SZ}`} className={s.ringSvg}>
            <defs>
              <linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={color + 'bb'} />
              </linearGradient>
            </defs>
            {/* Tick marks */}
            {Array.from({length:60},(_,i)=>{
              const a=(i/60)*2*Math.PI-Math.PI/2; const r1=R+14; const r2=R+(i%5===0?21:16)
              return <line key={i} x1={C+r1*Math.cos(a)} y1={C+r1*Math.sin(a)} x2={C+r2*Math.cos(a)} y2={C+r2*Math.sin(a)} stroke={i%5===0?'var(--text-3)':'var(--border)'} strokeWidth={i%5===0?1.5:0.8}/>
            })}
            <circle cx={C} cy={C} r={R} fill="none" stroke="var(--surface-2)" strokeWidth="10"/>
            <circle cx={C} cy={C} r={R} fill="none" stroke="url(#tg)" strokeWidth="10"
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
              transform={`rotate(-90 ${C} ${C})`}
              style={{transition: run ? 'stroke-dashoffset 0.9s linear' : 'stroke-dashoffset 0.4s ease'}}
            />
            {pct > 0.01 && (
              <circle
                cx={C+R*Math.cos(-Math.PI/2+(1-pct)*2*Math.PI)}
                cy={C+R*Math.sin(-Math.PI/2+(1-pct)*2*Math.PI)}
                r="6" fill={color} style={{filter:`drop-shadow(0 0 6px ${color})`}}
              />
            )}
          </svg>
          <div className={s.ringLabel}>
            <div className={s.time}>{mm}:{ss2}</div>
            <div className={s.modeName} style={{ color }}>{currentMode.label}</div>
            {run && <div className={s.runDot} />}
            {elapsedMins > 0 && <div className={s.elapsed}>+{elapsedMins}m decorridos</div>}
          </div>
        </div>

        {/* Pomodoro counter */}
        <div className={s.pomoRow}>
          {[0,1,2,3].map(i => (
            <div key={i} className={[s.pomoDot, (pomoCount % 4) > i ? s.pomoDone : ''].join(' ')} />
          ))}
          <span className={s.pomoLabel}>{pomoCount} pomodoros hoje</span>
        </div>

        {/* Buttons */}
        <div className={s.btns}>
          <button className={s.primary} style={{ background: color }} onClick={handleToggle}>
            {run ? <><Icon.Pause width={20} height={20} /> Pausar</> : <><Icon.Play width={20} height={20} /> {sec === modeSecs ? 'Iniciar' : 'Retomar'}</>}
          </button>
          <button className={s.secondary} onClick={handleReset}>
            <Icon.RefreshCw width={16} height={16} /> Reiniciar
          </button>
        </div>

        {/* Volume */}
        <div className={s.volumeRow}>
          <Icon.Activity width={14} height={14} style={{ color: 'var(--text-3)' }} />
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
                style={sound === snd.id ? { borderColor: color, color, background: color + '18' } : {}}
                onClick={() => handleSoundChange(snd.id)}>
                {snd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Link task */}
        {!focusTask && tasks.length > 0 && (
          <div className={s.linkSection}>
            <div className={s.sectionLabel}>Vincular tarefa</div>
            <div className={s.taskPicker}>
              {tasks.filter(t => !t.done).slice(0, 6).map(t => (
                <button key={t.id} className={s.taskPickBtn} onClick={() => setFocusTask?.(t)}>
                  <span className={[s.pickCat, s[CATEGORIES[t.cat]?.cls || 'cat-study']].join(' ')} />
                  <span className={s.pickName}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Focus log */}
        {focusLog.length > 0 && (
          <div className={s.logSection}>
            <div className={s.sectionLabel}>Histórico recente · {totalFocusMins} min totais</div>
            <div className={s.logList}>
              {focusLog.slice(0,5).map((e, i) => (
                <div key={i} className={s.logRow}>
                  <div className={[s.logCat, s[CATEGORIES[e.cat]?.cls || 'cat-study']].join(' ')} />
                  <div className={s.logInfo}>
                    <span className={s.logTask}>{e.task}</span>
                    <span className={s.logMeta}>{e.date} · {Math.round(e.duration / 60)} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
