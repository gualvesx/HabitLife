const PREFIX = 'hl_'

export const storage = {
  get: (key, fallback = null) => {
    try {
      const v = localStorage.getItem(PREFIX + key)
      return v !== null ? JSON.parse(v) : fallback
    } catch {
      return fallback
    }
  },
  set: (key, val) => {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(val)) } catch {}
  },
  remove: (key) => {
    try { localStorage.removeItem(PREFIX + key) } catch {}
  },
  clear: () => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k))
    } catch {}
  },
}
