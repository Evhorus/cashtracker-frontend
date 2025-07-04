export const SuccessMessage: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="text-center my-4 bg-amber-600 text-white font-bold p-3 uppercase text-sm">
      {children}
    </div>
  );
};
