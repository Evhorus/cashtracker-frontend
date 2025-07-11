import { ProfileTabs } from '@/components';

export default async function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ProfileTabs />
      {children}
    </>
  );
}
