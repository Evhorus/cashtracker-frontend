'use client';
import Link from 'next/link';
import { Wallet } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export const Logo = () => {
  const { isSignedIn } = useUser();
  const href = isSignedIn ? '/dashboard' : '/';

  return (
    <Link href={href}>
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">CashTracker</h1>
      </div>
    </Link>
  );
};

// export const Logo: React.FC = () => {
//   return (
//     <Image
//       src="/logo.svg"
//       alt="Logo CashTracker"
//       width={0}
//       height={0}
//       className="w-full"
//       priority
//     />
//   );
// };
