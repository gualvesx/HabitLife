import { useState } from 'react'
import { LoginForm }    from './LoginForm'
import { RegisterForm } from './RegisterForm'
import { ConfirmEmail } from './ConfirmEmail'
import { Icon } from '../../constants/icons'
import { LogoIcon } from '../ui/LogoIcon'
import s from './AuthPage.module.css'

const FEATURES = [
  { icon: Icon.Target,   title: 'Metas de estudo',    desc: 'Defina hábitos e metas de aprendizado com precisão.' },
  { icon: Icon.Flame,    title: 'Sequências',          desc: 'Mantenha o ritmo e veja sua sequência crescer a cada dia.' },
  { icon: Icon.BarChart, title: 'Estatísticas reais',  desc: 'Dados calculados com base nas suas tarefas concluídas.' },
  { icon: Icon.Calendar, title: 'Planejamento',        desc: 'Visualize e organize tarefas em um calendário interativo.' },
]

export function AuthPage({ onLogin, onRegister, authState, onBack, onTermos, onPrivacidade }) {
  const [mode,            setMode]            = useState('login')
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleRegister = async (name, email, password) => {
    const ok = await onRegister(name, email, password)
    if (ok) { setRegisteredEmail(email); setMode('confirm') }
  }

  if (mode === 'confirm') {
    return <ConfirmEmail email={registeredEmail} onBack={() => { setMode('register'); authState.clearError?.() }} />
  }

  return (
    <div className={s.page}>
      {/* ── Left brand panel ── */}
      <div className={s.brand}>
        {/* Aurora borealis layers */}
        <div className={s.aurora} aria-hidden>
          <div className={s.auroraLayer} />
          <div className={s.auroraLayer} />
          <div className={s.auroraLayer} />
          <div className={s.auroraLayer} />
          <div className={s.auroraLayer} />
        </div>

        <div className={s.brandInner}>
          <div className={s.logo}>
            <div className={s.logoIcon}>
              <LogoIcon size={36} />
            </div>
            <div>
              <div className={s.logoName}>HabitLife</div>
              <div className={s.logoSub}>Evolução</div>
            </div>
          </div>

          <div className={s.headline}>
            <h1 className={s.h1}>
              Transforme<br />
              <span className={s.accent}>hábitos</span> em<br />
              resultados.
            </h1>
            <p className={s.sub}>
              O app de rastreamento de hábitos feito para pessoas que levam sua evolução a sério.
            </p>
          </div>

          <div className={s.features}>
            {FEATURES.map(({ icon: FeatureIcon, title, desc }) => (
              <div key={title} className={s.feature}>
                <div className={s.featureIcon}>
                  <FeatureIcon width={17} height={17} />
                </div>
                <div>
                  <div className={s.featureTitle}>{title}</div>
                  <div className={s.featureDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={s.social}>
            <div className={s.avatarStack}>
              {['A','B','C','D'].map((l, i) => (
                <div key={l} className={s.ava} style={{ zIndex: 4 - i, marginLeft: i > 0 ? -10 : 0 }}>{l}</div>
              ))}
            </div>
            <span>+2.400 pessoas ativas este mês</span>
          </div>
        </div>

        <div className={s.grid} aria-hidden />
        <div className={s.glow1} aria-hidden />
        <div className={s.glow2} aria-hidden />
      </div>

      {/* ── Right form side ── */}
      <div className={s.formSide}>
        {/* Prominent back button at TOP */}
        {onBack && (
          <div className={s.backBtnWrap}>
            <button className={s.backBtn} onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Voltar ao início
            </button>
          </div>
        )}

        <div className={s.formCard}>
          <div className={s.tabs}>
            <button
              className={[s.tab, mode === 'login' ? s.tabActive : ''].join(' ')}
              onClick={() => { setMode('login'); authState.clearError?.() }}
            >Entrar</button>
            <button
              className={[s.tab, mode === 'register' ? s.tabActive : ''].join(' ')}
              onClick={() => { setMode('register'); authState.clearError?.() }}
            >Criar conta</button>
          </div>

          {mode === 'login'
            ? <LoginForm    onSubmit={onLogin}         auth={authState} onSwitch={() => { setMode('register'); authState.clearError?.() }} />
            : <RegisterForm onSubmit={handleRegister}  auth={authState} onSwitch={() => { setMode('login');    authState.clearError?.() }} />
          }
        </div>

        <p className={s.legal}>
          Ao continuar, você concorda com nossos{' '}
          <button type="button" className={s.legalLink} onClick={onTermos}>Termos de Uso</button>
          {' '}e{' '}
          <button type="button" className={s.legalLink} onClick={onPrivacidade}>Política de Privacidade</button>.
        </p>
      </div>
    </div>
  )
}
