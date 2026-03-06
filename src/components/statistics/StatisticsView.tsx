import { 
  TrendingUp, 
  Flame, 
  CheckCircle2, 
  Target,
  BarChart3,
  PieChart
} from 'lucide-react';
import type { Statistics } from '@/types';
import { cn, categories } from '@/lib/utils';
import { AnimatedCard } from '@/components/ui/custom/AnimatedCard';
import { ProgressRing } from '@/components/ui/custom/ProgressRing';

interface StatisticsViewProps {
  statistics: Statistics;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  return (
    <AnimatedCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
          {trend && (
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </AnimatedCard>
  );
}

export function StatisticsView({ statistics }: StatisticsViewProps) {
  const { 
    totalTasks, 
    completedTasks, 
    completionRate, 
    currentStreak, 
    bestStreak,
    weeklyProgress,
    categoryBreakdown 
  } = statistics;

  // Calcular máximo para o gráfico
  const maxCompleted = Math.max(...weeklyProgress.map(d => d.completedTasks), 1);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Taxa de Conclusão"
          value={`${completionRate}%`}
          subtitle="Este mês"
          icon={Target}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-600"
          trend="+5% vs último mês"
        />
        
        <StatCard
          title="Streak Atual"
          value={currentStreak}
          subtitle="dias consecutivos"
          icon={Flame}
          color="bg-orange-100 dark:bg-orange-900/30 text-orange-600"
        />
        
        <StatCard
          title="Melhor Streak"
          value={bestStreak}
          subtitle="seu recorde"
          icon={TrendingUp}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
        />
        
        <StatCard
          title="Tarefas Completadas"
          value={completedTasks}
          subtitle={`de ${totalTasks} total`}
          icon={CheckCircle2}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <AnimatedCard className="p-5">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Progresso Semanal</h3>
          </div>

          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyProgress.map((day, index) => {
              const height = maxCompleted > 0 ? (day.completedTasks / maxCompleted) * 100 : 0;
              const isToday = index === weeklyProgress.length - 1;
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative">
                    <div
                      className={cn(
                        'w-full rounded-t-lg transition-all duration-500',
                        isToday ? 'bg-purple-500' : 'bg-purple-200 dark:bg-purple-800'
                      )}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    {day.completedTasks > 0 && (
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-medium">
                        {day.completedTasks}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    'text-xs',
                    isToday ? 'font-medium text-purple-600' : 'text-gray-400'
                  )}>
                    {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'narrow' })}
                  </span>
                </div>
              );
            })}
          </div>
        </AnimatedCard>

        {/* Category Breakdown */}
        <AnimatedCard className="p-5">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Por Categoria</h3>
          </div>

          <div className="space-y-4">
            {categoryBreakdown.map(({ category, count, completed }) => {
              const cat = categories[category];
              const percentage = count > 0 ? Math.round((completed / count) * 100) : 0;
              
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', cat.bgColor.replace('/30', ''))} />
                      <span className="text-sm font-medium">{cat.namePt}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {completed}/{count}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        cat.bgColor.replace('/30', '').replace('bg-', 'bg-')
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </AnimatedCard>
      </div>

      {/* Overall Progress */}
      <AnimatedCard className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ProgressRing
            progress={completionRate}
            size={160}
            strokeWidth={12}
            color="stroke-purple-600"
          >
            <div className="text-center">
              <span className="text-4xl font-bold">{completionRate}%</span>
              <p className="text-sm text-gray-500 mt-1">Concluído</p>
            </div>
          </ProgressRing>

          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-semibold mb-2">
              {completionRate >= 80 
                ? 'Excelente progresso! 🎉' 
                : completionRate >= 50 
                ? 'Bom trabalho! Continue assim!' 
                : 'Vamos começar! Você consegue!'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Você completou {completedTasks} tarefas até agora. 
              {completionRate < 100 && ' Faltam apenas ' + (totalTasks - completedTasks) + ' para atingir sua meta!'}
            </p>

            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-500">Concluído</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700" />
                <span className="text-sm text-gray-500">Pendente</span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
