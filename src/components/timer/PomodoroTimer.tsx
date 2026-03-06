import { useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Battery } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimer } from '@/hooks/useTimer';
import { ProgressRing } from '@/components/ui/custom/ProgressRing';
import { Button } from '@/components/ui/button';
import { AnimatedCard } from '@/components/ui/custom/AnimatedCard';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const modes: Record<TimerMode, { label: string; icon: React.ElementType; duration: number; color: string }> = {
  focus: { 
    label: 'Foco', 
    icon: Brain, 
    duration: 25 * 60, 
    color: 'stroke-purple-600' 
  },
  shortBreak: { 
    label: 'Pausa Curta', 
    icon: Coffee, 
    duration: 5 * 60, 
    color: 'stroke-emerald-500' 
  },
  longBreak: { 
    label: 'Pausa Longa', 
    icon: Battery, 
    duration: 15 * 60, 
    color: 'stroke-blue-500' 
  },
};

export function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>('focus');
  const { 
    isRunning, 
    isPaused, 
    progress, 
    formattedTime, 
    start, 
    pause, 
    resume, 
    reset,
  } = useTimer(modes.focus.duration);

  const currentMode = modes[mode];
  const ModeIcon = currentMode.icon;

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    reset(modes[newMode].duration);
  };

  const handleStartPause = () => {
    if (isRunning) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      start();
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Mode selector */}
      <div className="flex justify-center gap-2 mb-8">
        {(Object.keys(modes) as TimerMode[]).map((m) => {
          const Icon = modes[m].icon;
          return (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                mode === m
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">{modes[m].label}</span>
            </button>
          );
        })}
      </div>

      {/* Timer display */}
      <AnimatedCard className="p-8 flex flex-col items-center">
        <ProgressRing
          progress={progress}
          size={240}
          strokeWidth={8}
          color={currentMode.color}
          className="mb-6"
        >
          <div className="text-center">
            <div className="text-6xl font-bold tabular-nums tracking-tight">
              {formattedTime}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-2">
              <ModeIcon className="w-4 h-4" />
              {currentMode.label}
            </p>
          </div>
        </ProgressRing>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => reset()}
            className="w-12 h-12 rounded-full"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>

          <Button
            onClick={handleStartPause}
            className={cn(
              'w-20 h-20 rounded-full btn-primary',
              isRunning && 'bg-amber-500 hover:bg-amber-600'
            )}
          >
            {isRunning ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>

          <div className="w-12" /> {/* Spacer for alignment */}
        </div>

        {/* Status */}
        <div className="mt-6 text-center">
          {isRunning ? (
            <p className="text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Em andamento
            </p>
          ) : isPaused ? (
            <p className="text-amber-600 dark:text-amber-400">Pausado</p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Pronto para começar</p>
          )}
        </div>
      </AnimatedCard>

      {/* Tips */}
      <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
        <h4 className="font-medium text-purple-800 dark:text-purple-400 mb-2">
          Dica do Pomodoro
        </h4>
        <p className="text-sm text-purple-700 dark:text-purple-300">
          {mode === 'focus' 
            ? 'Concentre-se apenas na tarefa. Evite distrações e notificações.'
            : mode === 'shortBreak'
            ? 'Levante-se, estique-se e descanse os olhos.'
            : 'Aproveite para fazer uma pausa maior, tomar água ou comer algo.'}
        </p>
      </div>
    </div>
  );
}
