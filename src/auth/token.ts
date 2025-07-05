import { cookies } from 'next/headers';

export const getTokenFromCookies = async () => {
  const token = (await cookies()).get('CASHTRACKER_TOKEN')?.value;
  return token;
};
