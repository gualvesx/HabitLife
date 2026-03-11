import { useState, useEffect } from 'react'

export function usePWAInstall() {
  const [prompt,      setPrompt]      = useState(null)  // BeforeInstallPromptEvent
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile,    setIsMobile]    = useState(false)
  const [isIOS,       setIsIOS]       = useState(false)
  const [dismissed,   setDismissed]   = useState(false)

  useEffect(() => {
    // Detect mobile
    const mobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
    setIsMobile(mobile)

    // Detect iOS specifically
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)

    // Already installed as PWA (standalone mode)
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    setIsInstalled(standalone)

    // Android/Chrome: capture the install prompt
    const handler = e => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setPrompt(null)
    })

    // Check if user already dismissed banner
    if (sessionStorage.getItem('pwa_dismissed')) setDismissed(true)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return false
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setPrompt(null)
    return outcome === 'accepted'
  }

  const dismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('pwa_dismissed', '1')
  }

  // Show banner if: mobile + not installed + not dismissed + (has prompt OR is iOS)
  const showBanner = isMobile && !isInstalled && !dismissed && (!!prompt || isIOS)

  return { showBanner, isIOS, install, dismiss, isInstalled }
}
