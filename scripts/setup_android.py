"""
setup_android.py
Configura o canal de alarme nativo no MainActivity.java
e adiciona permissões no AndroidManifest.xml.
Roda no GitHub Actions após `cap sync android`.
"""
import os, re

# ── 1. MainActivity.java ─────────────────────────────────────────────────────
main_dir = "android/app/src/main/java/com/habitlife/app"
os.makedirs(main_dir, exist_ok=True)

main_java = """\
package com.habitlife.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannels();
        }
    }

    private void createNotificationChannels() {
        NotificationManager nm = getSystemService(NotificationManager.class);

        // Canal de ALARME: toca mesmo com DND, prioridade maxima, uso de alarme
        NotificationChannel alarm = new NotificationChannel(
            "habitlife_alarm",
            "Alarmes HabitLife",
            NotificationManager.IMPORTANCE_HIGH
        );
        alarm.setDescription("Alarmes de habitos e tarefas");
        alarm.enableVibration(true);
        alarm.setVibrationPattern(new long[]{0, 500, 200, 500, 200, 800});
        alarm.setShowBadge(true);
        alarm.setBypassDnd(true);

        Uri alarmUri = Uri.parse(
            "android.resource://" + getPackageName() + "/raw/alarm"
        );
        AudioAttributes audioAttr = new AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build();
        alarm.setSound(alarmUri, audioAttr);
        nm.createNotificationChannel(alarm);

        // Canal de NOTIFICACAO normal
        NotificationChannel notif = new NotificationChannel(
            "habitlife_notif",
            "Lembretes HabitLife",
            NotificationManager.IMPORTANCE_DEFAULT
        );
        notif.setDescription("Lembretes de habitos e tarefas");
        nm.createNotificationChannel(notif);

        System.out.println("Notification channels created");
    }
}
"""

with open(f"{main_dir}/MainActivity.java", "w") as f:
    f.write(main_java)
print("✓ MainActivity.java written")

# ── 2. AndroidManifest.xml — adiciona permissões ─────────────────────────────
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
        manifest = manifest.replace(
            '<application',
            f'{tag}\n    <application',
            1
        )
        print(f"✓ added {perm}")
    else:
        print(f"  already present: {perm}")

# Remove arquivo duplicado de cor se existir
dup = "android/app/src/main/res/values/ic_launcher_colors.xml"
if os.path.exists(dup):
    os.remove(dup)
    print("✓ removed duplicate ic_launcher_colors.xml")

# Sobrescreve ic_launcher_background.xml com nossa cor
bg_dir = "android/app/src/main/res/values"
os.makedirs(bg_dir, exist_ok=True)
with open(f"{bg_dir}/ic_launcher_background.xml", "w") as f:
    f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0A0418</color>\n</resources>\n')
print("✓ ic_launcher_background.xml written")

with open(manifest_path, "w") as f:
    f.write(manifest)
print("✓ AndroidManifest.xml updated")
