'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useDialog = (name: string) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOpen = Boolean(searchParams.get(name));

  const toggleDialog = (value?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (params.get(name)) {
      params.delete(name);
    } else if (value) {
      params.set(name, value);
    } else {
      params.set(name, 'open');
    }

    const queryString = params.toString();
    const url = `${pathname}${queryString ? `?${queryString}` : ''}`;

    router.replace(url, { scroll: false });
  };

  return { isOpen, toggleDialog };
};
