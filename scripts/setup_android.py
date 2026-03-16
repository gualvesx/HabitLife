"""
setup_android.py — configura Android para alarmes reais (AlarmManager) + canais + permissões
"""
import os, re

# ── 1. AlarmPlugin.java — plugin nativo que usa AlarmManager.setAlarmClock() ──
plugin_dir = "android/app/src/main/java/com/habitlife/app"
os.makedirs(plugin_dir, exist_ok=True)

alarm_plugin = """\
package com.habitlife.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "AlarmPlugin")
public class AlarmPlugin extends Plugin {

    public static final String CHANNEL_ALARM = "habitlife_alarm";
    public static final String CHANNEL_NOTIF = "habitlife_notif";

    @Override
    public void load() {
        createChannels();
    }

    private void createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = (NotificationManager)
            getContext().getSystemService(Context.NOTIFICATION_SERVICE);

        // Canal de alarme: bypassa DND, uso ALARM, som do res/raw/alarm
        NotificationChannel alarmCh = new NotificationChannel(
            CHANNEL_ALARM, "Alarmes HabitLife", NotificationManager.IMPORTANCE_HIGH);
        alarmCh.setBypassDnd(true);
        alarmCh.enableVibration(true);
        alarmCh.setVibrationPattern(new long[]{0,400,200,400,200,800});
        alarmCh.setShowBadge(true);
        Uri alarmUri = Uri.parse(
            "android.resource://" + getContext().getPackageName() + "/raw/alarm");
        AudioAttributes aa = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();
        alarmCh.setSound(alarmUri, aa);
        nm.createNotificationChannel(alarmCh);

        // Canal normal para lembretes
        NotificationChannel notifCh = new NotificationChannel(
            CHANNEL_NOTIF, "Lembretes HabitLife", NotificationManager.IMPORTANCE_DEFAULT);
        nm.createNotificationChannel(notifCh);
    }

    // Agenda alarme usando AlarmManager.setAlarmClock() — igual ao despertador nativo
    @PluginMethod
    public void scheduleAlarm(PluginCall call) {
        long triggerMs = call.getLong("triggerMs", 0L);
        int  alarmId   = call.getInt("alarmId", (int)(System.currentTimeMillis() % Integer.MAX_VALUE));
        String title   = call.getString("title", "HabitLife");
        String body    = call.getString("body", "Hora do seu habito!");

        Context ctx = getContext();
        Intent intent = new Intent(ctx, AlarmReceiver.class);
        intent.putExtra("alarmId", alarmId);
        intent.putExtra("title",   title);
        intent.putExtra("body",    body);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
            flags |= PendingIntent.FLAG_IMMUTABLE;

        PendingIntent pi = PendingIntent.getBroadcast(ctx, alarmId, intent, flags);

        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // setAlarmClock = aparece na status bar igual despertador, bypassa Doze
            AlarmManager.AlarmClockInfo clockInfo =
                new AlarmManager.AlarmClockInfo(triggerMs, pi);
            am.setAlarmClock(clockInfo, pi);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, triggerMs, pi);
        }

        JSObject result = new JSObject();
        result.put("scheduled", true);
        result.put("alarmId", alarmId);
        call.resolve(result);
    }

    // Cancela alarme agendado
    @PluginMethod
    public void cancelAlarm(PluginCall call) {
        int alarmId = call.getInt("alarmId", 0);
        Context ctx = getContext();
        Intent intent = new Intent(ctx, AlarmReceiver.class);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
            flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pi = PendingIntent.getBroadcast(ctx, alarmId, intent, flags);
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        am.cancel(pi);
        call.resolve();
    }

    // Verifica se pode agendar alarmes exatos (Android 12+)
    @PluginMethod
    public void canScheduleExact(PluginCall call) {
        JSObject result = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager am = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
            result.put("canSchedule", am.canScheduleExactAlarms());
        } else {
            result.put("canSchedule", true);
        }
        call.resolve(result);
    }

    // Abre configurações de alarmes exatos do app (Android 12+)
    @PluginMethod
    public void openAlarmSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Intent intent = new Intent(
                android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
                Uri.parse("package:" + getContext().getPackageName())
            );
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve();
    }
}
"""

with open(f"{plugin_dir}/AlarmPlugin.java", "w") as f:
    f.write(alarm_plugin)
print("✓ AlarmPlugin.java written")

# ── 2. AlarmReceiver.java — BroadcastReceiver que dispara quando o alarme toca ──
alarm_receiver = """\
package com.habitlife.app;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;

public class AlarmReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent intent) {
        int    alarmId = intent.getIntExtra("alarmId", 0);
        String title   = intent.getStringExtra("title");
        String body    = intent.getStringExtra("body");

        // Wake lock para garantir que o alarme toca com tela desligada
        PowerManager pm = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wl = pm.newWakeLock(
            PowerManager.FULL_WAKE_LOCK |
            PowerManager.ACQUIRE_CAUSES_WAKEUP |
            PowerManager.ON_AFTER_RELEASE,
            "HabitLife:AlarmWakeLock"
        );
        wl.acquire(30000);

        // Intent para abrir o app ao tocar na notificacao
        Intent openApp = ctx.getPackageManager()
            .getLaunchIntentForPackage(ctx.getPackageName());
        if (openApp == null) openApp = new Intent();
        openApp.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
            piFlags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pi = PendingIntent.getActivity(ctx, alarmId, openApp, piFlags);

        Uri alarmUri = Uri.parse(
            "android.resource://" + ctx.getPackageName() + "/raw/alarm");

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(ctx, AlarmPlugin.CHANNEL_ALARM);
        } else {
            builder = new Notification.Builder(ctx);
            builder.setPriority(Notification.PRIORITY_MAX);
            AudioAttributes aa = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build();
            builder.setSound(alarmUri, aa);
            builder.setVibrate(new long[]{0,400,200,400,200,800});
        }

        builder.setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
               .setContentTitle(title != null ? title : "HabitLife")
               .setContentText(body  != null ? body  : "Hora do seu habito!")
               .setContentIntent(pi)
               .setAutoCancel(true)
               .setCategory(Notification.CATEGORY_ALARM)
               .setVisibility(Notification.VISIBILITY_PUBLIC)
               .setOngoing(false);

        NotificationManager nm = (NotificationManager)
            ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        nm.notify(alarmId, builder.build());

        wl.release();
    }
}
"""

with open(f"{plugin_dir}/AlarmReceiver.java", "w") as f:
    f.write(alarm_receiver)
print("✓ AlarmReceiver.java written")

# ── 3. MainActivity.java — registra o plugin ──────────────────────────────────
main_java = """\
package com.habitlife.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AlarmPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
"""

with open(f"{plugin_dir}/MainActivity.java", "w") as f:
    f.write(main_java)
print("✓ MainActivity.java written")

# ── 4. AndroidManifest.xml — permissões + receiver ───────────────────────────
manifest_path = "android/app/src/main/AndroidManifest.xml"
with open(manifest_path, "r") as f:
    manifest = f.read()

permissions = [
    'android.permission.SCHEDULE_EXACT_ALARM',
    'android.permission.USE_EXACT_ALARM',
    'android.permission.VIBRATE',
    'android.permission.WAKE_LOCK',
    'android.permission.RECEIVE_BOOT_COMPLETED',
]
for perm in permissions:
    tag = f'<uses-permission android:name="{perm}" />'
    if perm not in manifest:
        manifest = manifest.replace('<application', f'{tag}\n    <application', 1)
        print(f"✓ permission: {perm}")

# Adiciona o BroadcastReceiver no <application>
receiver_tag = '<receiver android:name=".AlarmReceiver" android:exported="false" />'
if 'AlarmReceiver' not in manifest:
    manifest = manifest.replace('</application>', f'    {receiver_tag}\n    </application>')
    print("✓ AlarmReceiver registered in manifest")

# Remove duplicata de cor se existir
dup = "android/app/src/main/res/values/ic_launcher_colors.xml"
if os.path.exists(dup):
    os.remove(dup)
    print("✓ removed duplicate color file")

# Sobrescreve cor do ícone
bg_dir = "android/app/src/main/res/values"
os.makedirs(bg_dir, exist_ok=True)
with open(f"{bg_dir}/ic_launcher_background.xml", "w") as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0A0418</color>\n</resources>\n')
print("✓ ic_launcher_background.xml written")

with open(manifest_path, "w") as f:
    f.write(manifest)
print("✓ AndroidManifest.xml updated")
print("✓ Android native alarm setup complete")
