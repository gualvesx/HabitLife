<div align="center">

<img src="public/logo.svg" alt="HabitLife Logo" width="90" height="90" />

# HabitLife · Evolução

**Rastreamento inteligente de hábitos, tarefas e evolução pessoal**

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.io)
[![Capacitor](https://img.shields.io/badge/Capacitor-6-119eff?style=flat-square&logo=capacitor)](https://capacitorjs.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8?style=flat-square)](https://web.dev/progressive-web-apps)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=flat-square)](https://github.com/gualvesx/HabitLife)

[**🌐 Demo ao vivo**](https://habitlife.ynm.com.br) · [**📱 Baixar APK Android**](https://habitlife.ynm.com.br/downloads/HabitLife.apk) · [**⭐ Deixe uma estrela**](https://github.com/gualvesx/HabitLife)

</div>

---

## ✨ O que é o HabitLife?

HabitLife é uma aplicação web **open source** para rastreamento de hábitos e tarefas com foco em evolução pessoal. Combina a acessibilidade de um app web com o poder de um aplicativo nativo Android — funciona no navegador, pode ser instalada como PWA no desktop e iOS, e tem um APK nativo para Android com alarmes reais do sistema operacional.

> *"Somos o que repetidamente fazemos. Portanto, a excelência não é um ato, mas um hábito."*  
> — Aristóteles

---

## 🚀 Funcionalidades

### 📋 Hábitos & Tarefas
- **Criação de hábitos** com frequência configurável: diariamente, semanalmente, mensalmente ou dias específicos da semana
- **Criação de tarefas** que aparecem todo dia até serem concluídas (`daily_until_done`)
- **Metas quantitativas** com unidade personalizada (ml, km, páginas, minutos...)
- **Categorias** com cores distintas: Estudo, Esporte, Lazer, Saúde, Trabalho, Finanças, Social, Geral
- **Prioridades** Alta, Média e Baixa para tarefas
- **Edição e exclusão** de qualquer hábito ou tarefa a qualquer momento
- **Notas e descrições** adicionais por tarefa

### ⏰ Alarmes & Notificações
- **Alarme nativo Android** via `AlarmManager.setAlarmClock()` — idêntico ao despertador do sistema, toca com tela bloqueada, app fechado e modo Doze ativo
- **Canal de alarme dedicado** com `USAGE_ALARM` + `bypassDnd` — bypassa modo Não Perturbe
- **Lembretes antecipados** configuráveis: 15min, 30min, 1h, 2h antes do horário
- **Lembrete diário** em horário fixo tanto para hábitos quanto para tarefas
- **Notificações push** via Service Worker (web) e `@capacitor/local-notifications` (nativo)
- **Tipos de alerta por item**: Nenhum, Notificação, Alarme, ou Ambos
- Pedido automático de permissões na primeira abertura do app

### ⏱️ Timer de Foco
- **5 modos**: Pomodoro (25min), Pausa Curta (5min), Pausa Longa (15min), Foco Profundo (90min) e Personalizado
- **Sons ambiente** opcionais: chuva, café, floresta, ondas
- **Vinculação de tarefa** ao timer para registro automático de sessão de foco
- **Histórico de sessões** com estatísticas acumuladas
- Alarme/notificação ao término de cada sessão

### 📅 Calendário
- Visualização mensal com indicadores de tarefas por dia
- Navegação entre meses com transições suaves
- Adição de tarefas diretamente pelo calendário

### 📊 Estatísticas
- Gráficos de conclusão de hábitos e tarefas
- Histórico de sessões de foco com duração total
- Progresso de metas quantitativas
- Streaks (sequências) atual e recorde

### 🎯 Dashboard
- Visão geral do dia com todas as tarefas e hábitos ativos
- Progresso em tempo real de metas com botões de incremento
- Indicadores visuais de categoria e prioridade
- Ações rápidas de editar e excluir inline

### ⚙️ Configurações
- Tema escuro/claro com persistência
- Controle de notificações: toggles, teste de notificação e teste de alarme
- Exportação de dados em JSON (backup completo)
- Instalação do app (PWA no desktop/iOS, APK no Android)
- Gestão de conta e perfil

---

## 📱 PWA — Progressive Web App

HabitLife é um **PWA completo**, funcionando como aplicativo nativo direto no navegador — sem precisar de loja de apps.

### Instalar no Desktop (Chrome / Edge)
1. Acesse [habitlife.ynm.com.br](https://habitlife.ynm.com.br)
2. Clique no ícone de instalação na barra de endereço
3. Clique em **Instalar** — o app abre como janela independente

### Instalar no iPhone / iPad (Safari)
1. Acesse o site no Safari
2. Toque no botão de compartilhar (**⬆️**)
3. Selecione **"Adicionar à Tela de Início"**

### O que o PWA oferece
| Recurso | Disponível |
|---------|-----------|
| Funciona offline | ✅ Service Worker com cache |
| Instalável na tela inicial | ✅ |
| Notificações push | ✅ via Service Worker |
| Ícone personalizado | ✅ |
| Tela de splash | ✅ |
| Tema integrado ao sistema | ✅ |
| Atualizações automáticas | ✅ |

---

## 🤖 App Android Nativo (APK)

Além do PWA, HabitLife tem um **APK Android nativo** compilado via Capacitor, com capacidades que superam o que a web permite:

### [⬇️ Baixar HabitLife.apk](https://habitlife.ynm.com.br/downloads/HabitLife.apk)

**Para instalar:**
1. Baixe o arquivo `.apk`
2. Android: Configurações → Segurança → **Permitir fontes desconhecidas**
3. Abra o arquivo e toque em **Instalar**

### PWA vs APK Android

| Recurso | PWA Web | APK Android |
|---------|:-------:|:-----------:|
| Alarme com tela bloqueada | ❌ | ✅ |
| Alarme com app fechado | ❌ | ✅ |
| Bypassa modo Não Perturbe | ❌ | ✅ |
| Ícone de despertador na status bar | ❌ | ✅ |
| Wake Lock (acorda a tela) | ❌ | ✅ |
| Vibração nativa | Parcial | ✅ |
| Notificações push | ✅ | ✅ |
| Funciona offline | ✅ | ✅ |
| Instalação sem loja | ✅ | ✅ |

### Build automático via GitHub Actions

O APK é compilado e publicado automaticamente a cada `git push` na branch `main`:

```
git push origin main
     ↓
GitHub Actions
     ↓
npm build → cap sync → gradlew assembleDebug → HabitLife.apk
     ↓
GitHub Release (download direto)
```

Para ativar, adicione os secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no repositório em **Settings → Secrets → Actions**.

---

## 🏗️ Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| UI / Frontend | React | 18 |
| Build tool | Vite | 5 |
| Estilização | CSS Modules | — |
| Animações 3D | Three.js | r163 |
| Backend & Auth | Supabase | — |
| Banco de dados | PostgreSQL (via Supabase) | — |
| App nativo | Capacitor | 6 |
| Alarmes Android | AlarmManager (plugin customizado) | — |
| Notificações | @capacitor/local-notifications | 6 |
| PWA | Service Worker + Web App Manifest | — |
| CI/CD | GitHub Actions | — |
| Hospedagem | Apache (Hostgator) | — |

---

## 🗂️ Estrutura do Projeto

```
habitlife/
├── public/
│   ├── alarm.mp3              # Som do alarme nativo
│   ├── logo.svg               # Logo vetorial
│   ├── icon-192.png           # Ícone PWA 192×192
│   ├── icon-512.png           # Ícone PWA 512×512
│   ├── manifest.json          # Manifesto PWA
│   ├── sw.js                  # Service Worker (cache + notificações)
│   ├── .htaccess              # Apache: MIME types, SPA routing, APK download
│   └── downloads/
│       └── HabitLife.apk      # APK para download direto
│
├── src/
│   ├── App.jsx                # Roteamento principal + controle de auth
│   ├── main.jsx               # Ponto de entrada + captura do PWA install prompt
│   │
│   ├── hooks/
│   │   ├── useAuth.js         # Autenticação Supabase (login, register, logout)
│   │   ├── useTasks.js        # CRUD completo de tarefas + mapeamento DB↔frontend
│   │   ├── useNativeAlarm.js  # Alarmes nativos via AlarmManager + fallback web
│   │   ├── useNotifs.js       # Notificações in-app (painel de notificações)
│   │   └── useTheme.js        # Tema escuro/claro com persistência
│   │
│   ├── pages/
│   │   ├── LandingPage.jsx    # Página inicial com partículas Three.js + cérebro 3D
│   │   ├── AppShell.jsx       # Shell do app: sidebar, header, checker de alarmes
│   │   ├── DashboardPage.jsx  # Dashboard com tarefas do dia
│   │   ├── TasksPage.jsx      # Rotina diária (lista por data)
│   │   ├── CalendarPage.jsx   # Calendário mensal
│   │   ├── TimerPage.jsx      # Timer de foco com sons ambiente
│   │   ├── StatsPage.jsx      # Estatísticas e gráficos
│   │   └── SettingsPage.jsx   # Configurações do app
│   │
│   ├── components/
│   │   ├── tasks/
│   │   │   └── AddItemModal.jsx  # Modal criar/editar hábito ou tarefa
│   │   ├── ui/
│   │   │   ├── Brain3D.jsx       # Modelo 3D do cérebro (GLB via Three.js)
│   │   │   ├── AlarmModal.jsx    # Modal de alarme visual (web)
│   │   │   └── PWABanner.jsx     # Banner de instalação (detecta plataforma)
│   │   └── layout/
│   │       ├── Header.jsx
│   │       ├── Sidebar.jsx
│   │       └── NotifPanel.jsx
│   │
│   └── utils/
│       ├── supabase.js        # Cliente Supabase com safeStorage (iOS compat.)
│       └── date.js            # Utilitários de data
│
├── scripts/
│   ├── setup_android.py       # Gera MainActivity, AlarmPlugin, permissões
│   └── generate_icons.py      # Gera ícones mipmap Android de todos os tamanhos
│
├── .github/
│   └── workflows/
│       └── android_build.yml  # CI/CD: build automático do APK
│
├── capacitor.config.json      # Config Capacitor (appId, webDir, plugins)
├── vite.config.js             # Config Vite
└── package.json
```

---

## 🗄️ Schema do Banco (Supabase / PostgreSQL)

```sql
-- Tarefas e hábitos
tasks (
  id              uuid PRIMARY KEY,
  user_id         uuid REFERENCES auth.users,
  name            text NOT NULL,
  category        text CHECK (category IN ('study','activity','leisure','health','work','finance','social','general')),
  date            date,
  end_date        date,
  time            time,
  is_done         boolean DEFAULT false,
  description     text,
  priority        integer DEFAULT 2,        -- 1=Alta, 2=Média, 3=Baixa
  frequency_type  text,                     -- 'daily' | 'weekly' | 'monthly' | 'specific_days' | 'daily_until_done'
  frequency_days  jsonb,                    -- array de dias [0=Dom ... 6=Sáb]
  frequency_interval integer DEFAULT 1,
  goal_value      numeric DEFAULT 0,
  current_value   numeric DEFAULT 0,
  goal_step       numeric DEFAULT 1,
  goal_unit       text,
  project         text,
  subtasks        jsonb,
  reminders       jsonb,                    -- horários de lembrete ['08:00', '15min', ...]
  alert           text DEFAULT 'none',      -- 'none' | 'system' | 'alarm' | 'both'
  xp_value        integer DEFAULT 10,
  created_at      timestamptz DEFAULT now()
);

-- Perfis de usuário
profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users,
  full_name       text,
  avatar_url      text,
  xp              integer DEFAULT 0,
  level           integer DEFAULT 1,
  coins           integer DEFAULT 0,
  best_streak     integer DEFAULT 0,
  current_streak  integer DEFAULT 0,
  theme_dark      boolean DEFAULT true,
  notif_enabled   boolean DEFAULT true
);

-- Sessões de foco
focus_sessions (
  id               uuid PRIMARY KEY,
  user_id          uuid REFERENCES auth.users,
  task_id          uuid REFERENCES tasks,
  duration_minutes integer,
  started_at       timestamptz DEFAULT now()
);
```

---

## ⚙️ Rodando Localmente

### Pré-requisitos
- Node.js 18+
- Conta no [Supabase](https://supabase.io) (plano gratuito)

### Passo a passo

```bash
# 1. Clone
git clone https://github.com/gualvesx/HabitLife.git
cd HabitLife

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais Supabase:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...

# 4. Inicie o servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:5173

# 5. Build para produção
npm run build
# Arquivos gerados em /dist
```

### Build Android (local)

```bash
npm run build
npx cap add android      # apenas na primeira vez
npx cap sync android

# Copiar som do alarme para recursos nativos
mkdir -p android/app/src/main/res/raw
cp public/alarm.mp3 android/app/src/main/res/raw/alarm.mp3

# Abrir no Android Studio e compilar o APK
npx cap open android
```

---

## 🤝 Contribuindo

HabitLife é **open source** e contribuições são muito bem-vindas!

```bash
# Fork → Clone → Branch → Commit → Push → Pull Request
git checkout -b feature/minha-feature
git commit -m "feat: descrição da minha feature"
git push origin feature/minha-feature
```

### Ideias de contribuição
- 🌍 Tradução para outros idiomas (EN, ES)
- 🎨 Novos temas de cores
- 📊 Novos tipos de visualização nas estatísticas
- 🔔 Integração com Google Calendar
- 🧪 Testes automatizados (Vitest + Playwright)
- 🐛 Correção de bugs e melhorias de performance
- 📖 Melhoria da documentação

### Diretrizes
- Siga o padrão de código existente (CSS Modules, hooks customizados)
- Commits em português ou inglês com prefixo semântico (`feat:`, `fix:`, `docs:`)
- Abra uma issue antes de grandes mudanças para alinhar direção

---

## 📄 Licença

```
MIT License

Copyright (c) 2025 gualvesx

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

Veja o arquivo [LICENSE](LICENSE) para o texto completo.

---

## 👤 Autor

Desenvolvido com ❤️ por **[gualvesx](https://github.com/gualvesx)**

---

<div align="center">

**[🌐 habitlife.ynm.com.br](https://habitlife.ynm.com.br)** · **[📱 Baixar APK](https://habitlife.ynm.com.br/downloads/HabitLife.apk)** · **[⭐ GitHub](https://github.com/gualvesx/HabitLife)**

*Se este projeto te ajudou, deixe uma ⭐ — faz diferença!*

</div>
