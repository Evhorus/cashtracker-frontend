import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { User, UserSchema } from '../schemas';
import { getTokenFromCookies } from './token';

type verifySession = {
  user: User | null;
  isAuth: boolean;
};

export const getSessionData = cache(async (token: string) => {
  const url = `${process.env.API_URL}/auth/user`;

  const req = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return req.json();
});

export const verifySession = async () => {
  const token = await getTokenFromCookies();

  if (!token) {
    return {
      user: null,
      isAuth: false,
    };
  }

  try {
    const session = await getSessionData(token);
    const result = UserSchema.safeParse(session);

    if (!result.success) {
      redirect('/');
    }

    return {
      user: result.data,
      isAuth: true,
    };
  } catch (error) {
    console.log(error);
    redirect('/');
  }
};
