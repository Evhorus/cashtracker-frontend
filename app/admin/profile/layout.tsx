import { ProfileTabs, ToastNotification } from '@/components';


export default async function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <ProfileTabs />
      {children}
      <ToastNotification />
    </>
  );
}
