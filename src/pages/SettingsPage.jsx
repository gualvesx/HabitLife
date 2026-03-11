import { useState, useEffect } from 'react'
import { Card }   from '../components/ui/Card'
import { Toggle } from '../components/ui/Toggle'
import { Button } from '../components/ui/Button'
import { Icon }   from '../constants/icons'
import { requestNotifPermission, fireSystemNotification } from '../hooks/useTasks'
import s from './SettingsPage.module.css'

const PREFS_KEY = 'hl_prefs'
const loadPrefs = () => { try { return JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') } catch { return {} } }
const savePrefs = p  => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)) } catch {} }

export function SettingsPage({ dark, onToggleTheme, user, tasks, clearAllTasks, onTestAlarm }) {
  const [prefs, setPrefs] = useState(() => ({ notif: true, sound: true, vibr: false, ...loadPrefs() }))
  const [permStatus,   setPermStatus]   = useState(() => (typeof window !== 'undefined' && 'Notification' in window ? (window.Notification?.permission ?? 'not_supported') : 'not_supported'))
  const [testNotifMsg, setTestNotifMsg] = useState(null)

  // PWA install
  const [installPrompt,  setInstallPrompt]  = useState(null)
  const [isInstalled,    setIsInstalled]    = useState(
    window.matchMedia('(display-mode: standalone)').matches || !!window.navigator.standalone
  )
  const [isIOS, setIsIOS] = useState(/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream)
  const [installMsg, setInstallMsg] = useState(null)

  useEffect(() => {
    // Grab prompt captured globally before React mounted
    if (window.__pwaInstallPrompt) {
      setInstallPrompt(window.__pwaInstallPrompt)
    }
    // Also listen in case it arrives later
    const handler = e => setInstallPrompt(e.detail)
    window.addEventListener('pwaPromptReady', handler)
    return () => window.removeEventListener('pwaPromptReady', handler)
  }, [])

  const handleInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setInstallMsg({ ok: true, text: 'App instalado com sucesso!' })
      } else {
        setInstallMsg({ ok: false, text: 'Instalação cancelada.' })
      }
      setTimeout(() => setInstallMsg(null), 4000)
    } else if (isIOS) {
      setInstallMsg({ ok: true, text: 'Toque em  → "Adicionar à Tela de Início"' })
    }
  }

  const togPref = k => {
    const next = { ...prefs, [k]: !prefs[k] }
    setPrefs(next); savePrefs(next)
  }

  const handleRequestPerm = async () => {
    const result = await requestNotifPermission()
    setPermStatus(result)
  }

  const testNotification = async () => {
    if ((window.Notification?.permission ?? 'not_supported') !== 'granted') {
      const result = await requestNotifPermission()
      setPermStatus(result)
      if (result !== 'granted') {
        setTestNotifMsg({ ok: false, text: 'Permissão negada. Libere nas configurações do navegador.' })
        return
      }
    }
    fireSystemNotification('🔔 Teste HabitLife', 'Notificações estão funcionando corretamente!')
    setTestNotifMsg({ ok: true, text: 'Notificação enviada! Verifique a área de notificações.' })
    setTimeout(() => setTestNotifMsg(null), 4000)
  }

  const testAlarm = () => {
    if (onTestAlarm) onTestAlarm()
    // message not needed — the modal itself is the feedback
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ user, tasks, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = 'habitlife_backup.json'; a.click()
  }

  const handleClear = () => {
    if (confirm('Tem certeza? Todas as tarefas serão removidas permanentemente.')) clearAllTasks()
  }

  const permLabel = {
    granted:       { text: 'Concedida',        color: 'var(--green)' },
    denied:        { text: 'Bloqueada',         color: 'var(--red)'   },
    default:       { text: 'Não solicitada',    color: 'var(--yellow)'},
    not_supported: { text: 'Não suportado',     color: 'var(--text-3)'},
  }[permStatus] ?? { text: permStatus, color: 'var(--text-3)' }

  return (
    <div className={s.page}>

      {/* Profile */}
      <Card>
        <div className={s.cardTitle}>Perfil</div>
        <div className={s.profile}>
          <div className={s.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className={s.profileName}>{user?.name}</div>
            <div className={s.profileEmail}>{user?.email}</div>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <div className={s.cardTitle}>Aparência</div>
        <Toggle label="Tema escuro" sub="Fundo preto puro" on={dark} onToggle={onToggleTheme} />
      </Card>

      {/* Notifications */}
      <Card>
        <div className={s.cardTitle}>Notificações &amp; Alarmes</div>
        <div className={s.rows}>

          {/* Permission status row */}
          <div className={s.permRow}>
            <div>
              <div className={s.dataLbl}>Permissão do sistema</div>
              <div className={s.dataSub}>
                Status: <span style={{ color: permLabel.color, fontWeight: 600 }}>{permLabel.text}</span>
              </div>
            </div>
            {permStatus !== 'granted' && permStatus !== 'not_supported' && (
              <Button size="sm" variant="outline" onClick={handleRequestPerm}>
                Solicitar
              </Button>
            )}
            {permStatus === 'denied' && (
              <span className={s.permHint}>Clique no cadeado na barra de endereço para liberar</span>
            )}
          </div>

          <Toggle label="Notificações" sub="Receber alertas de tarefas" on={prefs.notif} onToggle={() => togPref('notif')} />
          <Toggle label="Sons"         sub="Tocar som ao completar"     on={prefs.sound} onToggle={() => togPref('sound')} />
          <Toggle label="Vibração"     sub="Vibrar ao receber alertas"  on={prefs.vibr}  onToggle={() => togPref('vibr')}  />

          {/* Test buttons */}
          <div className={s.testSection}>
            <div className={s.testTitle}>Testar</div>
            <div className={s.testRow}>
              <div className={s.testItem}>
                <div className={s.testInfo}>
                  <div className={s.dataLbl}>Notificação do sistema</div>
                  <div className={s.dataSub}>Envia um push para verificar se está funcionando</div>
                  {testNotifMsg && (
                    <div className={[s.testMsg, testNotifMsg.ok ? s.testOk : s.testErr].join(' ')}>
                      {testNotifMsg.text}
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline"
                  icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
                  onClick={testNotification}>
                  Testar
                </Button>
              </div>

              <div className={s.testItem}>
                <div className={s.testInfo}>
                  <div className={s.dataLbl}>Alarme sonoro</div>
                  <div className={s.dataSub}>Toca o som de alarme e vibra no celular</div>

                </div>
                <Button size="sm" variant="outline"
                  icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6M22 6l-3-3"/></svg>}
                  onClick={testAlarm}>
                  Testar
                </Button>
              </div>
            </div>
          </div>

        </div>
      </Card>

      {/* Install App */}
      {!isInstalled && (
        <Card>
          <div className={s.cardTitle}>Instalar app</div>
          <div className={s.dataRow}>
            <div>
              <div className={s.dataLbl}>HabitLife como aplicativo</div>
              <div className={s.dataSub}>
                {isIOS
                  ? 'Adicione à tela de início pelo menu do Safari'
                  : installPrompt
                    ? 'Instale para acesso rápido, offline e notificações melhores'
                    : 'Abra no Chrome ou Edge para instalar como app'}
              </div>
              {installMsg && (
                <div className={[s.testMsg, installMsg.ok ? s.testOk : s.testErr].join(' ')} style={{ marginTop: 6 }}>
                  {installMsg.text}
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant={installPrompt || isIOS ? 'primary' : 'outline'}
              disabled={!installPrompt && !isIOS}
              icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
              onClick={handleInstall}>
              {isIOS ? 'Como instalar' : 'Instalar'}
            </Button>
          </div>
        </Card>
      )}

      {/* Data */}
      <Card>
        <div className={s.cardTitle}>Dados</div>
        <div className={s.rows}>
          <div className={s.dataRow}>
            <div>
              <div className={s.dataLbl}>Exportar dados</div>
              <div className={s.dataSub}>Backup JSON com todas as tarefas ({tasks.length})</div>
            </div>
            <Button size="sm" variant="outline" icon={<Icon.Download width={13} height={13} />} onClick={exportData}>Exportar</Button>
          </div>
          <div className={s.dataRow}>
            <div>
              <div className={s.dataLbl} style={{ color: 'var(--red)' }}>Limpar todos os dados</div>
              <div className={s.dataSub}>Remove todas as tarefas permanentemente</div>
            </div>
            <Button size="sm" variant="danger" onClick={handleClear}>Limpar</Button>
          </div>
        </div>
      </Card>

    </div>
  )
}
