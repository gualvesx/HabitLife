import { useState, useEffect } from 'react'
import { PWABanner } from './components/ui/PWABanner'
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

function Splash() {
  return (
    <div className={s.splash}>
      <div className={s.splashLogo}>
        <img src="/logo.svg" alt="HabitLife" width={40} height={40} style={{ objectFit: 'contain', display: 'block' }} />
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

  // Safety: never show splash forever (iOS can get stuck)
  const [maxWait, setMaxWait] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setMaxWait(false), 3000)
    return () => clearTimeout(t)
  }, [])
  if (auth.loading && !auth.user && maxWait) return <Splash />

  // PWA banner wrapper — renders on every page for mobile users
  const withBanner = (page) => <><PWABanner />{page}</>

  // Legal pages — accessible from anywhere
  if (route === 'termos')      return withBanner(<TermosPage      onBack={() => setRoute('auth')} />)
  if (route === 'privacidade') return withBanner(<PrivacidadePage onBack={() => setRoute('auth')} />)

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
