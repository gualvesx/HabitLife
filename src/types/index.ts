// Categorias de tarefas/hábitos
export type TaskCategory = 'leisure' | 'study' | 'freestudy' | 'activity';

// Tipo de recorrência
export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'custom';

// Status da tarefa
export type TaskStatus = 'pending' | 'completed' | 'skipped';

// Interface de Categoria
export interface Category {
  id: TaskCategory;
  name: string;
  namePt: string;
  icon: string;
  color: string;
  bgColor: string;
}

// Interface de Lembrete/Notificação
export interface Reminder {
  id: string;
  time: string; // formato HH:mm
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

// Interface de Tarefa/Hábito
export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  
  // Datas
  startDate: string; // formato YYYY-MM-DD
  endDate?: string; // formato YYYY-MM-DD (opcional)
  recurrence: RecurrenceType;
  customDays?: number; // para recorrência customizada
  selectedDays?: number[]; // 0-6 (domingo-sábado) para weekly
  
  // Horário
  time?: string; // formato HH:mm
  duration?: number; // em minutos
  
  // Lembretes
  reminders: Reminder[];
  alarmEnabled: boolean;
  
  // Metadados
  createdAt: string;
  updatedAt: string;
  completedDates: string[]; // datas em que foi completada
  streak: number;
  bestStreak: number;
}

// Interface de Progresso Diário
export interface DailyProgress {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

// Interface de Estatísticas
export interface Statistics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
  weeklyProgress: DailyProgress[];
  monthlyProgress: DailyProgress[];
  categoryBreakdown: {
    category: TaskCategory;
    count: number;
    completed: number;
  }[];
}

// Interface de Configurações do Usuário
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  defaultReminderTime: string;
  language: 'pt' | 'en';
}

// Interface de Timer/Pomodoro
export interface TimerSession {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  duration: number; // em minutos
  type: 'focus' | 'break' | 'longBreak';
}

// Interface de Notificação
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'alarm' | 'achievement' | 'system';
  timestamp: string;
  read: boolean;
  taskId?: string;
}

// Props comuns para componentes
export interface BaseProps {
  className?: string;
}

// Tipo para view do dashboard
export type DashboardView = 'dashboard' | 'calendar' | 'tasks' | 'statistics' | 'timer' | 'settings';

// Interface para evento de calendário
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  category: TaskCategory;
  status: TaskStatus;
  taskId: string;
}
