# 🏋️ HabitLife · Esporte (Open Source)

![Status do Projeto](https://img.shields.io/badge/Status-Open--Source-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)

O **HabitLife** é um ecossistema **Open Source** de rastreamento de hábitos focado em atletas. Desenvolvido para oferecer máxima performance e privacidade, o projeto utiliza **React 18** e **Vite 5**, mantendo uma arquitetura limpa com **zero dependências de UI externas**.

---

## 🌟 Características do Site

O HabitLife foi projetado para ser uma **Single Page Application (SPA)** robusta com foco na experiência do usuário (UX):

* **⚡ Performance Extrema:** Renderização instantânea sem o peso de frameworks de CSS pesados.
* **🎨 Design System Próprio:** Interface moderna e responsiva construída do zero com CSS Modules.
* **📊 Analytics de Atleta:** Visualização de progresso através de estatísticas e calendários de consistência.
* **⏱️ Ferramentas de Treino:** Cronômetro integrado para sessões de foco e exercícios.
* **🔐 Privacidade Total:** Seus dados pertencem a você. Atualmente, o app utiliza `localStorage` para persistência local rápida.
* **🌓 Tema Adaptativo:** Suporte nativo a Light/Dark mode que respeita a preferência do sistema.

---

## 📲 Instalação no Android

Para levar o HabitLife para o seu dispositivo móvel como um aplicativo nativo:

### Opção 1: WebApp (PWA) - Recomendado
1. Acesse o site pelo **Google Chrome** no Android.
2. Toque nos **três pontos (⋮)** no canto superior.
3. Selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.
4. O app agora terá um ícone na sua gaveta de aplicativos e rodará em tela cheia.

### Opção 2: Build Nativa com Capacitor
Se você é desenvolvedor e deseja gerar um APK:
```bash
# Adicione o Capacitor ao projeto
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init HabitLife com.exemplo.habitlife
npm run build
npx cap add android
npx cap copy
npx cap open android
```
🛠️ Rodar Localmente (Desenvolvimento)Bash# Clone o repositório
git clone [https://github.com/gualvesx/HabitLife.git](https://github.com/gualvesx/HabitLife.git)

# Instale as dependências
npm install

# Inicie o servidor dev
npm run dev
# → Local: http://localhost:5173
📂 Estrutura do ProjetoO código é organizado para facilitar a colaboração Open Source:Plaintextsrc/
├── components/          # Átomos (UI), Layouts e Auth
├── hooks/               # Lógica compartilhada (Auth, Tasks, Notifs, Theme)
├── pages/               # Views principais (Dashboard, Stats, Timer, etc)
├── utils/               # Helpers de data, auth e storage
├── constants/           # Configurações globais e ícones SVG inline
└── styles/              # Design tokens e CSS Global
🤝 Contribua (Open Source)Este é um projeto de código aberto! Sinta-se à vontade para:Fazer um Fork do projeto.Criar uma Feature Branch (git checkout -b feature/NovaFeature).Comitar suas mudanças (git commit -m 'Add: Nova Feature').Dar um Push na Branch (git push origin feature/NovaFeature).Abrir um Pull Request.🛠️ Guia de ExpansãoO que adicionarOnde mexerNova páginasrc/pages/ + constants/index.jsNovo componente UIsrc/components/ui/API real (backend)utils/storage.js → trocar para fetchNova variável de temastyles/globals.css⭐ Se este projeto te ajudou, deixe uma estrela no GitHub!
Deseja que eu adicione alguma seção específica sobre como configurar testes automatizados ou integraçã
