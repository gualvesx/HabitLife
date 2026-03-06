import { useState, useCallback, useEffect } from 'react';
import type { Notification, Task, Reminder } from '@/types';
import { useLocalStorage } from './useLocalStorage';

// Gerar ID único simples
const generateId = () => Math.random().toString(36).substring(2, 15);

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('habitlife-notifications', []);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Inicializar permissão de notificação
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Solicitar permissão de notificação
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Este navegador não suporta notificações');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  // Mostrar notificação do navegador
  const showBrowserNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && 'Notification' in window) {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  }, [permission]);

  // Tocar som de alarme
  const playAlarmSound = useCallback(() => {
    // Criar som usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Segundo tom
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      osc2.frequency.value = 1000;
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 200);
  }, []);

  // Tocar som de notificação suave
  const playNotificationSound = useCallback(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, []);

  // Adicionar notificação interna
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Manter apenas 50 notificações
    
    // Mostrar notificação do navegador
    showBrowserNotification(notification.title, {
      body: notification.message,
    });
    
    // Tocar som
    if (notification.type === 'alarm') {
      playAlarmSound();
    } else {
      playNotificationSound();
    }
    
    return newNotification;
  }, [setNotifications, showBrowserNotification, playAlarmSound, playNotificationSound]);

  // Marcar notificação como lida
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  }, [setNotifications]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [setNotifications]);

  // Remover notificação
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [setNotifications]);

  // Limpar todas as notificações
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, [setNotifications]);

  // Notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Agendar lembrete para tarefa
  const scheduleReminder = useCallback((task: Task, reminder: Reminder) => {
    if (!reminder.enabled) return;

    const [hours, minutes] = reminder.time.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // Se o horário já passou hoje, agendar para amanhã
    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const delay = reminderTime.getTime() - now.getTime();

    // Agendar notificação
    setTimeout(() => {
      addNotification({
        title: 'Lembrete de Tarefa',
        message: `É hora de: ${task.title}`,
        type: reminder.soundEnabled ? 'alarm' : 'reminder',
        taskId: task.id,
      });
    }, delay);
  }, [addNotification]);

  // Verificar lembretes pendentes
  useEffect(() => {
    const checkReminders = () => {
      // Aqui você pode verificar tarefas com lembretes
      // e disparar notificações quando o horário chegar
    };

    const interval = setInterval(checkReminders, 60000); // Verificar a cada minuto
    return () => clearInterval(interval);
  }, []);

  return {
    notifications,
    unreadCount,
    permission,
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    showBrowserNotification,
    playAlarmSound,
    playNotificationSound,
    scheduleReminder,
  };
}
