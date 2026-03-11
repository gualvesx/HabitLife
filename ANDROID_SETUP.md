# HabitLife — Guia Completo Android (APK + GitHub Actions)

## Visão geral
O projeto usa **Capacitor** para gerar um APK Android nativo a partir do
código React. A geração do APK é **automática via GitHub Actions** a cada
`push` na branch `main`.

---

## 🚀 Geração automática do APK (GitHub Actions)

O arquivo `.github/workflows/android_build.yml` já está configurado.

**O que ele faz automaticamente:**
1. Instala dependências Node + Java 17 + Android SDK
2. Roda `npm run build` (Vite)
3. Roda `npx cap sync android`
4. Copia `public/alarm.mp3` → `android/app/src/main/res/raw/`
5. Compila o APK com `./gradlew assembleDebug`
6. Cria uma **GitHub Release** com o APK para download direto

**Link permanente para a última versão:**
```
https://github.com/gualvesx/habitlife/releases/latest/download/app-debug.apk
```
> em 3 lugares: `ANDROID_SETUP.md`, `LandingPage.jsx` (2x)

---

## 📋 Configuração inicial (apenas uma vez)

### Pré-requisitos locais
- Node.js 18+
- Android Studio + SDK (para testar localmente)
- Java 17+

### 1. Instalar dependências
```bash
npm install
```

### 2. Build + init Capacitor
```bash
npm run build
npx cap init HabitLife com.habitlife.app --web-dir dist
npx cap add android
```

### 3. Copiar alarm.mp3 para Android
```bash
mkdir -p android/app/src/main/res/raw
cp public/alarm.mp3 android/app/src/main/res/raw/alarm.mp3
```

### 4. Sincronizar e testar localmente
```bash
npm run build
npx cap sync android
npx cap open android    # abre Android Studio
```

---

## 🔄 Fluxo de trabalho diário

```
git add .
git commit -m "nova funcionalidade"
git push origin main
```
→ GitHub Actions compila e publica o APK automaticamente em ~5 minutos.

---

## 📦 Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run build:android` | Build web + copia para Android |
| `npm run open:android` | Abre Android Studio |
| `npm run sync` | Sincroniza plugins Capacitor |

---

## 🔐 APK Release (assinado) — opcional

O workflow atual gera um APK **Debug** (suficiente para distribuição direta).
Para um APK Release assinado (necessário para Play Store), adicione estes
secrets no GitHub: `KEYSTORE_FILE` (base64), `KEY_ALIAS`, `KEY_PASSWORD`, `STORE_PASSWORD`.

---

## 🛡️ Permissões configuradas automaticamente

O `@capacitor/local-notifications` adiciona ao `AndroidManifest.xml`:
- `RECEIVE_BOOT_COMPLETED` — alarmes sobrevivem a reboot
- `SCHEDULE_EXACT_ALARM` — dispara no horário exato
- `POST_NOTIFICATIONS` — notificações (Android 13+)

O usuário autoriza as permissões na **primeira abertura** do app.

---

## 📲 Como instalar o APK no celular

1. Acesse o link de download (no site ou GitHub Releases)
2. No Android: **Configurações → Segurança → Fontes desconhecidas** → Permitir
3. Abra o arquivo `.apk` e toque em Instalar
