import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Icon } from '../../constants/icons'
import s from './AuthForm.module.css'

export function LoginForm({ onSubmit, auth, onSwitch }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <form className={s.form} onSubmit={handleSubmit} noValidate>
      <div className={s.top}>
        <h2 className={s.heading}>Bem-vindo de volta</h2>
        <p className={s.desc}>Entre na sua conta para continuar</p>
      </div>

      <div className={s.fields}>
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
        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          icon={<Icon.Lock width={15} height={15} />}
          autoComplete="current-password"
          required
        />
      </div>

      {auth.error && (
        <div className={s.error}>
          <Icon.X width={13} height={13} />
          {auth.error}
        </div>
      )}

      <Button type="submit" fullWidth loading={auth.loading} size="lg">
        Entrar
      </Button>

      <p className={s.switch}>
        Não tem conta?{' '}
        <button type="button" className={s.switchLink} onClick={onSwitch}>
          Cadastre-se grátis
        </button>
      </p>
    </form>
  )
}
