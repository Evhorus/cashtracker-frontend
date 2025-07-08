import { IoAlertCircleOutline } from 'react-icons/io5';

export const ErrorMessage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-3 bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 shadow-sm w-full">
        <IoAlertCircleOutline size={24} />
        <span className="font-medium">{children}</span>
      </div>
    </div>
  );
};
