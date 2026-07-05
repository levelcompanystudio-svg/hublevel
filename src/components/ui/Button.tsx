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
    primary: 'border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-500',
    secondary: 'border-slate-800 bg-slate-900 text-slate-100 hover:bg-slate-800',
    ghost: 'border-transparent bg-transparent text-slate-300 hover:bg-slate-900',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
