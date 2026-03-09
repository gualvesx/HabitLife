import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Toggle } from '../components/ui/Toggle'
import { Button } from '../components/ui/Button'
import { Icon } from '../constants/icons'
import s from './SettingsPage.module.css'

const PREFS_KEY = 'hl_prefs'

const loadPrefs = () => {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') } catch { return {} }
}
const savePrefs = p => {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)) } catch {}
}

export function SettingsPage({ dark, onToggleTheme, user, tasks, clearAllTasks }) {
  const [prefs, setPrefs] = useState(() => ({
    notif: true, sound: true, vibr: false,
    ...loadPrefs(),
  }))

  const togPref = k => {
    const next = { ...prefs, [k]: !prefs[k] }
    setPrefs(next)
    savePrefs(next)
  }

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ user, tasks, exportedAt: new Date().toISOString() }, null, 2)],
      { type: 'application/json' }
    )
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'habitlife_backup.json'
    a.click()
  }

  const handleClear = () => {
    if (confirm('Tem certeza? Todas as tarefas serão removidas permanentemente.')) {
      clearAllTasks()
    }
  }

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
        <div className={s.cardTitle}>Notificações</div>
        <div className={s.rows}>
          <Toggle label="Notificações" sub="Receber alertas de tarefas" on={prefs.notif} onToggle={() => togPref('notif')} />
          <Toggle label="Sons"         sub="Tocar som ao completar"     on={prefs.sound} onToggle={() => togPref('sound')} />
          <Toggle label="Vibração"     sub="Vibrar ao receber alertas"  on={prefs.vibr}  onToggle={() => togPref('vibr')} />
        </div>
      </Card>

      {/* Data */}
      <Card>
        <div className={s.cardTitle}>Dados</div>
        <div className={s.rows}>
          <div className={s.dataRow}>
            <div>
              <div className={s.dataLbl}>Exportar dados</div>
              <div className={s.dataSub}>Backup JSON com todas as tarefas ({tasks.length})</div>
            </div>
            <Button size="sm" variant="outline" icon={<Icon.Download width={13} height={13} />} onClick={exportData}>
              Exportar
            </Button>
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
