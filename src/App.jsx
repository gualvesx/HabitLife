import { useState } from 'react'
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
      <div className={s.splashIcon}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>
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

  if (auth.loading && !auth.user) return <Splash />

  // Legal pages — accessible from anywhere
  if (route === 'termos')      return <TermosPage      onBack={() => setRoute('auth')} />
  if (route === 'privacidade') return <PrivacidadePage onBack={() => setRoute('auth')} />

  if (auth.user) {
    const taskActions = {
      addTask:    tasks.addTask,
      toggleTask: tasks.toggleTask,
      deleteTask: tasks.deleteTask,
      clearAll:   tasks.clearAll,
    }
    return (
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

  if (route === 'landing') return <LandingPage onEnter={() => setRoute('auth')} />

  return (
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
