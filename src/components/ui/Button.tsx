import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
}

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'border-primary bg-primary text-primary-foreground shadow-sm shadow-black/20 hover:brightness-110',
    secondary: 'border-border bg-muted text-foreground hover:border-primary/50 hover:bg-sidebar-accent',
    ghost: 'border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md border px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
