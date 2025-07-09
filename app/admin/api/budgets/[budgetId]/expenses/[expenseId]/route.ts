import { verifySession } from '@/src/auth/dal';
import { getTokenFromCookies } from '@/src/auth/token';
import { redirect } from 'next/navigation';

type Params = {
  budgetId: string;
  expenseId: string;
};

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const { isAuth } = await verifySession();

  if (!isAuth) {
    redirect('/');
  }

  const { budgetId, expenseId } = await params;

  const token = await getTokenFromCookies();
  const url = `${process.env.API_URL}/budgets/${budgetId}/expenses/${expenseId}`;

  try {
    const req = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await req.json();

    if (!req.ok) {
      return Response.json(json.error, { status: 403 });
    }

    return Response.json(json);
  } catch (error) {
    console.log(error);
  }
}
