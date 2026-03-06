import { useState, useCallback, useEffect } from 'react';
import { ThemeProvider } from '@/components/ui/custom/ThemeProvider';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskCard } from '@/components/tasks/TaskCard';
import { CalendarView } from '@/components/calendar/CalendarView';
import { PomodoroTimer } from '@/components/timer/PomodoroTimer';
import { StatisticsView } from '@/components/statistics/StatisticsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { ToastContainer, type ToastType } from '@/components/ui/custom/Toast';
import { useTasks } from '@/hooks/useTasks';
import { useNotifications } from '@/hooks/useNotifications';
import type { Task, DashboardView as ViewType } from '@/types';
import { downloadFile } from '@/lib/utils';
import { AnimatedCard } from '@/components/ui/custom/AnimatedCard';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare } from 'lucide-react';

// Toast type definition
interface Toast {
  id: string;
  title: string;
  message?: string;
  type?: ToastType;
}

function AppContent() {
  // State
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Hooks
  const {
    tasks,
    todayTasks,
    statistics,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    skipTask,
  } = useTasks();

  const {
    unreadCount,
    requestPermission,
    addNotification,
    markAllAsRead,
  } = useNotifications();

  // Request notification permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Toast helpers
  const addToast = useCallback((title: string, message?: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 15);
    setToasts(prev => [...prev, { id, title, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Task handlers
  const handleCreateTask = useCallback((taskData: Parameters<typeof createTask>[0]) => {
    createTask(taskData);
    addToast('Tarefa criada!', 'Sua nova tarefa foi adicionada com sucesso.', 'success');
  }, [createTask, addToast]);

  const handleUpdateTask = useCallback((taskData: Parameters<typeof createTask>[0]) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      addToast('Tarefa atualizada!', 'As alterações foram salvas.', 'success');
      setEditingTask(null);
    }
  }, [editingTask, updateTask, addToast]);

  const handleDeleteTask = useCallback((id: string) => {
    deleteTask(id);
    addToast('Tarefa excluída', 'A tarefa foi removida permanentemente.', 'info');
  }, [deleteTask, addToast]);

  const handleToggleTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const today = new Date().toISOString().split('T')[0];
      const isCompleted = task.completedDates.includes(today);
      
      toggleTaskCompletion(id);
      
      if (!isCompleted) {
        addToast('Tarefa concluída! 🎉', 'Parabéns por mais um passo!', 'success');
        addNotification({
          title: 'Tarefa Concluída',
          message: `Você completou: ${task.title}`,
          type: 'achievement',
          taskId: task.id,
        });
      }
    }
  }, [tasks, toggleTaskCompletion, addToast, addNotification]);

  const handleSkipTask = useCallback((id: string) => {
    skipTask(id);
    addToast('Tarefa pulada', 'Você pode voltar a ela mais tarde.', 'info');
  }, [skipTask, addToast]);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskFormOpen(true);
  }, []);

  const handleOpenTaskForm = useCallback(() => {
    setEditingTask(null);
    setTaskFormOpen(true);
  }, []);

  const handleCloseTaskForm = useCallback(() => {
    setTaskFormOpen(false);
    setEditingTask(null);
  }, []);

  // Data export/import
  const handleExportData = useCallback(() => {
    const data = {
      tasks,
      statistics,
      exportDate: new Date().toISOString(),
    };
    downloadFile(JSON.stringify(data, null, 2), `habitlife-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    addToast('Dados exportados!', 'Seu backup foi baixado.', 'success');
  }, [tasks, statistics, addToast]);

  const handleImportData = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.tasks && Array.isArray(data.tasks)) {
        addToast('Dados importados!', 'Seu backup foi restaurado.', 'success');
      }
    } catch (error) {
      addToast('Erro na importação', 'O arquivo parece estar corrompido.', 'error');
    }
  }, [addToast]);

  const handleClearAllData = useCallback(() => {
    localStorage.removeItem('habitlife-tasks');
    localStorage.removeItem('habitlife-notifications');
    window.location.reload();
  }, []);

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            tasks={tasks}
            todayTasks={todayTasks}
            statistics={statistics}
            onTaskToggle={handleToggleTask}
            onTaskEdit={handleEditTask}
            onTaskDelete={handleDeleteTask}
            onTaskSkip={handleSkipTask}
            onViewAllTasks={() => setCurrentView('tasks')}
            onViewCalendar={() => setCurrentView('calendar')}
            onViewStatistics={() => setCurrentView('statistics')}
          />
        );

      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Todas as Tarefas</h1>
              <Button onClick={handleOpenTaskForm} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>

            {tasks.length === 0 ? (
              <AnimatedCard className="p-12 text-center">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhuma tarefa ainda</h3>
                <p className="text-gray-500 mb-6">Comece adicionando sua primeira tarefa!</p>
                <Button onClick={handleOpenTaskForm} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Tarefa
                </Button>
              </AnimatedCard>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onSkip={handleSkipTask}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Calendário</h1>
            </div>
            <CalendarView tasks={tasks} onTaskClick={handleEditTask} />
          </div>
        );

      case 'timer':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Timer Pomodoro</h1>
            </div>
            <PomodoroTimer />
          </div>
        );

      case 'statistics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Estatísticas</h1>
            </div>
            <StatisticsView statistics={statistics} />
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Configurações</h1>
            </div>
            <SettingsView
              notificationsEnabled={notificationsEnabled}
              setNotificationsEnabled={setNotificationsEnabled}
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              vibrationEnabled={vibrationEnabled}
              setVibrationEnabled={setVibrationEnabled}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onClearAllData={handleClearAllData}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onAddTask={handleOpenTaskForm}
        notificationCount={unreadCount}
        onNotificationsClick={() => markAllAsRead()}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={taskFormOpen}
        onClose={handleCloseTaskForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        initialTask={editingTask}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
