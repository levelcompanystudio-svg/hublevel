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
    primary:
      'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30 hover:brightness-110 active:brightness-95',
    secondary:
      'border-border bg-muted text-foreground hover:border-primary/40 hover:bg-sidebar-accent active:brightness-95',
    ghost:
      'border-transparent bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:brightness-95',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
