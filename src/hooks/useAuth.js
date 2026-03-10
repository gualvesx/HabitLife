import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // ── Restore session on mount + listen to auth changes ──────────────────
  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        // On iOS, getSession can return null even when a valid session exists
        // right after login — retry once after a short delay if so
        let session = null
        const { data } = await supabase.auth.getSession()
        session = data.session

        if (!session && isIOS) {
          await new Promise(r => setTimeout(r, 600))
          const retry = await supabase.auth.getSession()
          session = retry.data.session
        }

        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  // ── Login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError('')
    setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setLoading(false)
      setError(
        err.message.includes('Invalid login') || err.message.includes('invalid_credentials')
          ? 'Email ou senha incorretos'
          : err.message
      )
      return false
    }

    // iOS: wait for onAuthStateChange to propagate before unlocking
    if (isIOS && data.session) {
      await new Promise(r => setTimeout(r, 500))
      setUser(data.session.user)
    }

    setLoading(false)
    return true
  }, [])

  // ── Register ────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    setError('')
    setLoading(true)

    if (!name.trim() || name.length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres')
      setLoading(false)
      return false
    }
    if (password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return false
    }

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    })

    setLoading(false)
    if (err) {
      setError(
        err.message.includes('already registered')
          ? 'Este email já está cadastrado'
          : err.message
      )
      return false
    }
    return true
  }, [])

  // ── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setError('')
  }, [])

  const clearError = useCallback(() => setError(''), [])

  const profile = user
    ? {
        id:    user.id,
        name:  user.user_metadata?.full_name || user.email.split('@')[0],
        email: user.email,
      }
    : null

  return { user: profile, rawUser: user, error, loading, login, register, logout, clearError }
}
