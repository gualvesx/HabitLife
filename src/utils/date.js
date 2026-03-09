export const dateKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

export const todayKey = () => {
  const n = new Date()
  return dateKey(n.getFullYear(), n.getMonth(), n.getDate())
}

export const relativeTime = ts => {
  const s = (Date.now() - ts) / 1000
  if (s < 60)    return 'Agora'
  if (s < 3600)  return `${Math.floor(s / 60)}m atrás`
  if (s < 86400) return `${Math.floor(s / 3600)}h atrás`
  return `${Math.floor(s / 86400)}d atrás`
}

export const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

export const formatDate = (y, m, d, opts = {}) =>
  new Date(y, m, d).toLocaleDateString('pt-BR', opts)
