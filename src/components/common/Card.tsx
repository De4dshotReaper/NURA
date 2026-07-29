import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-nuraSurface border border-nuraBorder rounded-2xl p-6 shadow-sm transition-all ${
        hoverEffect ? 'hover:shadow-md hover:border-primary/30 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
