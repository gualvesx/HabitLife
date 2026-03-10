import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../utils/supabase'

const fromDB = row => ({
  id:      row.id,
  type:    row.type,
  title:   row.title,
  message: row.message || '',
  ts:      new Date(row.created_at).getTime(),
  read:    row.is_read,
})

// ── Local alert: sound + vibration based on user prefs ───────────────────
const playAlert = (prefs = {}) => {
  if (prefs.sound !== false) {
    // Use Web Audio API to generate a gentle chime — no audio file needed
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12)
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + i * 0.12 + 0.05)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + i * 0.12 + 0.4)
      })
    } catch {}
  }
  if (prefs.vibr !== false && 'vibrate' in navigator) {
    navigator.vibrate([200, 100, 200])
  }
}

// ── Show system notification (works even with app open) ──────────────────
const showSystemNotif = (title, message, url = '/') => {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  // Use SW registration if available (better on mobile)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body:     message,
        icon:     '/logo.svg',
        badge:    '/logo.svg',
        vibrate:  [200, 100, 200],
        tag:      'habitlife-notif',
        renotify: true,
        data:     { url },
      })
    }).catch(() => {
      // Fallback to basic Notification API
      new Notification(title, { body: message, icon: '/logo.svg' })
    })
  } else {
    new Notification(title, { body: message, icon: '/logo.svg' })
  }
}

export function useNotifs(userId) {
  const [notifs,  setNotifs]  = useState([])
  const channelRef = useRef(null)

  // ── Fetch ───────────────────────────────────────────────────────────────
  const fetchNotifs = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error && data) setNotifs(data.map(fromDB))
  }, [userId])

  // ── Realtime ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) { setNotifs([]); return }

    fetchNotifs()

    const channel = supabase
      .channel(`notifs:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        payload => {
          if (payload.eventType === 'INSERT') {
            const newNotif = fromDB(payload.new)
            setNotifs(prev => [newNotif, ...prev])

            // Sound + vibration
            const prefs = (() => { try { return JSON.parse(localStorage.getItem('hl_prefs') || '{}') } catch { return {} } })()
            playAlert(prefs)

            // System notification (shows even when app is in background)
            showSystemNotif(newNotif.title, newNotif.message)

          } else if (payload.eventType === 'UPDATE') {
            setNotifs(prev => prev.map(n => n.id === payload.new.id ? fromDB(payload.new) : n))
          } else if (payload.eventType === 'DELETE') {
            setNotifs(prev => prev.filter(n => n.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [userId, fetchNotifs])

  // ── Actions ──────────────────────────────────────────────────────────────
  const add = useCallback(async ({ type, title, message }) => {
    if (!userId) return
    await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message: message || '',
    })
  }, [userId])

  const markRead = useCallback(async id => {
    await supabase
      .from('notifications').update({ is_read: true })
      .eq('id', id).eq('user_id', userId)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [userId])

  const markAllRead = useCallback(async () => {
    await supabase
      .from('notifications').update({ is_read: true })
      .eq('user_id', userId).eq('is_read', false)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }, [userId])

  const remove = useCallback(async id => {
    await supabase
      .from('notifications').delete()
      .eq('id', id).eq('user_id', userId)
    setNotifs(prev => prev.filter(n => n.id !== id))
  }, [userId])

  const clear = useCallback(async () => {
    await supabase.from('notifications').delete().eq('user_id', userId)
    setNotifs([])
  }, [userId])

  const unread = notifs.filter(n => !n.read).length

  return { notifs, add, markRead, markAllRead, remove, clear, unread }
}
