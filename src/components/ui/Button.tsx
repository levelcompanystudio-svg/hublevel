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
      'border-primary/60 bg-gradient-to-b from-primary to-primary/85 text-primary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_8px_20px_-6px_var(--color-primary)] hover:brightness-110 hover:shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset,0_10px_24px_-6px_var(--color-primary)] active:brightness-95',
    secondary:
      'border-border bg-surface text-foreground hover:border-primary/40 hover:bg-card-elevated active:brightness-95',
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
