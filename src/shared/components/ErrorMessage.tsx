import { TriangleAlert } from 'lucide-react';

export const ErrorMessage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div
      id="description-error"
      className="flex items-center gap-2 bg-red-50 border border-red-300 text-red-700 rounded-lg px-2 py-1 shadow-sm"
    >
      <TriangleAlert size={16} />
      <span className="font-medium text-sm">{children}</span>
    </div>
  );
};
