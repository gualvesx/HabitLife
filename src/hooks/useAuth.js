import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../utils/supabase'

const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent)

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    // 1. onAuthStateChange fires reliably on all platforms including mobile Safari
    //    Set this up FIRST so we never miss the event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Also call getSession to handle the case where the session already
    //    exists (e.g. page reload) and onAuthStateChange won't fire again
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mountedRef.current) return
      // Only update if onAuthStateChange hasn't already resolved things
      setUser(prev => {
        if (prev) return prev          // already set by onAuthStateChange
        return session?.user ?? null
      })
      setLoading(false)
    }).catch(() => {
      if (mountedRef.current) setLoading(false)
    })

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
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

    // On mobile, manually set user immediately in case onAuthStateChange is slow
    if (data?.session?.user) {
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
