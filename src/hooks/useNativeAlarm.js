/**
 * useNativeAlarm — agendamento de alarmes e notificações
 *
 * • Na plataforma nativa (Android/iOS via Capacitor):
 *   usa @capacitor/local-notifications → toca mesmo com app fechado
 *
 * • Na web (navegador):
 *   usa Web Notification API + Web Audio API + vibração
 *   (fallback igual ao comportamento atual)
 */

let _Capacitor = null
let _LocalNotifications = null

// Importação dinâmica para não quebrar no build web
async function loadCapacitor() {
  if (_Capacitor) return { Capacitor: _Capacitor, LocalNotifications: _LocalNotifications }
  try {
    const core  = await import('@capacitor/core')
    const notif = await import('@capacitor/local-notifications')
    _Capacitor           = core.Capacitor
    _LocalNotifications  = notif.LocalNotifications
  } catch {
    _Capacitor = { isNativePlatform: () => false }
    _LocalNotifications = null
  }
  return { Capacitor: _Capacitor, LocalNotifications: _LocalNotifications }
}

// ── Web fallback: play alarm.mp3 + synthesis + vibrate ─────────────────────
function _webAlarm() {
  // Try MP3
  try {
    const audio = new Audio('/alarm.mp3')
    audio.volume = 1.0
    audio.play().catch(() => _synthAlarm())
  } catch { _synthAlarm() }
  // Vibrate
  if ('vibrate' in navigator) navigator.vibrate([400, 150, 400, 150, 600])
}

function _synthAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const play = (freq, t0, dur) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.type = 'square'; o.frequency.value = freq
      g.gain.setValueAtTime(0, t0)
      g.gain.linearRampToValueAtTime(0.35, t0 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
      o.start(t0); o.stop(t0 + dur + 0.05)
    }
    play(880,  ctx.currentTime,        0.2)
    play(880,  ctx.currentTime + 0.3,  0.2)
    play(1100, ctx.currentTime + 0.6,  0.35)
    play(1320, ctx.currentTime + 1.05, 0.5)
  } catch {}
}

function _webNotification(title, body) {
  if (!('Notification' in window)) return
  if ((window.Notification?.permission ?? 'not_supported') !== 'granted') return
  const opts = { body, icon: '/logo.svg', badge: '/logo.svg', tag: 'habitlife-alarm', renotify: true }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(reg => reg.showNotification(title, opts))
      .catch(() => { try { new window.Notification(title, opts) } catch {} })
  } else {
    try { new window.Notification(title, opts) } catch {}
  }
}

// ── Main hook ───────────────────────────────────────────────────────────────
export function useNativeAlarm() {

  /**
   * scheduleAlarm — agenda alarme para um horário específico
   * @param {string} title
   * @param {string} body
   * @param {Date|number} date  — quando disparar (Date ou ms timestamp)
   * @param {string} sound      — nome do arquivo (sem path) ex: 'alarm.mp3'
   */
  const scheduleAlarm = async (title, body, date = Date.now(), sound = 'alarm.mp3') => {
    const { Capacitor, LocalNotifications } = await loadCapacitor()

    if (Capacitor.isNativePlatform() && LocalNotifications) {
      // ── Nativo: Android / iOS ────────────────────────────────────────────
      try {
        const perm = await LocalNotifications.requestPermissions()
        if (perm.display !== 'granted') {
          // Fall back to web if permission denied
          _webNotification(title, body)
          _webAlarm()
          return
        }
        await LocalNotifications.schedule({
          notifications: [{
            id:           Math.floor(Math.random() * 1_000_000),
            title,
            body,
            schedule:     { at: new Date(date) },
            sound,                  // arquivo deve estar em android/app/src/main/res/raw/
            smallIcon:    'ic_stat_icon_config_sample',
            iconColor:    '#7c3aed',
            actionTypeId: '',
            extra:        null,
          }]
        })
      } catch (err) {
        console.error('Erro ao agendar alarme nativo:', err)
        _webNotification(title, body)
        _webAlarm()
      }
    } else {
      // ── Web fallback ─────────────────────────────────────────────────────
      const delay = Math.max(0, new Date(date).getTime() - Date.now())
      if (delay === 0) {
        _webNotification(title, body)
        _webAlarm()
      } else {
        setTimeout(() => {
          _webNotification(title, body)
          _webAlarm()
        }, delay)
      }
    }
  }

  /**
   * fireNow — dispara alarme imediatamente (usado no fim do timer, teste, etc.)
   */
  const fireNow = (title, body) => scheduleAlarm(title, body, Date.now())

  /**
   * cancelAll — cancela todos os alarmes agendados (nativo)
   */
  const cancelAll = async () => {
    const { Capacitor, LocalNotifications } = await loadCapacitor()
    if (Capacitor.isNativePlatform() && LocalNotifications) {
      try {
        const pending = await LocalNotifications.getPending()
        if (pending.notifications?.length) {
          await LocalNotifications.cancel({ notifications: pending.notifications })
        }
      } catch {}
    }
  }

  return { scheduleAlarm, fireNow, cancelAll }
}

// ── Standalone function (usável fora de componentes React) ─────────────────
export async function scheduleTaskNotifications(task) {
  if (!task.reminders?.length && (!task.alert || task.alert === 'none')) return

  const { Capacitor, LocalNotifications } = await loadCapacitor()
  const isNative = Capacitor.isNativePlatform() && !!LocalNotifications

  const fireAt_list = []

  // Reminders (time-offset based)
  const OFFSETS = { '15min': 15*60000, '30min': 30*60000, '1h': 3600000, '2h': 7200000, '4h': 14400000, '1d': 86400000 }
  if (task.time && task.time !== '—' && task.reminders?.length) {
    const [hh, mm] = task.time.split(':').map(Number)
    const base = new Date(task.date + 'T' + String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0') + ':00')
    task.reminders.forEach(r => {
      const fireAt = new Date(base.getTime() - (OFFSETS[r] || 0))
      if (fireAt > new Date()) fireAt_list.push({ fireAt, label: r })
    })
  }

  // Direct time alarm (when task has a time set and alert !== 'none')
  if (task.time && task.time !== '—' && task.alert && task.alert !== 'none') {
    const [hh, mm] = task.time.split(':').map(Number)
    const fireAt = new Date(task.date + 'T' + String(hh).padStart(2,'0') + ':' + String(mm).padStart(2,'0') + ':00')
    if (fireAt > new Date()) fireAt_list.push({ fireAt, label: null })
  }

  if (fireAt_list.length === 0) return

  if (isNative) {
    try {
      const perm = await LocalNotifications.requestPermissions()
      if (perm.display !== 'granted') return
      await LocalNotifications.schedule({
        notifications: fireAt_list.map(({ fireAt, label }) => ({
          id:       Math.floor(Math.random() * 1_000_000),
          title:    `⏰ ${task.name}`,
          body:     label ? `Lembrete: tarefa em ${label}` : 'Hora da sua tarefa!',
          schedule: { at: fireAt },
          sound:    'alarm.mp3',
          iconColor:'#7c3aed',
          actionTypeId: '',
          extra:    null,
        }))
      })
    } catch (err) { console.error('scheduleTaskNotifications error:', err) }
  } else {
    // Web: schedule via setTimeout (works while tab is open)
    fireAt_list.forEach(({ fireAt, label }) => {
      const delay = fireAt.getTime() - Date.now()
      if (delay > 0 && delay < 24 * 3600 * 1000) {
        setTimeout(() => {
          _webNotification(`⏰ ${task.name}`, label ? `Lembrete: tarefa em ${label}` : 'Hora da sua tarefa!')
          if (task.alert === 'alarm' || task.alert === 'both') _webAlarm()
        }, delay)
      }
    })
  }
}
