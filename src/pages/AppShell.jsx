import { useState, useCallback, useEffect, useRef } from 'react'
import { Header }        from '../components/layout/Header'
import { Sidebar }       from '../components/layout/Sidebar'
import { AddItemModal }  from '../components/tasks/AddItemModal'
import { AlarmModal }    from '../components/ui/AlarmModal'
import { DashboardPage } from './DashboardPage'
import { TasksPage }     from './TasksPage'
import { CalendarPage }  from './CalendarPage'
import { TimerPage }     from './TimerPage'
import { StatsPage }     from './StatsPage'
import { SettingsPage }  from './SettingsPage'
import { capitalize }    from '../utils/capitalize'
import { fireSystemNotification } from '../hooks/useTasks'
import { todayKey }      from '../utils/date'
import s from './AppShell.module.css'

const PAGE_TITLES = {
  dashboard: 'Olá',
  tasks:     'Rotina',
  calendar:  'Calendário',
  timer:     'Timer Foco',
  stats:     'Estatísticas',
  settings:  'Configurações',
}

export function AppShell({ user, dark, onToggleTheme, onLogout, tasks, taskLoading, taskActions, notifs }) {
  const [view,             setView]             = useState('dashboard')
  const [modalOpen,        setModalOpen]        = useState(false)
  const [editTask,         setEditTask]         = useState(null)
  const [editOpen,         setEditOpen]         = useState(false)
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [focusTask,        setFocusTask]        = useState(null)
  const [alarmTask,        setAlarmTask]        = useState(null) // task currently alarming
  const firedRef = useRef(new Set()) // track already-fired alarms this session

  const { addTask, updateTask, toggleTask, updateTaskValue, updateSubtasks, deleteTask, clearAll } = taskActions

  // ── Pede permissão de notificação ao montar (nativo + web) ───────────
  useEffect(() => {
    const requestPerms = async () => {
      // Nativo (Capacitor/Android)
      if (window.Capacitor?.isNativePlatform?.()) {
        try {
          const { LocalNotifications } = await import('@capacitor/local-notifications')
          await LocalNotifications.requestPermissions()
        } catch {}
        return
      }
      // Web
      if (typeof window !== 'undefined' && 'Notification' in window &&
          window.Notification.permission === 'default') {
        try { await window.Notification.requestPermission() } catch {}
      }
    }
    requestPerms()
  }, [])

  // ── Time-based alarm checker — runs every 30s ──────────────────────────
  useEffect(() => {
    const isNative = window.Capacitor?.isNativePlatform?.()

    const checkAlarms = async () => {
      // Na web: verifica permissão. No nativo: sempre prossegue
      if (!isNative) {
        const perm = window.Notification?.permission ?? 'not_supported'
        if (perm !== 'granted') return
      }

      const now   = new Date()
      const hhmm  = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const today = todayKey()
      const dow   = now.getDay()

      tasks.forEach(task => {
        if (task.alert === 'none' || !task.alert) return
        if (task.done) return
        if (!task.time || task.time === '—') return
        if (task.time !== hhmm) return

        // Verifica se a tarefa é de hoje
        const ft = task.frequencyType
        let isToday = false
        if (ft === 'daily')           isToday = true
        else if (ft === 'daily_until_done') isToday = task.date <= today
        else if (ft === 'specific_days')    isToday = task.frequencyDays?.map(Number).includes(dow)
        else if (ft === 'weekly')           isToday = new Date(task.date + 'T12:00:00').getDay() === dow
        else if (ft === 'monthly')          isToday = new Date(task.date + 'T12:00:00').getDate() === now.getDate()
        else                                isToday = task.date === today

        if (!isToday) return

        const key = `${task.id}-${today}-${hhmm}`
        if (firedRef.current.has(key)) return
        firedRef.current.add(key)

        // Dispara notificação
        if (task.alert === 'system' || task.alert === 'both') {
          if (isNative) {
            import('@capacitor/local-notifications').then(({ LocalNotifications }) => {
              LocalNotifications.schedule({ notifications: [{
                id:    Math.floor(Math.random() * 1_000_000),
                title: `⏰ ${task.name}`,
                body:  'Hora do seu hábito/tarefa!',
                schedule: { at: new Date(Date.now() + 500) },
                sound: 'alarm.mp3',
                iconColor: '#7c3aed',
                actionTypeId: '',
                extra: null,
              }]})
            }).catch(() => {})
          } else {
            fireSystemNotification(`⏰ ${task.name}`, `Hora do seu hábito/tarefa agora!`)
          }
        }

        // Dispara alarme sonoro / modal
        if (task.alert === 'alarm' || task.alert === 'both') {
          setAlarmTask(task)
        }
      })
    }

    checkAlarms()
    const id = setInterval(checkAlarms, 30_000)
    return () => clearInterval(id)
  }, [tasks])

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleSaveTask = useCallback(async task => {
    await addTask(task)
    notifs.add({ type: 'achievement', title: 'Item criado!', message: `"${task.name}" foi adicionado` })
  }, [addTask, notifs])

  const handleEditSave = useCallback(async task => {
    if (!editTask) return
    await updateTask({ ...task, id: editTask.id })
    setEditOpen(false)
    setEditTask(null)
  }, [editTask, updateTask])

  const startFocus = useCallback(task => {
    setFocusTask(task); setView('timer'); setSidebarOpen(false)
  }, [])

  const today    = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const subtitle = view === 'dashboard' ? capitalize(today) : 'HabitLife · Evolução'
  const title    = view === 'dashboard' ? `${PAGE_TITLES.dashboard}, ${user.name.split(' ')[0]}` : PAGE_TITLES[view]
  const navigate = id => { setView(id); setSidebarOpen(false) }

  return (
    <div className={s.shell}>

      <Header
        dark={dark} onToggleTheme={onToggleTheme}
        notifs={notifs} onAddTask={() => setModalOpen(true)}
        user={user} onLogout={onLogout}
        onMenuToggle={() => setSidebarOpen(v => !v)}
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(v => !v)}
      />

      {sidebarOpen && <div className={s.overlay} onClick={() => setSidebarOpen(false)} />}

      <div className={[s.body, sidebarCollapsed ? s.bodyCollapsed : ''].join(' ')}>
        <Sidebar
          view={view} onNavigate={navigate}
          isOpen={sidebarOpen} collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          onClose={() => setSidebarOpen(false)}
        />

        <main className={s.main}>
          <div className={s.pageHeader}>
            <h1 className={s.title}>{title}</h1>
            <p  className={s.sub}>{subtitle}</p>
          </div>

          {taskLoading && tasks.length === 0 && (
            <div className={s.loader}>
              <div className={s.loaderSpinner} />
              <span>Carregando...</span>
            </div>
          )}

          {(!taskLoading || tasks.length > 0) && <>
            {view === 'dashboard' && (
              <DashboardPage tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask}
                openModal={() => setModalOpen(true)}
                openEditModal={t => { setEditTask(t); setEditOpen(true) }}
                onStartFocus={startFocus} updateTaskValue={updateTaskValue} />
            )}
            {view === 'tasks' && (
              <TasksPage tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} updateTask={updateTask}
                openModal={() => setModalOpen(true)}
                openEditModal={t => { setEditTask(t); setEditOpen(true) }}
                onStartFocus={startFocus} updateTaskValue={updateTaskValue} updateSubtasks={updateSubtasks} />
            )}
            {view === 'calendar' && (
              <CalendarPage tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} addTask={addTask} addNotif={notifs.add} />
            )}
            {view === 'timer'    && <TimerPage tasks={tasks} focusTask={focusTask} setFocusTask={setFocusTask} />}
            {view === 'stats'    && <StatsPage tasks={tasks} />}
            {view === 'settings' && (
              <SettingsPage dark={dark} onToggleTheme={onToggleTheme} user={user} tasks={tasks} clearAllTasks={clearAll} onLogout={onLogout} onTestAlarm={() => setAlarmTask({ name: 'Teste de alarme', time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}), cat: 'Configurações', alert: 'alarm' })} />
            )}
          </>}
        </main>
      </div>

      {/* Add modal */}
      <AddItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        defaultDate={todayKey()}
      />

      {/* Edit modal */}
      <AddItemModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditTask(null) }}
        onSave={handleEditSave}
        defaultDate={todayKey()}
        editTask={editTask}
      />

      {/* Alarm screen */}
      <AlarmModal
        task={alarmTask}
        onDismiss={() => setAlarmTask(null)}
        onSnooze={task => {
          setAlarmTask(null)
          // Re-trigger after 5 minutes
          setTimeout(() => setAlarmTask(task), 5 * 60 * 1000)
        }}
      />
    </div>
  )
}
