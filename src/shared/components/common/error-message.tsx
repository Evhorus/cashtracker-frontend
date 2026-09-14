import { TriangleAlert } from "lucide-react";

export const ErrorMessage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div
      role="alert"
      className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1 text-destructive shadow-sm"
    >
      <TriangleAlert size={16} />
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
};
