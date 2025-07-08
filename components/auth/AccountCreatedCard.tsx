import Link from 'next/link';
import { ReactNode } from 'react';

export interface SuccessMessageCardProps {
  title: string;
  message: ReactNode;
  linkHref: string;
  linkText: string;
  className?: string;
}

export const SuccessMessageCard: React.FC<SuccessMessageCardProps> = ({
  title,
  message,
  linkHref,
  linkText,
  className = '',
}) => {
  return (
    <div className={`mt-14 flex justify-center ${className}`}>
      <div className="border border-green-400 rounded-lg shadow-lg p-8 text-center bg-white max-w-md w-full">
        <h2 className="text-2xl font-bold text-green-700 mb-2">{title}</h2>
        <div className="text-gray-700 mb-4">{message}</div>
        <Link
          href={linkHref}
          className="inline-block mt-4 bg-purple-950 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded cursor-pointer transition-colors"
        >
          {linkText}
        </Link>
      </div>
    </div>
  );
};
