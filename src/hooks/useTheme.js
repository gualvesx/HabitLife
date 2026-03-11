import { useState, useEffect } from 'react'

const LS_KEY = 'hl_dark'

export function useTheme() {
  const [dark, setDarkState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) ?? 'true') } catch { return true }
  })

  useEffect(() => {
    document.documentElement.className = dark ? 'dark' : 'light'
    try { localStorage.setItem(LS_KEY, JSON.stringify(dark)) } catch {}
  }, [dark])

  // Apply immediately on first render
  useEffect(() => {
    document.documentElement.className = dark ? 'dark' : 'light'
  }, [])

  const toggle  = () => setDarkState(v => !v)
  const setDark = v  => setDarkState(v)

  return { dark, toggle, setDark }
}
