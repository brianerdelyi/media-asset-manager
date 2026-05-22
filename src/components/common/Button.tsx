// Button — primary, secondary, danger, ghost variants.

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}, ref) => {
  const base = `
    inline-flex items-center justify-center gap-1.5
    font-medium rounded-md border transition-colors
    disabled:opacity-40 disabled:cursor-not-allowed
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
  `;

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
  };

  const variants = {
    primary: `
      bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]
      border-[var(--color-accent)] hover:border-[var(--color-accent-hover)]
      text-white
    `,
    secondary: `
      bg-[var(--bg-raised)] hover:bg-[var(--bg-overlay)]
      border-[var(--border-default)] hover:border-[var(--border-strong)]
      text-[var(--text-primary)]
    `,
    danger: `
      bg-transparent hover:bg-[var(--color-danger)]
      border-[var(--color-danger)]
      text-[var(--color-danger)] hover:text-white
    `,
    ghost: `
      bg-transparent hover:bg-[var(--nav-item-hover)]
      border-transparent
      text-[var(--text-secondary)] hover:text-[var(--text-primary)]
    `,
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
