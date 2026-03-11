/**
 * notifSafe — wrappers seguros para a Web Notification API
 * No Android via Capacitor, `Notification` não existe no escopo global.
 * Todos os acessos devem passar por estas funções.
 */

export const notifSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window

export const notifPermission = () =>
  notifSupported() ? window.Notification.permission : 'not_supported'

export const requestNotifPermission = async () => {
  if (!notifSupported()) return 'not_supported'
  if (window.Notification.permission === 'granted') return 'granted'
  if (window.Notification.permission === 'denied')  return 'denied'
  return await window.Notification.requestPermission()
}

export const showNotification = (title, opts = {}) => {
  if (!notifSupported()) return
  if (window.Notification.permission !== 'granted') return
  const options = { icon: '/logo.svg', badge: '/logo.svg', ...opts }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(reg => reg.showNotification(title, options))
      .catch(() => { try { new window.Notification(title, options) } catch {} })
  } else {
    try { new window.Notification(title, options) } catch {}
  }
}
