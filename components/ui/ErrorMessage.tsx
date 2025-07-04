export const ErrorMessage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="text-center my-4 bg-red-600 text-white font-bold p-3 uppercase text-sm">
      {children}
    </div>
  );
};
