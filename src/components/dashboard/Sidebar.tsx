import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Timer, 
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardView } from '@/types';

interface SidebarProps {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface NavItem {
  id: DashboardView;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'calendar', label: 'Calendário', icon: Calendar },
  { id: 'timer', label: 'Timer', icon: Timer },
  { id: 'statistics', label: 'Estatísticas', icon: BarChart3 },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function Sidebar({
  currentView,
  onViewChange,
  isOpen,
  onClose,
  className,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen',
          'w-64 bg-white dark:bg-gray-900',
          'border-r border-gray-200 dark:border-gray-800',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="font-semibold text-lg">HabitLife</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    onClose();
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                    'transition-all duration-200',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    isActive && 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                    !isActive && 'text-gray-600 dark:text-gray-400'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5 transition-colors',
                    isActive && 'text-purple-600 dark:text-purple-400'
                  )} />
                  <span className="font-medium">{item.label}</span>
                  
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-600" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="glass-card p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mantenha sua rotina em dia!
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Sistema ativo
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
