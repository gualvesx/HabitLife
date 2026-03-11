import { useState, useEffect } from 'react'
import s from './PWABanner.module.css'

export function PWABanner() {
  const [show,   setShow]   = useState(false)
  const [prompt, setPrompt] = useState(null)
  const [isIOS,  setIsIOS]  = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (window.navigator.standalone) return
    if (sessionStorage.getItem('pwa_dismissed')) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)

    if (ios) {
      const t = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(t)
    }

    // Check if already captured globally before React mounted
    if (window.__pwaInstallPrompt) {
      setPrompt(window.__pwaInstallPrompt)
      setShow(true)
      return
    }

    // Listen for late-arriving event
    const handler = e => { setPrompt(e); setShow(true) }
    window.addEventListener('pwaPromptReady', e => handler(e.detail))
  }, [])

  const handleInstall = async () => {
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') { setShow(false); return }
    }
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    sessionStorage.setItem('pwa_dismissed', '1')
  }

  if (!show) return null

  return (
    <div className={s.banner}>
      <div className={s.left}>
        <img src="/logo.svg" alt="HabitLife" className={s.icon} />
        <div className={s.text}>
          <span className={s.title}>Instalar HabitLife</span>
          <span className={s.sub}>
            {isIOS
              ? 'Toque em  e "Adicionar à Tela de Início"'
              : 'Instale para acesso rápido, offline e notificações'}
          </span>
        </div>
      </div>
      <div className={s.actions}>
        {!isIOS && (
          <button className={s.installBtn} onClick={handleInstall}>
            {prompt ? 'Instalar app' : 'Como instalar?'}
          </button>
        )}
        <button className={s.closeBtn} onClick={handleDismiss} aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
