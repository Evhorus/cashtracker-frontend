import { TriangleAlert } from "lucide-react";

export const ErrorMessage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div
      id="description-error"
      className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-red-700 shadow-sm"
    >
      <TriangleAlert size={16} />
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
};
