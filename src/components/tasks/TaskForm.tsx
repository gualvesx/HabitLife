import { useState, useEffect } from 'react';
import { X, Plus, Bell, Volume2, VolumeX } from 'lucide-react';
import type { Task, TaskCategory, RecurrenceType, Reminder } from '@/types';
import { cn, categories, weekDays, recurrenceTypes, generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface TaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedDates' | 'streak' | 'bestStreak'>) => void;
  initialTask?: Task | null;
}

const defaultReminders: Reminder[] = [
  { id: generateId(), time: '08:00', enabled: true, soundEnabled: false, vibrationEnabled: true },
];

export function TaskForm({ isOpen, onClose, onSubmit, initialTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('study');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('daily');
  const [customDays, setCustomDays] = useState(2);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [reminders, setReminders] = useState<Reminder[]>(defaultReminders);
  const [alarmEnabled, setAlarmEnabled] = useState(false);

  // Preencher formulário ao editar
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCategory(initialTask.category);
      setStartDate(initialTask.startDate);
      setEndDate(initialTask.endDate || '');
      setHasEndDate(!!initialTask.endDate);
      setRecurrence(initialTask.recurrence);
      setCustomDays(initialTask.customDays || 2);
      setSelectedDays(initialTask.selectedDays || [1, 2, 3, 4, 5]);
      setTime(initialTask.time || '');
      setDuration(initialTask.duration || 30);
      setReminders(initialTask.reminders.length > 0 ? initialTask.reminders : defaultReminders);
      setAlarmEnabled(initialTask.alarmEnabled);
    } else {
      // Resetar para valores padrão
      setTitle('');
      setDescription('');
      setCategory('study');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setHasEndDate(false);
      setRecurrence('daily');
      setCustomDays(2);
      setSelectedDays([1, 2, 3, 4, 5]);
      setTime('');
      setDuration(30);
      setReminders(defaultReminders);
      setAlarmEnabled(false);
    }
  }, [initialTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      title,
      description,
      category,
      status: 'pending',
      startDate,
      endDate: hasEndDate ? endDate : undefined,
      recurrence,
      customDays: recurrence === 'custom' ? customDays : undefined,
      selectedDays: recurrence === 'weekly' ? selectedDays : undefined,
      time: time || undefined,
      duration,
      reminders,
      alarmEnabled,
    });
    
    onClose();
  };

  const addReminder = () => {
    setReminders([...reminders, {
      id: generateId(),
      time: '09:00',
      enabled: true,
      soundEnabled: false,
      vibrationEnabled: true,
    }]);
  };

  const updateReminder = (id: string, updates: Partial<Reminder>) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort()
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialTask ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Estudar inglês"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes sobre a tarefa..."
              rows={3}
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(categories).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border-2 transition-all',
                    category === cat.id
                      ? cn('border-purple-500 bg-purple-50 dark:bg-purple-900/20', cat.color)
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  )}
                >
                  <span className={cn('w-2 h-2 rounded-full', cat.bgColor.replace('/30', '').replace('bg-', 'bg-'))} />
                  {cat.namePt}
                </button>
              ))}
            </div>
          </div>

          {/* Datas */}
          <div className="space-y-4">
            <Label>Datas</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500">Data de início *</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-500">Data de fim</Label>
                  <Switch
                    checked={hasEndDate}
                    onCheckedChange={setHasEndDate}
                  />
                </div>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={!hasEndDate}
                  min={startDate}
                />
              </div>
            </div>
          </div>

          {/* Recorrência */}
          <div className="space-y-4">
            <Label>Recorrência</Label>
            
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as RecurrenceType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(recurrenceTypes).map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.namePt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Dias personalizados */}
            {recurrence === 'custom' && (
              <div className="flex items-center gap-2">
                <Label className="text-sm whitespace-nowrap">A cada</Label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={customDays}
                  onChange={(e) => setCustomDays(Number(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">dias</span>
              </div>
            )}

            {/* Dias da semana */}
            {recurrence === 'weekly' && (
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      'w-10 h-10 rounded-lg text-sm font-medium transition-all',
                      selectedDays.includes(day.id)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    )}
                  >
                    {day.short.charAt(0)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Horário e Duração */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={480}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Lembretes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Lembretes
              </Label>
              <Button type="button" variant="ghost" size="sm" onClick={addReminder}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Input
                    type="time"
                    value={reminder.time}
                    onChange={(e) => updateReminder(reminder.id, { time: e.target.value })}
                    className="w-24"
                  />
                  
                  <Switch
                    checked={reminder.enabled}
                    onCheckedChange={(checked) => updateReminder(reminder.id, { enabled: checked })}
                  />
                  
                  <button
                    type="button"
                    onClick={() => updateReminder(reminder.id, { soundEnabled: !reminder.soundEnabled })}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      reminder.soundEnabled ? 'text-purple-600 bg-purple-100' : 'text-gray-400'
                    )}
                  >
                    {reminder.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  {reminders.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReminder(reminder.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Alarme */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              <div>
                <Label className="text-sm font-medium">Alarme sonoro</Label>
                <p className="text-xs text-gray-500">Tocar alarme no horário da tarefa</p>
              </div>
            </div>
            <Switch
              checked={alarmEnabled}
              onCheckedChange={setAlarmEnabled}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 btn-primary">
              {initialTask ? 'Salvar' : 'Criar Tarefa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
