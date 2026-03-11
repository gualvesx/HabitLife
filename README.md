# HabitLife · Esporte

App de rastreamento de hábitos para atletas. React 18 + Vite 5, zero dependências de UI externas.

## Rodar localmente

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Estrutura do projeto

```
src/
├── App.jsx                      # Root — roteamento login ↔ app
├── main.jsx                     # Entry point
├── styles/
│   └── globals.css              # Design tokens (CSS vars), reset, keyframes
├── constants/
│   ├── index.js                 # MONTHS, CATEGORIES, NAV_ITEMS, etc.
│   └── icons.jsx                # Todos os ícones SVG inline
├── utils/
│   ├── storage.js               # Abstração do localStorage
│   ├── auth.js                  # Helpers de autenticação
│   ├── date.js                  # Funções de data
│   └── capitalize.js
├── hooks/
│   ├── useTheme.js              # Tema claro/escuro persistido
│   ├── useAuth.js               # Login, cadastro, sessão
│   ├── useTasks.js              # CRUD de tarefas + persistência
│   └── useNotifs.js             # Estado de notificações
├── components/
│   ├── ui/                      # Átomos reutilizáveis
│   │   ├── Button.jsx / .module.css
│   │   ├── Input.jsx  / .module.css
│   │   ├── Modal.jsx  / .module.css
│   │   ├── Toggle.jsx / .module.css
│   │   └── Card.jsx   / .module.css
│   ├── layout/                  # Estrutura da página
│   │   ├── Header.jsx / .module.css
│   │   ├── Sidebar.jsx / .module.css
│   │   └── NotifPanel.jsx / .module.css
│   ├── auth/                    # Fluxo de autenticação
│   │   ├── AuthPage.jsx / .module.css
│   │   ├── LoginForm.jsx / AuthForm.module.css
│   │   └── RegisterForm.jsx
│   └── tasks/
│       └── TaskModal.jsx / .module.css
└── pages/
    ├── AppShell.jsx / .module.css   # Shell do app autenticado
    ├── DashboardPage.jsx / .module.css
    ├── TasksPage.jsx / .module.css
    ├── CalendarPage.jsx / .module.css
    ├── TimerPage.jsx / .module.css
    ├── StatsPage.jsx / .module.css
    └── SettingsPage.jsx / .module.css
```

## Expandir

| O que adicionar         | Onde mexer                        |
|-------------------------|-----------------------------------|
| Nova página             | `src/pages/` + `constants/index.js` (NAV_ITEMS) |
| Novo componente UI      | `src/components/ui/`              |
| Nova rota/seção         | `AppShell.jsx`                    |
| Nova variável de tema   | `styles/globals.css`              |
| Novo ícone              | `constants/icons.jsx`             |
| API real (backend)      | `utils/storage.js` → trocar por fetch |
| Auth real               | `hooks/useAuth.js`                |

## Tecnologias

- **React 18** · **Vite 5** · **CSS Modules** · **localStorage**
- Zero bibliotecas de UI externas — tudo feito do zero
