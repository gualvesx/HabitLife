import { useState, useCallback } from 'react'
import { Header }        from '../components/layout/Header'
import { Sidebar }       from '../components/layout/Sidebar'
import { TaskModal }     from '../components/tasks/TaskModal'
import { DashboardPage } from './DashboardPage'
import { TasksPage }     from './TasksPage'
import { CalendarPage }  from './CalendarPage'
import { TimerPage }     from './TimerPage'
import { StatsPage }     from './StatsPage'
import { SettingsPage }  from './SettingsPage'
import { capitalize }    from '../utils/capitalize'
import { todayKey }      from '../utils/date'
import s from './AppShell.module.css'

const PAGE_TITLES = {
  dashboard: 'Olá',
  tasks:     'Tarefas',
  calendar:  'Calendário',
  timer:     'Timer Foco',
  stats:     'Estatísticas',
  settings:  'Configurações',
}

export function AppShell({ user, dark, onToggleTheme, onLogout, tasks, taskLoading, taskActions, notifs }) {
  const [view,       setView]       = useState('dashboard')
  const [modalOpen,  setModalOpen]  = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)   // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // desktop collapse
  const [focusTask,  setFocusTask]  = useState(null)      // task linked to timer

  const { addTask, toggleTask, updateTaskValue, updateSubtasks, deleteTask, clearAll } = taskActions

  const handleSaveTask = useCallback(async task => {
    await addTask(task)
    notifs.add({ type: 'achievement', title: 'Tarefa criada!', message: `"${task.name}" foi adicionada` })
  }, [addTask, notifs])

  const startFocus = useCallback(task => {
    setFocusTask(task)
    setView('timer')
    setSidebarOpen(false)
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

      {/* Mobile overlay */}
      {sidebarOpen && <div className={s.overlay} onClick={() => setSidebarOpen(false)} />}

      <div className={[s.body, sidebarCollapsed ? s.bodyCollapsed : ''].join(' ')}>
        <Sidebar
          view={view} onNavigate={navigate}
          isOpen={sidebarOpen}
          collapsed={sidebarCollapsed}
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
              <DashboardPage tasks={tasks} toggleTask={toggleTask} openModal={() => setModalOpen(true)} onStartFocus={startFocus} updateTaskValue={updateTaskValue} />
            )}
            {view === 'tasks' && (
              <TasksPage tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} openModal={() => setModalOpen(true)} onStartFocus={startFocus} updateTaskValue={updateTaskValue} updateSubtasks={updateSubtasks} />
            )}
            {view === 'calendar' && (
              <CalendarPage tasks={tasks} toggleTask={toggleTask} deleteTask={deleteTask} addTask={addTask} addNotif={notifs.add} />
            )}
            {view === 'timer' && <TimerPage tasks={tasks} focusTask={focusTask} setFocusTask={setFocusTask} />}
            {view === 'stats' && <StatsPage tasks={tasks} />}
            {view === 'settings' && (
              <SettingsPage dark={dark} onToggleTheme={onToggleTheme} user={user} tasks={tasks} clearAllTasks={clearAll} onLogout={onLogout} />
            )}
          </>}
        </main>
      </div>

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveTask} defaultDate={todayKey()} />
    </div>
  )
}
