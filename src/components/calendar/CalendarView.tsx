import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import type { Task } from '@/types';
import { cn, categories, getToday, isSameDay, formatDate } from '@/lib/utils';
import { AnimatedCard } from '@/components/ui/custom/AnimatedCard';
import { Button } from '@/components/ui/button';

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(getToday());

  // Navegação do calendário
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(getToday());
  };

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];
    
    // Dias do mês anterior
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false,
      });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    // Dias do próximo mês
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [currentDate]);

  // Obter tarefas para uma data específica
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    return tasks.filter(task => {
      // Verificar se está no período da tarefa
      if (task.startDate > dateStr) return false;
      if (task.endDate && task.endDate < dateStr) return false;
      
      // Verificar recorrência
      switch (task.recurrence) {
        case 'once':
          return task.startDate === dateStr;
        case 'daily':
          return true;
        case 'weekly':
          return task.selectedDays?.includes(dayOfWeek) ?? false;
        case 'custom':
          if (!task.customDays) return false;
          const start = new Date(task.startDate);
          const diffDays = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays % task.customDays === 0;
        default:
          return false;
      }
    });
  };

  // Tarefas do dia selecionado
  const selectedDateTasks = useMemo(() => {
    const date = new Date(selectedDate);
    return getTasksForDate(date);
  }, [selectedDate, tasks]);

  // Verificar se uma tarefa foi completada em uma data
  const isTaskCompletedOnDate = (task: Task, date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return task.completedDates.includes(dateStr);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2">
        <AnimatedCard className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth }, index) => {
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;
              const isToday = isSameDay(date, new Date());
              const dayTasks = getTasksForDate(date);

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'aspect-square p-2 rounded-xl transition-all flex flex-col items-center justify-start',
                    isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400',
                    isSelected && 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500',
                    !isSelected && 'hover:bg-gray-100 dark:hover:bg-gray-800',
                    isToday && !isSelected && 'bg-purple-50 dark:bg-purple-900/10'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full',
                    isToday && 'bg-purple-500 text-white'
                  )}>
                    {date.getDate()}
                  </span>
                  
                  {/* Task indicators */}
                  {dayTasks.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 mt-1 max-w-full">
                      {dayTasks.slice(0, 4).map((task, i) => {
                        const isCompleted = isTaskCompletedOnDate(task, date);
                        const category = categories[task.category];
                        return (
                          <div
                            key={i}
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              isCompleted ? 'bg-emerald-500' : category.bgColor.replace('/30', '').replace('bg-', 'bg-')
                            )}
                          />
                        );
                      })}
                      {dayTasks.length > 4 && (
                        <span className="text-[8px] text-gray-400">+</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </AnimatedCard>
      </div>

      {/* Selected date tasks */}
      <div>
        <AnimatedCard className="p-4 h-full">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">
              {formatDate(selectedDate, { day: 'numeric', month: 'long' })}
            </h3>
          </div>

          <div className="space-y-3">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma tarefa para este dia</p>
              </div>
            ) : (
              selectedDateTasks.map((task) => {
                const isCompleted = isTaskCompletedOnDate(task, new Date(selectedDate));
                const category = categories[task.category];

                return (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      'w-full text-left p-3 rounded-xl transition-all',
                      'hover:bg-gray-50 dark:hover:bg-gray-800',
                      'border border-transparent hover:border-gray-200 dark:hover:border-gray-700',
                      isCompleted && 'opacity-60'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('w-3 h-3 rounded-full mt-1', category.bgColor.replace('/30', ''))} />
                      <div className="flex-1">
                        <p className={cn(
                          'font-medium text-sm',
                          isCompleted && 'line-through'
                        )}>
                          {task.title}
                        </p>
                        {task.time && (
                          <p className="text-xs text-gray-500 mt-0.5">{task.time}</p>
                        )}
                      </div>
                      {isCompleted && (
                        <span className="text-emerald-500 text-xs">✓</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
