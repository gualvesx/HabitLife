import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

// ── Capture beforeinstallprompt BEFORE React mounts ─────────────────────
// The event fires very early — if we wait for React to set up listeners
// it's already gone. Store it globally so PWABanner + SettingsPage can use it.
window.__pwaInstallPrompt = null
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  window.__pwaInstallPrompt = e
  // Notify any listeners already registered (e.g. SettingsPage mounted)
  window.dispatchEvent(new CustomEvent('pwaPromptReady', { detail: e }))
}, { once: true })

// ── Service Worker registration ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.warn('SW registration failed:', err))
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
