import s from './Button.module.css'

const variants = { primary: 'primary', ghost: 'ghost', outline: 'outline', danger: 'danger' }
const sizes    = { sm: 'sm', md: 'md', lg: 'lg' }

export function Button({
  children, variant = 'primary', size = 'md',
  loading = false, fullWidth = false, icon, iconRight,
  className = '', style, ...rest
}) {
  return (
    <button
      className={[
        s.btn,
        s[variant] || s.primary,
        s[size]    || s.md,
        fullWidth  ? s.full : '',
        loading    ? s.loading : '',
        className,
      ].filter(Boolean).join(' ')}
      disabled={loading || rest.disabled}
      style={style}
      {...rest}
    >
      {loading
        ? <span className={s.spinner} />
        : <>
            {icon && <span className={s.iconLeft}>{icon}</span>}
            {children}
            {iconRight && <span className={s.iconRight}>{iconRight}</span>}
          </>
      }
    </button>
  )
}
