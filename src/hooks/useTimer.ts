import { useState, useCallback, useEffect, useRef } from 'react';

interface TimerState {
  timeRemaining: number;
  isRunning: boolean;
  isPaused: boolean;
  progress: number;
}

export function useTimer(initialDuration: number = 25 * 60) {
  const [duration, setDurationState] = useState(initialDuration);
  const [state, setState] = useState<TimerState>({
    timeRemaining: initialDuration,
    isRunning: false,
    isPaused: false,
    progress: 100,
  });
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Formatar tempo para exibição
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  // Iniciar timer
  const start = useCallback(() => {
    if (intervalRef.current) return;
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false,
    }));

    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeRemaining <= 1) {
          // Timer completado
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          
          // Tocar som de conclusão
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = 800;
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 1);
          
          return {
            ...prev,
            timeRemaining: 0,
            isRunning: false,
            isPaused: false,
            progress: 0,
          };
        }
        
        const newTimeRemaining = prev.timeRemaining - 1;
        const newProgress = (newTimeRemaining / duration) * 100;
        
        return {
          ...prev,
          timeRemaining: newTimeRemaining,
          progress: newProgress,
        };
      });
    }, 1000);
  }, [duration]);

  // Pausar timer
  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: true,
    }));
  }, []);

  // Resumir timer
  const resume = useCallback(() => {
    start();
  }, [start]);

  // Resetar timer
  const reset = useCallback((newDuration?: number) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const finalDuration = newDuration || duration;
    if (newDuration) {
      setDurationState(newDuration);
    }
    
    setState({
      timeRemaining: finalDuration,
      isRunning: false,
      isPaused: false,
      progress: 100,
    });
  }, [duration]);

  // Parar timer
  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
    }));
  }, []);

  // Definir nova duração
  const setNewDuration = useCallback((newDuration: number) => {
    setDurationState(newDuration);
    setState({
      timeRemaining: newDuration,
      isRunning: false,
      isPaused: false,
      progress: 100,
    });
  }, []);

  // Limpar intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    duration,
    formattedTime: formatTime(state.timeRemaining),
    start,
    pause,
    resume,
    reset,
    stop,
    setDuration: setNewDuration,
  };
}
