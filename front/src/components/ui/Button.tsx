'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = `
      px-4 py-2 rounded-lg font-medium transition-all duration-300
      flex items-center justify-center gap-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-cyan-500 to-purple-500
        hover:from-cyan-400 hover:to-purple-400
        text-white shadow-lg
        hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]
        active:scale-95
      `,
      secondary: `
        border border-cyan-500/50 text-cyan-400
        hover:bg-cyan-500/10 hover:border-cyan-400
        hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]
        active:scale-95
      `,
      ghost: `
        text-zinc-400 hover:text-white
        hover:bg-white/5
      `,
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
