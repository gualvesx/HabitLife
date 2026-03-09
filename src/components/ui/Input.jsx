import { useState } from 'react'
import { Icon } from '../../constants/icons'
import s from './Input.module.css'

export function Input({
  label, error, hint, icon, type = 'text',
  className = '', containerStyle, ...rest
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType  = isPassword ? (show ? 'text' : 'password') : type

  return (
    <div className={[s.wrap, error ? s.hasError : ''].join(' ')} style={containerStyle}>
      {label && <label className={s.label}>{label}</label>}
      <div className={s.field}>
        {icon && <span className={s.icon}>{icon}</span>}
        <input
          type={inputType}
          className={[s.input, icon ? s.hasIcon : '', isPassword ? s.hasToggle : '', className].join(' ')}
          {...rest}
        />
        {isPassword && (
          <button type="button" className={s.toggle} onClick={() => setShow(v => !v)} tabIndex={-1}>
            {show ? <Icon.EyeOff width={15} height={15} /> : <Icon.Eye width={15} height={15} />}
          </button>
        )}
      </div>
      {error && <span className={s.error}>{error}</span>}
      {hint && !error && <span className={s.hint}>{hint}</span>}
    </div>
  )
}
