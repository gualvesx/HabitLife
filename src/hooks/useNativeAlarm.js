/**
 * useNativeAlarm — Alarmes nativos Android via AlarmManager
 *
 * ARQUITETURA:
 * - Quando uma tarefa/hábito é criado ou editado com alerta configurado,
 *   scheduleTaskAlarms() agenda o AlarmManager nativo para disparar no
 *   horário exato — funciona com app fechado, tela bloqueada e Doze mode.
 * - O checkAlarms() a cada 30s serve apenas como fallback enquanto app aberto.
 */

// ── Acesso ao plugin nativo ───────────────────────────────────────────────────
function getPlugin() {
  // Capacitor injeta window.Capacitor.Plugins após o app carregar
  try {
    return window?.Capacitor?.Plugins?.AlarmPlugin ?? null
  } catch { return null }
}

function isNative() {
  try { return !!(window.Capacitor?.isNativePlatform?.()) } catch { return false }
}

function uid() {
  return Math.floor(Math.random() * 2_000_000_000)
}

// ── Web fallbacks ─────────────────────────────────────────────────────────────
function webVibrate() {
  try { if ('vibrate' in navigator) navigator.vibrate([400,150,400,150,800]) } catch {}
}

function webSound() {
  try {
    const a = new Audio('/alarm.mp3'); a.volume = 1.0
    a.play().catch(synthSound)
  } catch { synthSound() }
}

function synthSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const b = (f,t,d) => {
      const o=ctx.createOscillator(), g=ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.type='square'; o.frequency.value=f
      g.gain.setValueAtTime(0,t)
      g.gain.linearRampToValueAtTime(0.35,t+0.02)
      g.gain.exponentialRampToValueAtTime(0.001,t+d)
      o.start(t); o.stop(t+d+0.05)
    }
    b(880,ctx.currentTime,0.2)
    b(880,ctx.currentTime+0.3,0.2)
    b(1100,ctx.currentTime+0.6,0.35)
    b(1320,ctx.currentTime+1.0,0.5)
  } catch {}
}

function webNotify(title, body) {
  try {
    if (!('Notification' in window) || window.Notification.permission !== 'granted') return
    const opts = { body, icon: '/logo.svg', tag: 'hl-alarm', renotify: true }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(r => r.showNotification(title, opts))
        .catch(() => { try { new window.Notification(title, opts) } catch {} })
    } else { try { new window.Notification(title, opts) } catch {} }
  } catch {}
}

// ── Permissões ────────────────────────────────────────────────────────────────
export async function requestAlarmPermissions() {
  if (isNative()) {
    // 1. Permissão de notificações
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.requestPermissions()
    } catch {}

    // 2. Permissão de alarmes exatos (Android 12+)
    const plugin = getPlugin()
    if (plugin) {
      try {
        const result = await plugin.canScheduleExact()
        if (!result?.canSchedule) {
          await plugin.openAlarmSettings()
        }
      } catch {}
    }
    return true
  }

  // Web
  try {
    if ('Notification' in window && window.Notification.permission === 'default') {
      await window.Notification.requestPermission()
    }
  } catch {}
  return false
}

// ── Agenda alarme nativo no horário exato ─────────────────────────────────────
export async function scheduleAlarm(title, body, fireAt) {
  const triggerMs = new Date(fireAt).getTime()
  if (triggerMs <= Date.now()) return // já passou

  if (isNative()) {
    const plugin = getPlugin()
    if (plugin) {
      try {
        await plugin.scheduleAlarm({ alarmId: uid(), triggerMs, title, body })
        console.log(`[Alarm] scheduled "${title}" at ${new Date(triggerMs).toLocaleTimeString()}`)
        return
      } catch (e) { console.error('[Alarm] scheduleAlarm error:', e) }
    }
  }

  // Web: setTimeout (funciona apenas com app aberto)
  const delay = triggerMs - Date.now()
  if (delay > 0 && delay < 24 * 3600 * 1000) {
    setTimeout(() => { webNotify(title, body); webSound(); webVibrate() }, delay)
  }
}

// ── Dispara alarme imediatamente ──────────────────────────────────────────────
export async function fireAlarmNow(title, body) {
  if (isNative()) {
    const plugin = getPlugin()
    if (plugin) {
      try {
        await plugin.scheduleAlarm({
          alarmId: uid(),
          triggerMs: Date.now() + 300,
          title, body,
        })
        return
      } catch (e) { console.error('[Alarm] fireAlarmNow error:', e) }
    }
  }
  webNotify(title, body); webSound(); webVibrate()
}

// ── Cancela alarme ────────────────────────────────────────────────────────────
export async function cancelAlarm(alarmId) {
  if (!isNative()) return
  const plugin = getPlugin()
  if (plugin) { try { await plugin.cancelAlarm({ alarmId }) } catch {} }
}

// ── Hook React ────────────────────────────────────────────────────────────────
export function useNativeAlarm() {
  return { scheduleAlarm, fireNow: fireAlarmNow, cancelAlarm }
}

// ── Agenda alarmes para uma tarefa/hábito (chama ao criar/editar) ─────────────
// Esta é a função crítica: agenda no AlarmManager no momento do save,
// garantindo disparo mesmo com app fechado.
export async function scheduleTaskAlarms(task) {
  if (!task.alert || task.alert === 'none') return
  if (!task.time || task.time === '—') return

  const [hh, mm] = task.time.split(':').map(Number)
  const now = new Date()

  // Calcula próximo disparo com base na frequência
  const getNextFireDate = () => {
    const candidate = new Date()
    candidate.setHours(hh, mm, 0, 0)

    // Se já passou hoje, agenda para amanhã (ou próxima ocorrência)
    if (candidate <= now) candidate.setDate(candidate.getDate() + 1)

    const ft = task.frequencyType
    if (ft === 'daily' || ft === 'daily_until_done') {
      return candidate
    }
    if (ft === 'weekly') {
      const startDow = new Date(task.date + 'T12:00:00').getDay()
      while (candidate.getDay() !== startDow) {
        candidate.setDate(candidate.getDate() + 1)
      }
      return candidate
    }
    if (ft === 'monthly') {
      const startDay = new Date(task.date + 'T12:00:00').getDate()
      candidate.setDate(startDay)
      if (candidate <= now) candidate.setMonth(candidate.getMonth() + 1)
      return candidate
    }
    if (ft === 'specific_days') {
      const days = task.frequencyDays?.map(Number) || []
      if (!days.length) return null
      for (let i = 0; i < 8; i++) {
        const d = new Date(candidate)
        d.setDate(candidate.getDate() + i)
        if (days.includes(d.getDay())) {
          d.setHours(hh, mm, 0, 0)
          if (d > now) return d
        }
      }
      return null
    }
    // Tarefa única
    const taskDate = new Date(task.date + 'T'
      + String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0') + ':00')
    return taskDate > now ? taskDate : null
  }

  const fireAt = getNextFireDate()
  if (!fireAt) return

  // Lembrete antecipado
  const OFFSETS = { '15min': 900000, '30min': 1800000, '1h': 3600000, '2h': 7200000 }
  for (const r of (task.reminders || [])) {
    const remindAt = new Date(fireAt.getTime() - (OFFSETS[r] || 0))
    if (remindAt > now) {
      await scheduleAlarm(`🔔 ${task.name}`, `Começa em ${r}`, remindAt)
    }
  }

  // Alarme no horário exato
  await scheduleAlarm(`⏰ ${task.name}`, 'Hora do seu hábito/tarefa!', fireAt)
}
