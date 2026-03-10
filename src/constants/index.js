export const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
]

export const WEEKDAYS_SHORT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
export const WEEKDAYS_LONG  = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

export const CATEGORIES = {
  study:    { label: 'Estudo',    color: 'blue',   cls: 'cat-study'    },
  activity: { label: 'Esporte',  color: 'green',  cls: 'cat-activity' },
  leisure:  { label: 'Lazer',    color: 'teal',   cls: 'cat-leisure'  },
  health:   { label: 'Saúde',    color: 'red',    cls: 'cat-health'   },
  work:     { label: 'Trabalho', color: 'yellow', cls: 'cat-work'     },
  finance:  { label: 'Finanças', color: 'orange', cls: 'cat-finance'  },
  social:   { label: 'Social',   color: 'purple', cls: 'cat-social'   },
  general:  { label: 'Geral',    color: 'gray',   cls: 'cat-general'  },
}

export const NOTIF_TYPES = {
  achievement: { label: 'Conquista', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)' },
  alarm:       { label: 'Alarme',    gradient: 'linear-gradient(135deg,#fb923c,#f59e0b)' },
  reminder:    { label: 'Lembrete',  gradient: 'linear-gradient(135deg,#60a5fa,#818cf8)' },
  system:      { label: 'Sistema',   gradient: 'linear-gradient(135deg,#a78bfa,#8b5cf6)' },
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard'    },
  { id: 'tasks',     label: 'Rotina'       },
  { id: 'calendar',  label: 'Calendário'   },
  { id: 'timer',     label: 'Timer'        },
  { id: 'stats',     label: 'Estatísticas' },
  { id: 'settings',  label: 'Configurações'},
]
