import { useState } from 'react';
import { 
  Check, 
  Clock, 
  Bell, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';
import type { Task } from '@/types';
import { cn, categories, formatTime } from '@/lib/utils';
import { AnimatedCard } from '@/components/ui/custom/AnimatedCard';
import { Confetti } from '@/components/ui/custom/Confetti';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onSkip: (id: string) => void;
  className?: string;
}

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onSkip,
  className,
}: TaskCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const category = categories[task.category];
  const hasReminder = task.reminders.some(r => r.enabled);
  const hasAlarm = task.alarmEnabled;

  const handleToggle = () => {
    if (task.status !== 'completed') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }
    onToggle(task.id);
  };

  const isCompleted = task.status === 'completed';
  const isSkipped = task.status === 'skipped';

  return (
    <>
      <Confetti trigger={showConfetti} />
      
      <AnimatedCard
        className={cn(
          'p-4 transition-all duration-300',
          isCompleted && 'opacity-60',
          className
        )}
        spotlight
      >
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={handleToggle}
            className={cn(
              'flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 checkbox-bounce',
              'flex items-center justify-center',
              isCompleted
                ? 'bg-emerald-500 border-emerald-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-500'
            )}
          >
            {isCompleted && <Check className="w-4 h-4 text-white" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  className={cn(
                    'font-medium text-gray-900 dark:text-gray-100 transition-all',
                    isCompleted && 'line-through text-gray-500'
                  )}
                >
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {/* Category badge */}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                      category.bgColor,
                      category.color
                    )}
                  >
                    {category.namePt}
                  </span>

                  {/* Time */}
                  {task.time && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatTime(task.time)}
                    </span>
                  )}

                  {/* Reminder indicator */}
                  {hasReminder && (
                    <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                      <Bell className="w-3 h-3" />
                    </span>
                  )}

                  {/* Alarm indicator */}
                  {hasAlarm && (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      {task.alarmEnabled ? (
                        <Volume2 className="w-3 h-3" />
                      ) : (
                        <VolumeX className="w-3 h-3" />
                      )}
                    </span>
                  )}

                  {/* Streak */}
                  {task.streak > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                      🔥 {task.streak}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  {!isCompleted && !isSkipped && (
                    <DropdownMenuItem onClick={() => onSkip(task.id)} className="cursor-pointer">
                      <SkipForward className="w-4 h-4 mr-2" />
                      Pular hoje
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDelete(task.id)} 
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </>
  );
}
