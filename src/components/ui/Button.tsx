import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'border-primary/60 bg-primary text-primary-foreground shadow-soft-sm hover:brightness-110 active:brightness-95',
    secondary:
      'border-border bg-surface text-foreground hover:border-primary/30 hover:bg-card-elevated active:brightness-95',
    ghost:
      'border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:brightness-95',
  };

  const sizes = {
    sm: 'gap-1.5 rounded-md px-2.5 py-1.5 text-xs',
    md: 'gap-2 rounded-md px-3.5 py-2 text-sm',
  };

  return (
    <button
      className={`inline-flex items-center justify-center border font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
