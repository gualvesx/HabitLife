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

export function useNotifs(userId) {
  const [notifs,  setNotifs]  = useState([])
  const channelRef = useRef(null)

  // ── Fetch ─────────────────────────────────────────────────────────────────
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

  // ── Realtime ──────────────────────────────────────────────────────────────
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
            setNotifs(prev => [fromDB(payload.new), ...prev])
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

  // ── Actions ───────────────────────────────────────────────────────────────
  const add = useCallback(async ({ type, title, message }) => {
    if (!userId) return
    await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message: message || '',
    })
    // Realtime will update state
  }, [userId])

  const markRead = useCallback(async id => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [userId])

  const markAllRead = useCallback(async () => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }, [userId])

  const remove = useCallback(async id => {
    await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    setNotifs(prev => prev.filter(n => n.id !== id))
  }, [userId])

  const clear = useCallback(async () => {
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
    setNotifs([])
  }, [userId])

  const unread = notifs.filter(n => !n.read).length

  return { notifs, add, markRead, markAllRead, remove, clear, unread }
}
