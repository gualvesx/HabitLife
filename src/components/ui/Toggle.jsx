import s from './Toggle.module.css'

export function Toggle({ on, onToggle, label, sub }) {
  return (
    <div className={s.row}>
      {(label || sub) && (
        <div>
          {label && <div className={s.label}>{label}</div>}
          {sub   && <div className={s.sub}>{sub}</div>}
        </div>
      )}
      <button
        className={[s.toggle, on ? s.on : s.off].join(' ')}
        onClick={onToggle}
        role="switch"
        aria-checked={on}
      />
    </div>
  )
}
