import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Loga aviso mas não lança erro — evita tela preta no APK se .env não foi embutido
if (!url || !key) {
  console.error('⚠️ Supabase env vars missing. Verifique os secrets VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no GitHub Actions.')
}

// iOS Safari (especially private mode) can block localStorage entirely.
// This storage adapter falls back to an in-memory map so auth never crashes.
const safeStorage = (() => {
  const mem = new Map()
  const test = '__sb_test__'
  let useLocal = true
  try {
    localStorage.setItem(test, '1')
    localStorage.removeItem(test)
  } catch {
    useLocal = false
  }
  return {
    getItem:    key => { try { return useLocal ? localStorage.getItem(key)    : (mem.get(key) ?? null)       } catch { return mem.get(key) ?? null } },
    setItem:    (key, val) => { try { if (useLocal) localStorage.setItem(key, val);    else mem.set(key, val) } catch { mem.set(key, val) } },
    removeItem: key => { try { if (useLocal) localStorage.removeItem(key); else mem.delete(key)              } catch { mem.delete(key) } },
  }
})()

export const supabase = createClient(url, key, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
    storage:            safeStorage,
  },
})
