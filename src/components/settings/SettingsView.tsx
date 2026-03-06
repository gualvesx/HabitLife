import { 
  Bell, 
  Volume2, 
  Moon, 
  Sun, 
  Monitor,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useThemeContext } from '@/components/ui/custom/ThemeProvider';
import { AnimatedCard } from '@/components/ui/custom/AnimatedCard';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SettingsViewProps {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  vibrationEnabled: boolean;
  setVibrationEnabled: (enabled: boolean) => void;
  onExportData: () => void;
  onImportData: (data: string) => void;
  onClearAllData: () => void;
}

export function SettingsView({
  notificationsEnabled,
  setNotificationsEnabled,
  soundEnabled,
  setSoundEnabled,
  vibrationEnabled,
  setVibrationEnabled,
  onExportData,
  onImportData,
  onClearAllData,
}: SettingsViewProps) {
  const { theme, setLight, setDark, setSystem } = useThemeContext();

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImportData(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Appearance */}
      <AnimatedCard className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Aparência
        </h3>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-3">Tema</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={setLight}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Sun className="w-6 h-6" />
                <span className="text-sm font-medium">Claro</span>
              </button>

              <button
                onClick={setDark}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Moon className="w-6 h-6" />
                <span className="text-sm font-medium">Escuro</span>
              </button>

              <button
                onClick={setSystem}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  theme === 'system'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <Monitor className="w-6 h-6" />
                <span className="text-sm font-medium">Sistema</span>
              </button>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Notifications */}
      <AnimatedCard className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações</p>
              <p className="text-sm text-gray-500">Receber lembretes de tarefas</p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium">Som</p>
                <p className="text-sm text-gray-500">Tocar som nas notificações</p>
              </div>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
              disabled={!notificationsEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 text-gray-400 flex items-center justify-center">
                <span className="text-xs">📳</span>
              </div>
              <div>
                <p className="font-medium">Vibração</p>
                <p className="text-sm text-gray-500">Vibrar nas notificações</p>
              </div>
            </div>
            <Switch
              checked={vibrationEnabled}
              onCheckedChange={setVibrationEnabled}
              disabled={!notificationsEnabled}
            />
          </div>
        </div>
      </AnimatedCard>

      {/* Data Management */}
      <AnimatedCard className="p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Dados
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Exportar dados</p>
              <p className="text-sm text-gray-500">Baixar backup das suas tarefas</p>
            </div>
            <Button variant="outline" onClick={onExportData}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Importar dados</p>
              <p className="text-sm text-gray-500">Restaurar de um backup</p>
            </div>
            <label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </span>
              </Button>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar todos os dados
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tem certeza?</DialogTitle>
                  <DialogDescription>
                    Esta ação não pode ser desfeita. Todas as suas tarefas, 
                    estatísticas e configurações serão permanentemente removidas.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancelar</Button>
                  <Button variant="destructive" onClick={onClearAllData}>
                    Sim, limpar tudo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </AnimatedCard>

      {/* About */}
      <AnimatedCard className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <span className="text-white font-bold text-xl">H</span>
          </div>
          <div>
            <h3 className="font-semibold">HabitLife</h3>
            <p className="text-sm text-gray-500">Versão 1.0.0</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          HabitLife é seu companheiro para construir hábitos saudáveis 
          e manter uma rotina produtiva. Desenvolvido com 💜 para ajudar 
          você a alcançar seus objetivos.
        </p>
      </AnimatedCard>
    </div>
  );
}
