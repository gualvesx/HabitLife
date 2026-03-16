/**
 * useNativeAlarm
 *
 * Android (Capacitor APK):
 *   Usa AlarmPlugin nativo (AlarmManager.setAlarmClock) — igual ao despertador
 *   do sistema. Toca mesmo com app fechado, tela bloqueada e Doze mode.
 *
 * Web:
 *   Fallback com Audio API + Web Audio + vibração + Web Notification
 */

// ── Acesso ao plugin nativo via Capacitor ────────────────────────────────────
async function getNativeAlarm() {
  try {
    const { registerPlugin, Capacitor } = await import('@capacitor/core')
    if (!Capacitor.isNativePlatform()) return null
    const plugin = registerPlugin('AlarmPlugin')
    return plugin
  } catch {
    return null
  }
}

function isNative() {
  try { return !!(window.Capacitor?.isNativePlatform?.()) } catch { return false }
}

function uid() { return Math.floor(Math.random() * 2_000_000_000) }

// ── Web fallbacks ─────────────────────────────────────────────────────────────
function webVibrate() {
  if ('vibrate' in navigator) navigator.vibrate([400,150,400,150,800])
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
    b(880,ctx.currentTime,0.2); b(880,ctx.currentTime+0.3,0.2)
    b(1100,ctx.currentTime+0.6,0.35); b(1320,ctx.currentTime+1.0,0.5)
  } catch {}
}
function webNotify(title, body) {
  if (!('Notification' in window) || window.Notification.permission !== 'granted') return
  const opts = { body, icon: '/logo.svg', tag: 'hl-alarm', renotify: true }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(r => r.showNotification(title, opts)).catch(() => {
      try { new window.Notification(title, opts) } catch {}
    })
  } else { try { new window.Notification(title, opts) } catch {} }
}

// ── Permissões ────────────────────────────────────────────────────────────────
export async function requestAlarmPermissions() {
  if (isNative()) {
    try {
      // 1. Permissão de notificações (@capacitor/local-notifications)
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      const p = await LocalNotifications.requestPermissions()

      // 2. Permissão de alarmes exatos via nosso plugin nativo
      const plugin = await getNativeAlarm()
      if (plugin) {
        const { canSchedule } = await plugin.canScheduleExact()
        if (!canSchedule) {
          // Abre configurações do sistema para o usuário permitir alarmes
          await plugin.openAlarmSettings()
        }
      }
      return p.display === 'granted'
    } catch (e) {
      console.warn('requestAlarmPermissions:', e)
      return false
    }
  }

  // Web
  if (typeof window !== 'undefined' && 'Notification' in window
      && window.Notification.permission === 'default') {
    try { return (await window.Notification.requestPermission()) === 'granted' }
    catch { return false }
  }
  return false
}

// ── Agenda alarme usando AlarmManager nativo (despertador do sistema) ─────────
export async function scheduleAlarm(title, body, fireAt = new Date()) {
  const when = new Date(fireAt)
  const triggerMs = when.getTime()

  if (isNative()) {
    const plugin = await getNativeAlarm()
    if (plugin) {
      try {
        await plugin.scheduleAlarm({
          alarmId:   uid(),
          triggerMs,
          title,
          body,
        })
        return
      } catch (e) {
        console.error('scheduleAlarm native error:', e)
      }
    }
  }

  // Web fallback
  const delay = Math.max(0, triggerMs - Date.now())
  setTimeout(() => { webNotify(title, body); webSound(); webVibrate() }, delay)
}

// ── Dispara alarme imediatamente ──────────────────────────────────────────────
export async function fireAlarmNow(title, body) {
  if (isNative()) {
    const plugin = await getNativeAlarm()
    if (plugin) {
      try {
        await plugin.scheduleAlarm({
          alarmId:   uid(),
          triggerMs: Date.now() + 500,
          title,
          body,
        })
        return
      } catch (e) { console.error('fireAlarmNow:', e) }
    }
  }
  webNotify(title, body); webSound(); webVibrate()
}

// ── Cancela alarme por ID ─────────────────────────────────────────────────────
export async function cancelAlarm(alarmId) {
  if (!isNative()) return
  const plugin = await getNativeAlarm()
  if (plugin) { try { await plugin.cancelAlarm({ alarmId }) } catch {} }
}

// ── Hook React ────────────────────────────────────────────────────────────────
export function useNativeAlarm() {
  return { scheduleAlarm, fireNow: fireAlarmNow, cancelAlarm }
}

// ── Agenda lembretes de tarefa/hábito ─────────────────────────────────────────
export async function scheduleTaskNotifications(task) {
  if (!task.alert || task.alert === 'none') return
  if (!task.time || task.time === '—') return

  const [hh, mm] = task.time.split(':').map(Number)
  const base = new Date(task.date + 'T'
    + String(hh).padStart(2,'0') + ':'
    + String(mm).padStart(2,'0') + ':00')

  // Lembrete antecipado
  const OFFSETS = { '15min':900000,'30min':1800000,'1h':3600000,'2h':7200000 }
  for (const r of (task.reminders || [])) {
    const fireAt = new Date(base.getTime() - (OFFSETS[r] || 0))
    if (fireAt > new Date()) {
      await scheduleAlarm(`⏰ ${task.name}`, `Lembrete: em ${r}`, fireAt)
    }
  }

  // Alarme no horário exato
  if (base > new Date()) {
    await scheduleAlarm(`⏰ ${task.name}`, 'Hora do seu hábito/tarefa!', base)
  }
}
