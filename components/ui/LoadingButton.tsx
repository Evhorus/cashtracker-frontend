import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import clsx from 'clsx';
import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface LoadingButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  children: ReactNode;
  color?: string;
  colorHover?: string;
  colorDisabled?: string;
  spinnerClass?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  loadingText = 'Cargando...',
  type = 'submit',
  className = '',
  spinnerClass = '',
  color = 'bg-purple-950',
  colorHover = 'hover:bg-purple-800',
  colorDisabled = 'bg-purple-950/50',
  ...props
}) => {
  return isLoading ? (
    <button
      type="button"
      disabled
      aria-live="polite"
      className={clsx(
        colorDisabled,
        'transition-colors w-full p-3 rounded-lg text-white font-black text-xl flex items-center justify-center gap-2 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-700',
        className,
      )}
      {...props}
    >
      <AiOutlineLoading3Quarters
        className={clsx('animate-spin w-6 h-6', spinnerClass)}
      />
      {loadingText}
    </button>
  ) : (
    <button
      type={type}
      className={clsx(
        color,
        colorHover,
        'w-full p-3 rounded-lg text-white font-black text-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-700 transition-colors flex items-center justify-center gap-2',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
