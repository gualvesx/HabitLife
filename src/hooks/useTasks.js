import { useState, useEffect, useCallback } from 'react'
import { scheduleTaskAlarms } from './useNativeAlarm'
import { supabase } from '../utils/supabase'

// ── DB row ↔ app task ──────────────────────────────────────────────────────
const fromDB = row => ({
  id:             row.id,
  name:           row.name,
  cat:            row.category,
  date:           row.date,
  time:           row.time || '—',
  done:           row.is_done,
  desc:           row.description || '',
  priority:       row.priority      ?? 2,
  frequencyType:  row.frequency_type ?? 'none',
  frequencyDays:  (() => { try { return JSON.parse(row.frequency_days||'[]') } catch { return [] } })(),
  frequencyInterval: row.frequency_interval ?? 1,
  goalValue:      row.goal_value    ?? 0,
  currentValue:   row.current_value ?? 0,
  goalUnit:       row.goal_unit     ?? '',
  goalStep:       row.goal_step     ?? 1,
  project:        row.project       ?? '',
  subtasks:       (() => { try { return JSON.parse(row.subtasks||'[]') } catch { return [] } })(),
  reminders:      (() => { try { return JSON.parse(row.reminders||'[]') } catch { return [] } })(),
  alert:          row.alert         ?? 'none',
  xpValue:        row.xp_value      ?? 10,
  endDate:        row.end_date      ?? '',
})

const toDB = (task, userId) => {
  const cleanDays = Array.isArray(task.frequencyDays)
    ? task.frequencyDays.map(Number).filter(d => !isNaN(d))
    : []
  return {
    user_id:            userId,
    name:               task.name || 'Sem nome',
    category:           task.cat  || 'activity',
    date:               task.date,
    end_date:           task.endDate || null,
    time:               (task.time === '—' || !task.time) ? null : task.time,
    is_done:            task.done ?? false,
    description:        task.desc || null,
    priority:           Number(task.priority)          || 2,
    frequency_type:     task.frequencyType             || 'none',
    frequency_days:     JSON.stringify(cleanDays),
    frequency_interval: Number(task.frequencyInterval) || 1,
    goal_value:         Number(task.goalValue)         || 0,
    current_value:      Number(task.currentValue)      || 0,
    goal_step:          Number(task.goalStep)           || 1,
    goal_unit:          task.goalUnit  || '',
    project:            task.project   || '',
    subtasks:           JSON.stringify(Array.isArray(task.subtasks)  ? task.subtasks  : []),
    reminders:          JSON.stringify(Array.isArray(task.reminders) ? task.reminders : []),
    alert:              task.alert     || 'none',
    xp_value:           Number(task.xpValue) || 10,
  }
}

// ── XP & Gamification ──────────────────────────────────────────────────────
const XP_KEY     = 'hl_xp'
const STREAK_KEY = 'hl_streak'
const COINS_KEY  = 'hl_coins'
const BADGES_KEY = 'hl_badges'
const FREEZES_KEY = 'hl_freezes'

export function getXPData() {
  try {
    return {
      xp:         parseInt(localStorage.getItem(XP_KEY)    || '0'),
      bestStreak: parseInt(localStorage.getItem(STREAK_KEY)|| '0'),
      coins:      parseInt(localStorage.getItem(COINS_KEY) || '0'),
      freezes:    parseInt(localStorage.getItem(FREEZES_KEY)|| '0'),
    }
  } catch { return { xp: 0, bestStreak: 0, coins: 0, freezes: 0 } }
}
export function addXP(amount) {
  try {
    const cur = parseInt(localStorage.getItem(XP_KEY) || '0')
    localStorage.setItem(XP_KEY, String(cur + amount))
  } catch {}
}
export function addCoins(amount) {
  try {
    const cur = parseInt(localStorage.getItem(COINS_KEY) || '0')
    localStorage.setItem(COINS_KEY, String(Math.max(0, cur + amount)))
  } catch {}
}
export function addFreezes(n) {
  try {
    const cur = parseInt(localStorage.getItem(FREEZES_KEY) || '0')
    localStorage.setItem(FREEZES_KEY, String(Math.max(0, cur + n)))
  } catch {}
}
export function updateBestStreak(streak) {
  try {
    const best = parseInt(localStorage.getItem(STREAK_KEY) || '0')
    if (streak > best) localStorage.setItem(STREAK_KEY, String(streak))
  } catch {}
}
export function getLevelFromXP(xp) {
  const level = Math.floor(Math.pow(xp / 100, 0.6)) + 1
  const xpForLevel = n => Math.round(100 * Math.pow(n - 1, 1 / 0.6))
  const cur  = xpForLevel(level)
  const next = xpForLevel(level + 1)
  return { level, progress: xp - cur, needed: next - cur, xp }
}

// ── Badges / Conquistas ───────────────────────────────────────────────────
export const ALL_BADGES = [
  { id: 'first_task',     label: '🥇 Primeira Tarefa',      desc: 'Complete sua primeira tarefa',          check: (stats) => stats.totalDone >= 1 },
  { id: 'streak_7',       label: '🔥 Semana de Fogo',        desc: '7 dias de streak consecutivos',         check: (stats) => stats.streak >= 7 },
  { id: 'streak_30',      label: '💎 Mês Inquebrável',       desc: '30 dias de streak consecutivos',        check: (stats) => stats.streak >= 30 },
  { id: 'century',        label: '💯 Centenário',            desc: 'Complete 100 tarefas',                  check: (stats) => stats.totalDone >= 100 },
  { id: 'level_10',       label: '⚡ Nível 10',              desc: 'Alcance o nível 10',                   check: (stats) => stats.level >= 10 },
  { id: 'focus_60',       label: '🎯 Foco Profundo',         desc: '60 minutos de foco em um dia',          check: (stats) => stats.todayFocusMins >= 60 },
  { id: 'early_bird',     label: '🌅 Madrugador',            desc: 'Conclua 5 tarefas antes das 8h',        check: (stats) => stats.earlyTasks >= 5 },
  { id: 'polymath',       label: '🧠 Polimathe',             desc: 'Use 5 métodos de estudo diferentes',    check: (stats) => stats.uniqueMethods >= 5 },
  { id: 'perfect_week',   label: '🌟 Semana Perfeita',       desc: '100% de conclusão em 7 dias',           check: (stats) => stats.perfectDays >= 7 },
  { id: 'quantifier',     label: '📊 Quantificador',         desc: 'Complete 10 tarefas com meta numérica', check: (stats) => stats.quantDone >= 10 },
  { id: 'multitasker',    label: '⚡ Multitarefa',           desc: 'Complete 5 tarefas em um dia',          check: (stats) => stats.maxDayDone >= 5 },
  { id: 'consistent',     label: '📅 Consistente',           desc: 'Complete tarefas por 3 semanas seguidas', check: (stats) => stats.streak >= 21 },
]

export function getBadges() {
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]') } catch { return [] }
}

export function checkAndAwardBadges(stats) {
  const earned = getBadges()
  const newOnes = []
  for (const badge of ALL_BADGES) {
    if (!earned.includes(badge.id) && badge.check(stats)) {
      earned.push(badge.id)
      newOnes.push(badge)
    }
  }
  if (newOnes.length > 0) {
    localStorage.setItem(BADGES_KEY, JSON.stringify(earned))
  }
  return newOnes
}

// ── Focus log ──────────────────────────────────────────────────────────────
const FOCUS_KEY = 'hl_focus_log'
export function getFocusLog() {
  try { return JSON.parse(localStorage.getItem(FOCUS_KEY) || '[]') } catch { return [] }
}
export function addFocusEntry(entry) {
  try {
    const log = getFocusLog()
    log.unshift({ ...entry, ts: Date.now() })
    localStorage.setItem(FOCUS_KEY, JSON.stringify(log.slice(0, 200)))
  } catch {}
}

// ── Push notifications ─────────────────────────────────────────────────────
export async function requestNotifPermission() {
  if (!('Notification' in window)) return 'not_supported'
  if ((window.Notification?.permission ?? 'not_supported') === 'granted') return 'granted'
  if ((window.Notification?.permission ?? 'not_supported') === 'denied')  return 'denied'
  const result = await window.Notification.requestPermission()
  return result
}

// Play alarm sound — tries MP3 file first, falls back to Web Audio API
export function playAlarmSound() {
  // 1. Try playing the actual alarm.mp3 file
  try {
    const audio = new Audio('/alarm.mp3')
    audio.volume = 1.0
    const playPromise = audio.play()
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay blocked — fall back to Web Audio API synthesis
        _playAlarmSynthesis()
      })
    }
  } catch(e) {
    _playAlarmSynthesis()
  }
  // 2. Vibrate on mobile regardless
  if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 500])
}

function _playAlarmSynthesis() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const play = (freq, start, dur) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.type = 'square'; o.frequency.value = freq
      g.gain.setValueAtTime(0, ctx.currentTime + start)
      g.gain.linearRampToValueAtTime(0.35, ctx.currentTime + start + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur)
      o.start(ctx.currentTime + start)
      o.stop(ctx.currentTime + start + dur + 0.05)
    }
    play(880,  0,    0.2)
    play(880,  0.3,  0.2)
    play(1100, 0.6,  0.35)
    play(1100, 0.98, 0.35)
    play(1320, 1.4,  0.5)
  } catch(e) { console.warn('Audio synthesis failed:', e) }
}

// Show system notification via SW or fallback
export function fireSystemNotification(title, body) {
  if (!('Notification' in window)) return
  if ((window.Notification?.permission ?? 'not_supported') !== 'granted') return
  const opts = { body, icon: '/logo.svg', badge: '/logo.svg', tag: 'habitlife-task', renotify: true }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(reg => reg.showNotification(title, opts))
      .catch(() => { try { new window.Notification(title, opts) } catch {} })
  } else {
    try { new window.Notification(title, opts) } catch {}
  }
}

export function scheduleNotification(title, body, delayMs, alertType = 'both') {
  if ((window.Notification?.permission ?? 'not_supported') !== 'granted') return
  setTimeout(() => {
    if (alertType === 'system' || alertType === 'both') fireSystemNotification(title, body)
    if (alertType === 'alarm'  || alertType === 'both') playAlarmSound(alertType)
  }, delayMs)
}

export function scheduleTaskReminders(task) {
  if (!task.reminders || task.reminders.length === 0) return
  if ((window.Notification?.permission ?? 'not_supported') !== 'granted') return
  const OFFSETS = { '15min': 15*60000, '30min': 30*60000, '1h': 3600000, '2h': 7200000, '4h': 14400000, '1d': 86400000 }
  if (!task.time || task.time === '—') return
  const [hh, mm] = task.time.split(':').map(Number)
  const taskDate = new Date(task.date + 'T' + String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0') + ':00')
  task.reminders.forEach(r => {
    const offset = OFFSETS[r] || 0
    const fireAt = taskDate.getTime() - offset
    const delay  = fireAt - Date.now()
    if (delay > 0 && delay < 24 * 3600 * 1000) {
      scheduleNotification(`⏰ ${task.name}`, `Lembrete: tarefa em ${r}`, delay, task.alert || 'both')
    }
  })
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useTasks(userId) {
  const [tasks,       setTasks]       = useState([])
  const [taskLoading, setTaskLoading] = useState(false)

  const fetchTasks = useCallback(async () => {
    if (!userId) return
    setTaskLoading(true)
    const { data, error } = await supabase
      .from('tasks').select('*').eq('user_id', userId).order('date', { ascending: true })
    if (!error && data) setTasks(data.map(fromDB))
    setTaskLoading(false)
  }, [userId])

  useEffect(() => {
    if (!userId) { setTasks([]); return }
    fetchTasks()
    const ch = supabase.channel(`tasks:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, p => {
        if      (p.eventType === 'INSERT') setTasks(prev => [...prev, fromDB(p.new)])
        else if (p.eventType === 'UPDATE') setTasks(prev => prev.map(t => t.id === p.new.id ? fromDB(p.new) : t))
        else if (p.eventType === 'DELETE') setTasks(prev => prev.filter(t => t.id !== p.old.id))
      }).subscribe()
    return () => supabase.removeChannel(ch)
  }, [userId, fetchTasks])

  const addTask = useCallback(async task => {
    if (!userId) return
    const { data, error } = await supabase.from('tasks').insert(toDB(task, userId)).select().single()
    if (!error && data) {
      const newTask = fromDB(data)
      setTasks(prev => [...prev, newTask])
      scheduleTaskAlarms(newTask).catch(() => {})
    }
  }, [userId])

  const toggleTask = useCallback(async id => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    // Quantitative: increment by step
    if (task.goalValue > 0 && !task.done) {
      const step   = task.goalStep || 1
      const newVal = Math.min(task.currentValue + step, task.goalValue)
      const isDone = newVal >= task.goalValue
      const { data, error } = await supabase.from('tasks')
        .update({ current_value: newVal, is_done: isDone }).eq('id', id).eq('user_id', userId).select().single()
      if (!error && data) {
        setTasks(prev => prev.map(t => t.id === id ? fromDB(data) : t))
        if (isDone) { addXP(task.xpValue || 20) }
      }
      return
    }
    const newDone = !task.done
    const { data, error } = await supabase.from('tasks')
      .update({ is_done: newDone }).eq('id', id).eq('user_id', userId).select().single()
    if (!error && data) {
      setTasks(prev => prev.map(t => t.id === id ? fromDB(data) : t))
      if (newDone) { addXP(task.xpValue || 10) }
    }
  }, [tasks, userId])

  const updateTaskValue = useCallback(async (id, newVal) => {
    const task = tasks.find(t => t.id === id); if (!task) return
    const isDone = newVal >= (task.goalValue || 1)
    const { data, error } = await supabase.from('tasks')
      .update({ current_value: newVal, is_done: isDone }).eq('id', id).eq('user_id', userId).select().single()
    if (!error && data) {
      setTasks(prev => prev.map(t => t.id === id ? fromDB(data) : t))
      if (isDone) { addXP(task.xpValue || 20) }
    }
  }, [tasks, userId])

  const updateSubtasks = useCallback(async (id, subtasks) => {
    const { data, error } = await supabase.from('tasks')
      .update({ subtasks: JSON.stringify(subtasks) }).eq('id', id).eq('user_id', userId).select().single()
    if (!error && data) setTasks(prev => prev.map(t => t.id === id ? fromDB(data) : t))
  }, [userId])

  // updateTask accepts either updateTask(taskObj) or updateTask(id, updates)
  const updateTask = useCallback(async (taskOrId, updates) => {
    let id, merged
    if (typeof taskOrId === 'string') {
      // called as updateTask(id, updates)
      const existing = tasks.find(t => t.id === taskOrId)
      id = taskOrId
      merged = { ...(existing || {}), ...updates }
    } else {
      // called as updateTask(taskObj) — id is inside the object
      id = taskOrId.id
      merged = taskOrId
    }
    if (!id) return
    const { data, error } = await supabase.from('tasks')
      .update(toDB(merged, userId)).eq('id', id).eq('user_id', userId).select().single()
    if (!error && data) setTasks(prev => prev.map(t => t.id === id ? fromDB(data) : t))
    return { data, error }
  }, [tasks, userId])

  const deleteTask = useCallback(async id => {
    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId)
    if (!error) setTasks(prev => prev.filter(t => t.id !== id))
  }, [userId])

  const clearAll = useCallback(async () => {
    const { error } = await supabase.from('tasks').delete().eq('user_id', userId)
    if (!error) setTasks([])
  }, [userId])

  return { tasks, taskLoading, addTask, updateTask, toggleTask, updateTaskValue, updateSubtasks, deleteTask, clearAll }
}
