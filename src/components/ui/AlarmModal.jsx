import { useEffect, useRef } from 'react'
import s from './AlarmModal.module.css'

export function AlarmModal({ task, onDismiss, onSnooze }) {
  const audioRef = useRef(null)
  const pulseRef = useRef(null)

  useEffect(() => {
    if (!task) return

    // Play alarm on loop
    const audio = new Audio('/alarm.mp3')
    audio.loop = true
    audio.volume = 1.0
    audioRef.current = audio
    audio.play().catch(() => {
      // Web Audio synthesis fallback
      _playSynthLoop()
    })

    // Vibrate pattern on mobile
    if ('vibrate' in navigator) {
      pulseRef.current = setInterval(() => {
        navigator.vibrate([400, 200, 400])
      }, 1200)
    }

    return () => {
      audio.pause()
      audio.currentTime = 0
      if (pulseRef.current) clearInterval(pulseRef.current)
      if ('vibrate' in navigator) navigator.vibrate(0)
    }
  }, [task])

  const stop = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    if (pulseRef.current) clearInterval(pulseRef.current)
    if ('vibrate' in navigator) navigator.vibrate(0)
    onDismiss()
  }

  const snooze = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 }
    if (pulseRef.current) clearInterval(pulseRef.current)
    if ('vibrate' in navigator) navigator.vibrate(0)
    onSnooze(task)
  }

  if (!task) return null

  return (
    <div className={s.overlay}>
      <div className={s.modal}>

        {/* Pulsing ring */}
        <div className={s.ringWrap}>
          <div className={s.ring} />
          <div className={s.ring2} />
          <div className={s.bellWrap}>
            <svg className={s.bell} width="36" height="36" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
        </div>

        <div className={s.label}>Alarme</div>
        <div className={s.taskName}>{task.name}</div>

        {task.time && task.time !== '—' && (
          <div className={s.time}>{task.time}</div>
        )}

        {task.cat && (
          <div className={s.cat}>{task.cat}</div>
        )}

        <div className={s.buttons}>
          <button className={s.snoozeBtn} onClick={snooze}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="13" r="8"/>
              <path d="M12 9v4l2 2"/>
              <path d="M5 3 2 6M22 6l-3-3"/>
            </svg>
            Soneca (5 min)
          </button>
          <button className={s.dismissBtn} onClick={stop}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Desligar
          </button>
        </div>

      </div>
    </div>
  )
}

// Web Audio synthesis loop as fallback
let _synthCtx = null
let _synthNodes = []
function _playSynthLoop() {
  try {
    _synthCtx = new (window.AudioContext || window.webkitAudioContext)()
    const play = () => {
      const freqs = [880, 1100, 1320]
      freqs.forEach((freq, i) => {
        const o = _synthCtx.createOscillator()
        const g = _synthCtx.createGain()
        o.connect(g); g.connect(_synthCtx.destination)
        o.type = 'square'; o.frequency.value = freq
        const t = _synthCtx.currentTime + i * 0.3
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.3, t + 0.02)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
        o.start(t); o.stop(t + 0.3)
        _synthNodes.push(o)
      })
    }
    play()
    const id = setInterval(play, 1400)
    _synthNodes.push({ stop: () => clearInterval(id) })
  } catch(e) {}
}
