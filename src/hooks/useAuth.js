import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../utils/supabase'

export function useAuth() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)   // true on mount (checking session)
  const [error,   setError]   = useState('')

  // ── Restore session on mount + listen to auth changes ──────────────────
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen to login / logout / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Login ───────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError(
        err.message.includes('Invalid login')
          ? 'Email ou senha incorretos'
          : err.message
      )
      return false
    }
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

  // Expose friendly name from metadata
  const profile = user
    ? {
        id:    user.id,
        name:  user.user_metadata?.full_name || user.email.split('@')[0],
        email: user.email,
      }
    : null

  return { user: profile, rawUser: user, error, loading, login, register, logout, clearError }
}
