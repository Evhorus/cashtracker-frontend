import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { User, UserSchema } from '../schemas';
import { getTokenFromCookies } from './token';

type verifySession = {
  user: User;
  isAuth: boolean;
};

export const verifySession = cache(async () => {
  const token =  await getTokenFromCookies();

  if (!token) {
    redirect('/auth/login');
  }

  const url = `${process.env.API_URL}/auth/user`;
  const req = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const session = await req.json();

  const result = UserSchema.safeParse(session);

  if (!result.success) {
    redirect('/auth/login');
  }

  return {
    user: result.data,
    isAuth: true,
  };
});
