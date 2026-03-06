import { 
  CheckCircle2, 
  Clock, 
  Flame, 
  TrendingUp,
  Calendar,
  ArrowRight
} from 'lucide-react';
import type { Task, Statistics } from '@/types';
import { cn, categories, formatDate, getToday, getDayName } from '@/lib/utils';
import { AnimatedCard } from '@/components/ui/custom/AnimatedCard';
import { ProgressRing } from '@/components/ui/custom/ProgressRing';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/tasks/TaskCard';

interface DashboardViewProps {
  tasks: Task[];
  todayTasks: Task[];
  statistics: Statistics;
  onTaskToggle: (id: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (id: string) => void;
  onTaskSkip: (id: string) => void;
  onViewAllTasks: () => void;
  onViewCalendar: () => void;
  onViewStatistics: () => void;
}

export function DashboardView({
  tasks,
  todayTasks,
  statistics,
  onTaskToggle,
  onTaskEdit,
  onTaskDelete,
  onTaskSkip,
  onViewAllTasks,
  onViewCalendar,
  onViewStatistics,
}: DashboardViewProps) {
  const today = getToday();
  const completedToday = todayTasks.filter(t => t.completedDates.includes(today)).length;
  const progress = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  // Próximas tarefas (não completadas)
  const upcomingTasks = todayTasks
    .filter(t => !t.completedDates.includes(today) && t.status !== 'skipped')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Olá! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {getDayName(new Date())}, {formatDate(today, { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            'px-4 py-2 rounded-xl flex items-center gap-2',
            'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
          )}>
            <Flame className="w-5 h-5" />
            <span className="font-medium">{statistics.currentStreak} dias</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Progress */}
        <AnimatedCard className="lg:col-span-2 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ProgressRing
              progress={progress}
              size={140}
              strokeWidth={10}
              color="stroke-purple-600"
            >
              <div className="text-center">
                <span className="text-3xl font-bold">{progress}%</span>
                <p className="text-xs text-gray-500">Hoje</p>
              </div>
            </ProgressRing>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-semibold mb-1">
                {progress === 100 
                  ? 'Parabéns! Todas as tarefas concluídas! 🎉'
                  : progress >= 50 
                  ? 'Você está indo bem! Continue! 💪'
                  : 'Vamos começar o dia produtivo! 🚀'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {completedToday} de {todayTasks.length} tarefas concluídas
              </p>

              <div className="flex flex-wrap gap-3 mt-4 justify-center sm:justify-start">
                <Button variant="outline" size="sm" onClick={onViewCalendar}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Calendário
                </Button>
                <Button variant="outline" size="sm" onClick={onViewStatistics}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Estatísticas
                </Button>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Quick Stats */}
        <div className="space-y-4">
          <AnimatedCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statistics.completedTasks}</p>
                <p className="text-xs text-gray-500">Tarefas concluídas</p>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayTasks.length}</p>
                <p className="text-xs text-gray-500">Tarefas hoje</p>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Próximas Tarefas</h2>
          <Button variant="ghost" size="sm" onClick={onViewAllTasks}>
            Ver todas
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {upcomingTasks.length === 0 ? (
          <AnimatedCard className="p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-medium text-lg mb-1">
              {completedToday === todayTasks.length && todayTasks.length > 0
                ? 'Todas as tarefas concluídas!'
                : 'Nenhuma tarefa para hoje'}
            </h3>
            <p className="text-gray-500 text-sm">
              {completedToday === todayTasks.length && todayTasks.length > 0
                ? 'Excelente trabalho! Aproveite seu dia!'
                : 'Adicione uma nova tarefa para começar'}
            </p>
          </AnimatedCard>
        ) : (
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onTaskToggle}
                onEdit={onTaskEdit}
                onDelete={onTaskDelete}
                onSkip={onTaskSkip}
              />
            ))}
          </div>
        )}
      </div>

      {/* Category Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Categorias</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(categories).map((category) => {
            const count = tasks.filter(t => t.category === category.id).length;
            const completed = tasks
              .filter(t => t.category === category.id)
              .reduce((acc, t) => acc + t.completedDates.length, 0);

            return (
              <AnimatedCard
                key={category.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-all"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', category.bgColor)}>
                  <div className={cn('w-4 h-4 rounded-full', category.bgColor.replace('/30', ''))} />
                </div>
                <p className="font-medium">{category.namePt}</p>
                <p className="text-sm text-gray-500">
                  {completed} de {count} concluídos
                </p>
              </AnimatedCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
