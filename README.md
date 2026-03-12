# 🏋️ HabitLife · Esporte (Open Source)

![Status do Projeto](https://img.shields.io/badge/Status-Open--Source-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)
<img width="1919" height="967" alt="image" src="https://github.com/user-attachments/assets/80325252-0b53-4ca2-b4c1-f3c5843ff3bb" />

O **HabitLife** é um ecossistema **Open Source** de rastreamento de hábitos focado em atletas. Desenvolvido para oferecer **máxima performance e privacidade**, o projeto utiliza **React 18** e **Vite 5**, mantendo uma arquitetura limpa com **zero dependências de UI externas**.

---

# 🌟 Características do Site

O HabitLife foi projetado para ser uma **Single Page Application (SPA)** robusta com foco na experiência do usuário (UX):

* ⚡ **Performance Extrema** — Renderização instantânea sem o peso de frameworks de CSS pesados.
* 🎨 **Design System Próprio** — Interface moderna e responsiva construída do zero com **CSS Modules**.
* 📊 **Analytics de Atleta** — Visualização de progresso através de estatísticas e calendários de consistência.
* ⏱️ **Ferramentas de Treino** — Cronômetro integrado para sessões de foco e exercícios.
* 🔐 **Privacidade Total** — Seus dados pertencem a você. Atualmente, o app utiliza `localStorage` para persistência local rápida.
* 🌓 **Tema Adaptativo** — Suporte nativo a **Light/Dark Mode**, respeitando a preferência do sistema.

---

# 📲 Instalação no Android

Para levar o HabitLife para o seu dispositivo móvel como um aplicativo:

## Opção 1 — WebApp (PWA) ⭐ Recomendado

1. Acesse o site pelo **Google Chrome** no Android.
2. Toque nos **três pontos (⋮)** no canto superior.
3. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. O aplicativo aparecerá na sua gaveta de apps e rodará em **tela cheia**, como um app nativo.

---

## Opção 2 — Build Nativa com Capacitor

Se você é desenvolvedor e deseja gerar um **APK Android**:

```bash
# Adicione o Capacitor ao projeto
npm install @capacitor/core @capacitor/cli @capacitor/android

# Inicialize o Capacitor
npx cap init HabitLife com.exemplo.habitlife

# Gere o build do projeto
npm run build

# Adicione suporte ao Android
npx cap add android

# Copie os arquivos do build
npx cap copy

# Abra no Android Studio
npx cap open android
```

---

# 🛠️ Rodar Localmente (Desenvolvimento)

```bash
# Clone o repositório
git clone https://github.com/gualvesx/HabitLife.git

# Entre na pasta
cd HabitLife

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação ficará disponível em:

```
http://localhost:5173
```

---

# 📂 Estrutura do Projeto

O código é organizado para facilitar a colaboração **Open Source**:

```
src/
├── components/      # Átomos (UI), Layouts e Auth
├── hooks/           # Lógica compartilhada (Auth, Tasks, Notifs, Theme)
├── pages/           # Views principais (Dashboard, Stats, Timer, etc)
├── utils/           # Helpers de data, auth e storage
├── constants/       # Configurações globais e ícones SVG inline
└── styles/          # Design tokens e CSS Global
```

---

# 🤝 Contribua (Open Source)

Este é um projeto **Open Source** — contribuições são bem-vindas!

Você pode:

1. **Fazer um Fork do projeto**
2. Criar uma **Feature Branch**

```bash
git checkout -b feature/NovaFeature
```

3. Fazer commit das alterações
4. Abrir um **Pull Request**

---

⭐ **Se este projeto te ajudou, deixe uma estrela no GitHub!**
