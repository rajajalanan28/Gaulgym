'use client';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-primary)] text-white border-none hover:bg-[var(--color-primary-hover)]',
  secondary: 'bg-gray-500 text-white border-none hover:bg-gray-600',
  outline: 'bg-transparent text-[var(--color-primary)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10',
  ghost: 'bg-transparent text-[var(--color-ink)] border-none hover:bg-[var(--color-surface-2)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-lg font-semibold transition-all duration-200
        inline-flex items-center justify-center gap-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-px hover:shadow-lg'}
        ${fullWidth ? 'w-full' : 'w-auto'}
        ${className}
      `.trim()}
    >
      {children}
    </button>
  );
}
