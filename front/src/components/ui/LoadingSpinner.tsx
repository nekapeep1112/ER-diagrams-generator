'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        {/* Outer ring */}
        <div
          className={`
            ${sizes[size]} rounded-full
            border-2 border-cyan-500/20
            animate-pulse
          `}
        />
        {/* Spinning ring */}
        <div
          className={`
            absolute inset-0 ${sizes[size]} rounded-full
            border-2 border-transparent
            border-t-cyan-400 border-r-purple-400
            animate-spin
          `}
        />
        {/* Inner glow */}
        <div
          className={`
            absolute inset-2 rounded-full
            bg-gradient-to-r from-cyan-500/20 to-purple-500/20
            blur-sm
          `}
        />
      </div>
    </div>
  );
}
