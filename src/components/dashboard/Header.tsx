import { Menu, Bell, Plus } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/custom/ThemeToggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
  onAddTask: () => void;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  className?: string;
}

export function Header({
  onMenuClick,
  onAddTask,
  notificationCount = 0,
  onNotificationsClick,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full',
        'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl',
        'border-b border-gray-200 dark:border-gray-800',
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden rounded-xl"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-semibold text-lg hidden sm:block">HabitLife</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl"
            onClick={onNotificationsClick}
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center animate-scale-in">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>
          
          <ThemeToggle />
          
          <Button
            onClick={onAddTask}
            className="btn-primary gap-2 ml-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
