import Image from 'next/image';

export const Logo: React.FC = () => {
  return (
    <Image
      src="/logo.svg"
      alt="Logo CashTracker"
      width={0}
      height={0}
      className="w-full"
      priority
    />
  );
};
