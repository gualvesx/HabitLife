import { useState, useEffect, useRef } from 'react'
import { PWABanner }      from './components/ui/PWABanner'
import { useTheme }       from './hooks/useTheme'
import { useAuth }        from './hooks/useAuth'
import { useTasks }       from './hooks/useTasks'
import { useNotifs }      from './hooks/useNotifs'
import { LandingPage }    from './pages/LandingPage'
import { AuthPage }       from './components/auth/AuthPage'
import { AppShell }       from './pages/AppShell'
import { TermosPage }     from './pages/TermosPage'
import { PrivacidadePage } from './pages/PrivacidadePage'
import s from './App.module.css'
import { requestAlarmPermissions } from './hooks/useNativeAlarm'

function Splash() {
  return (
    <div className={s.splash}>
      <div className={s.splashLogo}>
        <img src="/logo.svg" alt="HabitLife" width={40} height={40}
          style={{ objectFit: 'contain', display: 'block' }} />
      </div>
      <div className={s.splashName}>HabitLife</div>
      <div className={s.splashSub}>Evolução</div>
      <div className={s.splashSpinner} />
    </div>
  )
}

// Routes: 'landing' | 'auth' | 'termos' | 'privacidade'
export default function App() {
  const { dark, toggle: toggleTheme } = useTheme()
  const auth   = useAuth()
  const tasks  = useTasks(auth.user?.id)
  const notifs = useNotifs(auth.user?.id)
  const [route, setRoute] = useState('landing')

  // Track whether we've passed the initial auth check
  const [ready, setReady] = useState(false)
  const readyTimer = useRef(null)

  useEffect(() => {
    // As soon as loading finishes OR user is set, we're ready
    if (!auth.loading || auth.user) {
      setReady(true)
      return
    }
    // Hard timeout: never show splash more than 4s
    readyTimer.current = setTimeout(() => setReady(true), 4000)
    return () => clearTimeout(readyTimer.current)
  }, [auth.loading, auth.user])

  // When user logs in (user goes from null → value), make sure we're ready
  useEffect(() => {
    if (auth.user) {
      setReady(true)
      // Pede permissões de notificação e alarme logo após login
      requestAlarmPermissions()
    }
  }, [auth.user])

  // Show splash only while genuinely waiting for initial session check
  if (!ready) return <Splash />

  const withBanner = page => <><PWABanner />{page}</>

  // Legal pages
  if (route === 'termos')      return withBanner(<TermosPage      onBack={() => setRoute('auth')} />)
  if (route === 'privacidade') return withBanner(<PrivacidadePage onBack={() => setRoute('auth')} />)

  // Logged in → show app
  if (auth.user) {
    const taskActions = {
      addTask:         tasks.addTask,
      updateTask:      tasks.updateTask,
      toggleTask:      tasks.toggleTask,
      deleteTask:      tasks.deleteTask,
      clearAll:        tasks.clearAll,
      updateTaskValue: tasks.updateTaskValue,
      updateSubtasks:  tasks.updateSubtasks,
    }
    return withBanner(
      <AppShell
        user={auth.user}
        dark={dark}
        onToggleTheme={toggleTheme}
        onLogout={() => { auth.logout(); setRoute('landing') }}
        tasks={tasks.tasks}
        taskLoading={tasks.taskLoading}
        taskActions={taskActions}
        notifs={notifs}
      />
    )
  }

  if (route === 'landing') return withBanner(<LandingPage onEnter={() => setRoute('auth')} />)

  return withBanner(
    <AuthPage
      onLogin={auth.login}
      onRegister={auth.register}
      authState={auth}
      onBack={() => setRoute('landing')}
      onTermos={() => setRoute('termos')}
      onPrivacidade={() => setRoute('privacidade')}
    />
  )
}
