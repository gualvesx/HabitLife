/**
 * useNativeAlarm
 *
 * Android (Capacitor APK):
 *   • Usa @capacitor/local-notifications com canal "habitlife_alarm"
 *   • Canal configurado com USAGE_ALARM + bypassDnd = toca mesmo com app fechado,
 *     tela bloqueada e modo não perturbe
 *   • Requer permissão SCHEDULE_EXACT_ALARM (Android 12+)
 *
 * Web:
 *   • Fallback com Audio API + Web Audio synthesis + vibração
 */

let _Capacitor = null
let _LN        = null

async function loadCap() {
  if (_Capacitor) return { Capacitor: _Capacitor, LN: _LN }
  try {
    const { Capacitor }          = await import('@capacitor/core')
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    _Capacitor = Capacitor
    _LN        = LocalNotifications
  } catch {
    _Capacitor = { isNativePlatform: () => false }
    _LN        = null
  }
  return { Capacitor: _Capacitor, LN: _LN }
}

function uniqueId() { return Math.floor(Math.random() * 2_000_000_000) }

// ── Web fallbacks ───────────────────────────────────────────────────────────
function _webVibrate() {
  if ('vibrate' in navigator) navigator.vibrate([400, 150, 400, 150, 800])
}

function _webSound() {
  try {
    const a = new Audio('/alarm.mp3')
    a.volume = 1.0
    a.play().catch(_synthSound)
  } catch { _synthSound() }
}

function _synthSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const beep = (f, t, d) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.type = 'square'; o.frequency.value = f
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.35, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, t + d)
      o.start(t); o.stop(t + d + 0.05)
    }
    beep(880,  ctx.currentTime,       0.2)
    beep(880,  ctx.currentTime + 0.3, 0.2)
    beep(1100, ctx.currentTime + 0.6, 0.35)
    beep(1320, ctx.currentTime + 1.0, 0.5)
  } catch {}
}

function _webNotify(title, body) {
  if (!('Notification' in window)) return
  if (window.Notification.permission !== 'granted') return
  const opts = { body, icon: '/logo.svg', tag: 'hl-alarm', renotify: true }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(r => r.showNotification(title, opts))
      .catch(() => { try { new window.Notification(title, opts) } catch {} })
  } else {
    try { new window.Notification(title, opts) } catch {}
  }
}

// ── Solicita permissões (chama no mount do AppShell) ───────────────────────
export async function requestAlarmPermissions() {
  const { Capacitor, LN } = await loadCap()

  if (Capacitor.isNativePlatform() && LN) {
    try {
      // Notificações gerais
      const p = await LN.requestPermissions()
      if (p.display !== 'granted') return false

      // Android 12+: permissão para alarmes exatos
      // Isso redireciona o usuário para as configurações do app se necessário
      if (typeof LN.checkExactNotificationSetting === 'function') {
        await LN.checkExactNotificationSetting()
      }
      return true
    } catch (e) {
      console.warn('requestAlarmPermissions error:', e)
      return false
    }
  }

  // Web
  if (typeof window !== 'undefined' && 'Notification' in window &&
      window.Notification.permission === 'default') {
    try {
      const r = await window.Notification.requestPermission()
      return r === 'granted'
    } catch { return false }
  }
  return false
}

// ── Agenda alarme para um horário específico ───────────────────────────────
export async function scheduleAlarm(title, body, fireAt = new Date(), sound = 'alarm') {
  const { Capacitor, LN } = await loadCap()
  const when = new Date(fireAt)

  if (Capacitor.isNativePlatform() && LN) {
    try {
      const perm = await LN.requestPermissions()
      if (perm.display !== 'granted') {
        // sem permissão, faz fallback de som local se o app estiver aberto
        _webSound(); _webVibrate()
        return
      }

      await LN.schedule({
        notifications: [{
          id:           uniqueId(),
          title,
          body,
          schedule: {
            at:            when,
            allowWhileIdle: true,   // dispara mesmo com Doze mode ativo
          },
          sound,                    // corresponde a android/app/src/main/res/raw/alarm.mp3
          channelId:    'habitlife_alarm',   // canal IMPORTANCE_HIGH + USAGE_ALARM
          iconColor:    '#7c3aed',
          smallIcon:    'ic_stat_icon_config_sample',
          actionTypeId: '',
          extra:        null,
          ongoing:      false,
          autoCancel:   true,
        }]
      })
    } catch (err) {
      console.error('scheduleAlarm native error:', err)
      _webSound(); _webVibrate()
    }
  } else {
    // Web: agenda via setTimeout se for futuro, ou dispara imediatamente
    const delay = Math.max(0, when.getTime() - Date.now())
    setTimeout(() => {
      _webNotify(title, body)
      _webSound()
      _webVibrate()
    }, delay)
  }
}

// ── Dispara imediatamente (timer concluído, teste, etc.) ───────────────────
export async function fireAlarmNow(title, body) {
  const { Capacitor, LN } = await loadCap()

  if (Capacitor.isNativePlatform() && LN) {
    try {
      await LN.schedule({
        notifications: [{
          id:           uniqueId(),
          title,
          body,
          schedule:     { at: new Date(Date.now() + 300), allowWhileIdle: true },
          sound:        'alarm',
          channelId:    'habitlife_alarm',
          iconColor:    '#7c3aed',
          smallIcon:    'ic_stat_icon_config_sample',
          actionTypeId: '',
          extra:        null,
          autoCancel:   true,
        }]
      })
    } catch {
      _webSound(); _webVibrate()
    }
  } else {
    _webNotify(title, body)
    _webSound()
    _webVibrate()
  }
}

// ── Cancela todos os alarmes pendentes ─────────────────────────────────────
export async function cancelAllAlarms() {
  const { Capacitor, LN } = await loadCap()
  if (!Capacitor.isNativePlatform() || !LN) return
  try {
    const { notifications } = await LN.getPending()
    if (notifications?.length) await LN.cancel({ notifications })
  } catch {}
}

// ── Hook React ─────────────────────────────────────────────────────────────
export function useNativeAlarm() {
  return {
    scheduleAlarm,
    fireNow: fireAlarmNow,
    cancelAll: cancelAllAlarms,
  }
}

// ── Agenda notificações de lembrete de tarefas ─────────────────────────────
export async function scheduleTaskNotifications(task) {
  if (!task.reminders?.length && (!task.alert || task.alert === 'none')) return

  const { Capacitor, LN } = await loadCap()
  const isNative = Capacitor.isNativePlatform() && !!LN

  // Lembretes com offset de horário
  if (task.time && task.time !== '—' && task.reminders?.length) {
    const OFFSETS = { '15min': 900000, '30min': 1800000, '1h': 3600000, '2h': 7200000, '4h': 14400000, '1d': 86400000 }
    const [hh, mm] = task.time.split(':').map(Number)
    const base = new Date(task.date + 'T' + String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0') + ':00')

    for (const r of task.reminders) {
      const fireAt = new Date(base.getTime() - (OFFSETS[r] || 0))
      if (fireAt > new Date()) {
        await scheduleAlarm(`⏰ ${task.name}`, `Lembrete: em ${r}`, fireAt)
      }
    }
  }

  // Alarme direto no horário da tarefa
  if (task.time && task.time !== '—' && task.alert && task.alert !== 'none') {
    const [hh, mm] = task.time.split(':').map(Number)
    const fireAt = new Date(task.date + 'T' + String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0') + ':00')
    if (fireAt > new Date()) {
      const isAlarm = task.alert === 'alarm' || task.alert === 'both'
      await scheduleAlarm(
        `⏰ ${task.name}`,
        'Hora da sua tarefa!',
        fireAt,
        isAlarm ? 'alarm' : undefined
      )
    }
  }
}
