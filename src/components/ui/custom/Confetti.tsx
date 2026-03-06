import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

interface ConfettiProps {
  trigger: boolean;
  originX?: number;
  originY?: number;
  className?: string;
}

const colors = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899'];

export function Confetti({ trigger, originX = 50, originY = 50, className }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (trigger) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 20 }, (_, i) => ({
        id: Date.now() + i,
        x: originX + (Math.random() - 0.5) * 40,
        y: originY + (Math.random() - 0.5) * 40,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      }));
      
      setPieces(newPieces);
      
      // Limpar após animação
      const timeout = setTimeout(() => {
        setPieces([]);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [trigger, originX, originY]);

  if (pieces.length === 0) return null;

  return (
    <div className={cn('fixed inset-0 pointer-events-none z-50', className)}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full confetti"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            '--x': `${(Math.random() - 0.5) * 200}px`,
            '--y': `${-100 - Math.random() * 200}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
