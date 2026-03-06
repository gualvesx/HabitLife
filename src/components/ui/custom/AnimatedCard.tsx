import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  spotlight?: boolean;
}

export function AnimatedCard({
  children,
  className,
  onClick,
  hoverable = true,
  spotlight = false,
}: AnimatedCardProps) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlight) return;
    
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={cn(
        'relative overflow-hidden rounded-2xl bg-white dark:bg-white/5 backdrop-blur-sm',
        'border border-gray-200 dark:border-white/10',
        'transition-all duration-300',
        hoverable && 'hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1',
        onClick && 'cursor-pointer',
        spotlight && 'spotlight-card',
        className
      )}
    >
      {children}
    </div>
  );
}
