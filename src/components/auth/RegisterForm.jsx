import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Icon } from '../../constants/icons'
import s from './AuthForm.module.css'

export function RegisterForm({ onSubmit, auth, onSwitch }) {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    await onSubmit(name, email, password)
  }

  const strength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : 3

  const strengthLabel = ['', 'Fraca', 'Média', 'Forte'][strength]
  const strengthColor = ['', 'var(--red)', 'var(--yellow)', 'var(--green)'][strength]

  return (
    <form className={s.form} onSubmit={handleSubmit} noValidate>
      <div className={s.top}>
        <h2 className={s.heading}>Crie sua conta</h2>
        <p className={s.desc}>Crie sua conta e comece agora</p>
      </div>

      <div className={s.fields}>
        <Input
          label="Nome completo"
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={e => setName(e.target.value)}
          icon={<Icon.User width={15} height={15} />}
          autoComplete="name"
          required
        />
        <Input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          icon={<Icon.Mail width={15} height={15} />}
          autoComplete="email"
          required
        />
        <div>
          <Input
            label="Senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon={<Icon.Lock width={15} height={15} />}
            autoComplete="new-password"
            required
          />
          {password.length > 0 && (
            <div className={s.strengthWrap}>
              <div className={s.strengthBars}>
                {[1,2,3].map(n => (
                  <div
                    key={n}
                    className={s.strengthBar}
                    style={{ background: strength >= n ? strengthColor : 'var(--surface-3)' }}
                  />
                ))}
              </div>
              <span style={{ color: strengthColor }}>{strengthLabel}</span>
            </div>
          )}
        </div>
      </div>

      {auth.error && (
        <div className={s.error}>
          <Icon.X width={13} height={13} />
          {auth.error}
        </div>
      )}

      <Button type="submit" fullWidth loading={auth.loading} size="lg">
        Criar conta
      </Button>

      <p className={s.switch}>
        Já tem uma conta?{' '}
        <button type="button" className={s.switchLink} onClick={onSwitch}>
          Entrar
        </button>
      </p>
    </form>
  )
}
