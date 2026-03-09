export function LogoIcon({ size = 32, className = '' }) {
  return (
    <img
      src="/logo.svg"
      alt="HabitLife"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', objectFit: 'contain', userSelect: 'none' }}
      draggable={false}
    />
  )
}
