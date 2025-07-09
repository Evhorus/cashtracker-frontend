import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import clsx from 'clsx';
import { ButtonHTMLAttributes, ReactNode } from 'react';

const buttonVariants = {
  primary: {
    base: 'bg-purple-950',
    hover: 'hover:bg-purple-800',
    disabled: 'bg-purple-950/50',
    ring: 'focus:ring-purple-700',
  },
  secondary: {
    base: 'bg-amber-500',
    hover: 'hover:bg-amber-600',
    disabled: 'bg-amber-500/50',
    ring: 'focus:ring-amber-600',
  },
  danger: {
    base: 'bg-red-600',
    hover: 'hover:bg-red-500',
    disabled: 'bg-red-600/50',
    ring: 'focus:ring-red-700',
  },
  success: {
    base: 'bg-green-600',
    hover: 'hover:bg-green-500',
    disabled: 'bg-green-600/50',
    ring: 'focus:ring-green-700',
  },
  'outline-primary': {
    base: 'bg-transparent border-2 border-purple-950 text-purple-950',
    hover: 'hover:bg-purple-950 hover:text-white',
    disabled: 'border-2 border-purple-950/50 text-purple-950/50 bg-transparent',
    ring: 'focus:ring-purple-700',
  },
  'outline-secondary': {
    base: 'bg-transparent border-2 border-amber-500 text-amber-600',
    hover: 'hover:bg-amber-500 hover:text-white',
    disabled: 'border-2 border-amber-500/50 text-amber-500/50 bg-transparent',
    ring: 'focus:ring-amber-600',
  },
};

const buttonSizes = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-xl',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  spinnerClass?: string;
}

export const Button: React.FC<ButtonProps> = ({
  isLoading = false,
  children,
  loadingText = 'Cargando...',
  type = 'submit',
  className = '',
  spinnerClass = '',
  variant = 'primary',
  size = 'medium',
  ...props
}) => {
  const { base, hover, disabled, ring } = buttonVariants[variant];
  const sizeClass = buttonSizes[size];

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        aria-live="polite"
        className={clsx(
          disabled,
          sizeClass,
          'rounded-lg text-white font-black flex items-center justify-center gap-2 cursor-not-allowed focus:outline-none focus:ring-2 transition-colors',
          ring,
          className,
        )}
        {...props}
      >
        <AiOutlineLoading3Quarters
          className={clsx('animate-spin w-6 h-6', spinnerClass)}
        />
        {loadingText}
      </button>
    );
  }

  return (
    <button
      type={type}
      className={clsx(
        base,
        hover,
        sizeClass,
        'rounded-lg text-white font-black cursor-pointer focus:outline-none focus:ring-2 transition-colors flex items-center justify-center gap-2',
        ring,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
