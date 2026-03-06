import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatar data para exibição
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };
  return d.toLocaleDateString('pt-BR', defaultOptions);
}

// Formatar hora
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

// Obter nome do dia da semana
export function getDayName(date: string | Date, short: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const days = short 
    ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    : ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[d.getDay()];
}

// Obter data atual no formato YYYY-MM-DD
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Verificar se duas datas são o mesmo dia
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  return d1.toDateString() === d2.toDateString();
}

// Adicionar dias a uma data
export function addDays(date: string | Date, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

// Gerar array de datas
export function generateDateRange(start: string | Date, days: number): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < days; i++) {
    dates.push(addDays(start, i));
  }
  return dates;
}

// Calcular porcentagem
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Capitalizar primeira letra
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Gerar cor a partir de string
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

// Debounce function
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Verificar se é dispositivo móvel
export function isMobile(): boolean {
  return window.innerWidth < 768;
}

// Verificar se está no modo escuro
export function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
}

// Salvar arquivo para download
export function downloadFile(content: string, filename: string, type: string = 'text/plain'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Ler arquivo
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Gerar ID único
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Categorias com suas configurações
export const categories = {
  leisure: {
    id: 'leisure' as const,
    name: 'Lazer',
    namePt: 'Lazer',
    icon: 'Gamepad2',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  study: {
    id: 'study' as const,
    name: 'Estudos',
    namePt: 'Estudos',
    icon: 'BookOpen',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  freestudy: {
    id: 'freestudy' as const,
    name: 'Estudos Livres',
    namePt: 'Estudos Livres',
    icon: 'Lightbulb',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  activity: {
    id: 'activity' as const,
    name: 'Atividade',
    namePt: 'Atividade',
    icon: 'Dumbbell',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    borderColor: 'border-rose-200 dark:border-rose-800',
  },
};

// Tipos de recorrência
export const recurrenceTypes = {
  once: { id: 'once' as const, name: 'Uma vez', namePt: 'Uma vez' },
  daily: { id: 'daily' as const, name: 'Diariamente', namePt: 'Diariamente' },
  weekly: { id: 'weekly' as const, name: 'Semanalmente', namePt: 'Semanalmente' },
  custom: { id: 'custom' as const, name: 'Personalizado', namePt: 'Personalizado' },
};

// Dias da semana
export const weekDays = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Segunda', short: 'Seg' },
  { id: 2, name: 'Terça', short: 'Ter' },
  { id: 3, name: 'Quarta', short: 'Qua' },
  { id: 4, name: 'Quinta', short: 'Qui' },
  { id: 5, name: 'Sexta', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
];
