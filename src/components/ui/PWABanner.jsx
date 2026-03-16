import { useState, useEffect } from 'react'
import s from './PWABanner.module.css'

const APK_URL = '/downloads/HabitLife.apk'

// Detecta se está rodando como app nativo (Capacitor) ou PWA instalada
const isInstalledApp = () => {
  // Capacitor injeta window.Capacitor quando roda como APK
  if (window.Capacitor?.isNativePlatform?.()) return true
  // PWA instalada
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if (window.navigator.standalone) return true
  return false
}

export function PWABanner() {
  const [show,     setShow]    = useState(false)
  const [prompt,   setPrompt]  = useState(null)
  const [isAndroid, setAndroid] = useState(false)
  const [isIOS,    setIsIOS]   = useState(false)

  useEffect(() => {
    // Nunca mostrar se já está instalado como APK ou PWA
    if (isInstalledApp()) return
    if (sessionStorage.getItem('pwa_dismissed')) return

    const ua      = navigator.userAgent
    const android = /android/i.test(ua)
    const ios     = /iphone|ipad|ipod/i.test(ua) && !window.MSStream

    setAndroid(android)
    setIsIOS(ios)

    if (android || ios) {
      const t = setTimeout(() => setShow(true), 1200)
      return () => clearTimeout(t)
    }

    // Desktop: PWA prompt
    if (window.__pwaInstallPrompt) {
      setPrompt(window.__pwaInstallPrompt); setShow(true); return
    }
    const handler = e => { setPrompt(e.detail); setShow(true) }
    window.addEventListener('pwaPromptReady', handler)
    return () => window.removeEventListener('pwaPromptReady', handler)
  }, [])

  const handleInstall = async () => {
    if (prompt) { prompt.prompt(); const { outcome } = await prompt.userChoice; if (outcome === 'accepted') { setShow(false); return } }
    setShow(false)
  }
  const handleDismiss = () => { setShow(false); sessionStorage.setItem('pwa_dismissed', '1') }

  if (!show) return null

  if (isAndroid) return (
    <div className={s.banner}>
      <div className={s.left}>
        <img src="/logo.svg" alt="HabitLife" className={s.icon} />
        <div className={s.text}>
          <span className={s.title}>Instalar HabitLife</span>
          <span className={s.sub}>Baixe o app para usar offline com alarmes nativos</span>
        </div>
      </div>
      <div className={s.actions}>
        <a className={s.installBtn} href={APK_URL} download="HabitLife.apk">Baixar app</a>
        <button className={s.closeBtn} onClick={handleDismiss} aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  )

  if (isIOS) return (
    <div className={s.banner}>
      <div className={s.left}>
        <img src="/logo.svg" alt="HabitLife" className={s.icon} />
        <div className={s.text}>
          <span className={s.title}>Adicionar à tela inicial</span>
          <span className={s.sub}>Toque em  → "Adicionar à Tela de Início"</span>
        </div>
      </div>
      <div className={s.actions}>
        <button className={s.closeBtn} onClick={handleDismiss} aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  )

  return (
    <div className={s.banner}>
      <div className={s.left}>
        <img src="/logo.svg" alt="HabitLife" className={s.icon} />
        <div className={s.text}>
          <span className={s.title}>Instalar HabitLife</span>
          <span className={s.sub}>Acesso rápido, offline e notificações</span>
        </div>
      </div>
      <div className={s.actions}>
        <button className={s.installBtn} onClick={handleInstall}>{prompt ? 'Instalar' : 'Como instalar?'}</button>
        <button className={s.closeBtn} onClick={handleDismiss} aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
  )
}
