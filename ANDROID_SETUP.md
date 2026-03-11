# HabitLife — Compilar para Android

## Pré-requisitos
- Node.js 18+
- Android Studio instalado (com SDK)
- Java 17+

## Passos

### 1. Instalar dependências
```bash
npm install
```

### 2. Build do app web
```bash
npm run build
```

### 3. Inicializar Capacitor (apenas na primeira vez)
```bash
npx cap init HabitLife com.habitlife.app --web-dir dist
npx cap add android
npx cap add ios   # opcional, apenas no macOS
```

### 4. Copiar alarm.mp3 para o Android
O arquivo de alarme precisa estar na pasta de recursos do Android:
```bash
mkdir -p android/app/src/main/res/raw
cp public/alarm.mp3 android/app/src/main/res/raw/alarm.mp3
```

### 5. Sincronizar código
```bash
npm run build
npx cap copy android
```

### 6. Abrir no Android Studio
```bash
npx cap open android
```
No Android Studio: **Run ▶** ou gere um APK em **Build > Build APKs**

---

## Comandos úteis
| Comando | O que faz |
|---|---|
| `npm run build:android` | Build + copia para Android |
| `npm run open:android` | Abre Android Studio |
| `npm run sync` | Sincroniza plugins nativos |

## Permissões (já configuradas automaticamente)
O plugin `@capacitor/local-notifications` adiciona automaticamente ao `AndroidManifest.xml`:
- `RECEIVE_BOOT_COMPLETED` — alarmes sobrevivem a reboot
- `SCHEDULE_EXACT_ALARM` — alarmes no horário exato
- `POST_NOTIFICATIONS` — notificações (Android 13+)

## Nota sobre o alarme
O arquivo `alarm.mp3` em `android/app/src/main/res/raw/` é carregado nativamente
pelo sistema Android, funcionando mesmo com o app fechado ou em modo silencioso
(dependendo das configurações do dispositivo).
