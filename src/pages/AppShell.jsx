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

  // ── Time-based alarm checker — runs every 30s ──────────────────────────
  useEffect(() => {
    const checkAlarms = () => {
      if ((window.Notification?.permission ?? 'not_supported') !== 'granted') return
      const now  = new Date()
      const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      const today = todayKey()

      tasks.forEach(task => {
        if (task.alert === 'none' || !task.alert) return
        if (task.done) return
        if (!task.time || task.time === '—') return

        // Only fire for today's tasks (habits show every day, tasks from their start date)
        const isToday = task.date === today ||
          task.frequencyType === 'daily' ||
          task.frequencyType === 'specific_days' ||
          task.frequencyType === 'daily_until_done'

        if (!isToday) return
        if (task.time !== hhmm) return

        // Prevent double-firing in the same minute
        const key = `${task.id}-${today}-${hhmm}`
        if (firedRef.current.has(key)) return
        firedRef.current.add(key)

        // Fire based on alert type
        if (task.alert === 'system' || task.alert === 'both') {
          fireSystemNotification(`⏰ ${task.name}`, `Hora do seu hábito/tarefa agora!`)
        }
        if (task.alert === 'alarm' || task.alert === 'both') {
          setAlarmTask(task) // show alarm screen
        }
      })
    }

    checkAlarms() // run immediately on mount
    const id = setInterval(checkAlarms, 30_000) // check every 30s
    return () => clearInterval(id)
  }, [tasks]) // re-registers when tasks change

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
