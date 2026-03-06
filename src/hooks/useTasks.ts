import { useCallback, useMemo } from 'react';
import type { Task, TaskStatus, TaskCategory } from '@/types';
import { useLocalStorage } from './useLocalStorage';

// Gerar ID único
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Data atual no formato YYYY-MM-DD
const getToday = () => new Date().toISOString().split('T')[0];

// Hook principal para gerenciar tarefas
export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('habitlife-tasks', []);

  // Criar nova tarefa
  const createTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedDates' | 'streak' | 'bestStreak'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedDates: [],
      streak: 0,
      bestStreak: 0,
    };
    
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [setTasks]);

  // Atualizar tarefa
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  }, [setTasks]);

  // Deletar tarefa
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  // Completar tarefa
  const completeTask = useCallback((id: string) => {
    const today = getToday();
    
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      
      const alreadyCompleted = task.completedDates.includes(today);
      if (alreadyCompleted) return task;
      
      const newCompletedDates = [...task.completedDates, today];
      const newStreak = task.streak + 1;
      
      return {
        ...task,
        status: 'completed' as TaskStatus,
        completedDates: newCompletedDates,
        streak: newStreak,
        bestStreak: Math.max(newStreak, task.bestStreak),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [setTasks]);

  // Descompletar tarefa
  const uncompleteTask = useCallback((id: string) => {
    const today = getToday();
    
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      
      return {
        ...task,
        status: 'pending' as TaskStatus,
        completedDates: task.completedDates.filter(date => date !== today),
        streak: Math.max(0, task.streak - 1),
        updatedAt: new Date().toISOString(),
      };
    }));
  }, [setTasks]);

  // Pular tarefa
  const skipTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, status: 'skipped' as TaskStatus, updatedAt: new Date().toISOString() }
        : task
    ));
  }, [setTasks]);

  // Toggle completar/descompletar
  const toggleTaskCompletion = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const today = getToday();
    const isCompletedToday = task.completedDates.includes(today);
    
    if (isCompletedToday) {
      uncompleteTask(id);
    } else {
      completeTask(id);
    }
  }, [tasks, completeTask, uncompleteTask]);

  // Obter tarefas de hoje
  const todayTasks = useMemo(() => {
    const today = getToday();
    const dayOfWeek = new Date().getDay(); // 0-6
    
    return tasks.filter(task => {
      // Verificar se a tarefa está ativa hoje
      if (task.startDate > today) return false;
      if (task.endDate && task.endDate < today) return false;
      
      // Verificar recorrência
      switch (task.recurrence) {
        case 'once':
          return task.startDate === today;
        case 'daily':
          return true;
        case 'weekly':
          return task.selectedDays?.includes(dayOfWeek) ?? false;
        case 'custom':
          if (!task.customDays) return false;
          const start = new Date(task.startDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays % task.customDays === 0;
        default:
          return false;
      }
    }).sort((a, b) => {
      // Ordenar por horário
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      if (a.time) return -1;
      if (b.time) return 1;
      return 0;
    });
  }, [tasks]);

  // Obter tarefas por categoria
  const getTasksByCategory = useCallback((category: TaskCategory) => {
    return tasks.filter(task => task.category === category);
  }, [tasks]);

  // Obter estatísticas
  const statistics = useMemo(() => {
    const today = getToday();
    const totalTasks = tasks.length;
    const completedTasks = tasks.reduce((acc, task) => acc + task.completedDates.length, 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / (totalTasks * 30)) * 100) : 0;
    
    const currentStreak = tasks.reduce((acc, task) => {
      if (task.completedDates.includes(today)) {
        return acc + 1;
      }
      return acc;
    }, 0);
    
    const bestStreak = Math.max(...tasks.map(t => t.bestStreak), 0);
    
    // Progresso semanal
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = tasks.filter(task => {
        if (task.recurrence === 'once') return task.startDate === dateStr;
        return true;
      });
      
      const dayCompleted = dayTasks.filter(task => 
        task.completedDates.includes(dateStr)
      ).length;
      
      return {
        date: dateStr,
        totalTasks: dayTasks.length,
        completedTasks: dayCompleted,
        completionRate: dayTasks.length > 0 ? Math.round((dayCompleted / dayTasks.length) * 100) : 0,
      };
    }).reverse();
    
    // Breakdown por categoria
    const categoryBreakdown = ['leisure', 'study', 'freestudy', 'activity'].map(cat => {
      const catTasks = tasks.filter(t => t.category === cat);
      const catCompleted = catTasks.reduce((acc, t) => acc + t.completedDates.length, 0);
      return {
        category: cat as TaskCategory,
        count: catTasks.length,
        completed: catCompleted,
      };
    });
    
    return {
      totalTasks,
      completedTasks,
      completionRate,
      currentStreak,
      bestStreak,
      weeklyProgress,
      monthlyProgress: weeklyProgress, // Simplificado
      categoryBreakdown,
    };
  }, [tasks]);

  return {
    tasks,
    todayTasks,
    statistics,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    uncompleteTask,
    skipTask,
    toggleTaskCompletion,
    getTasksByCategory,
  };
}
