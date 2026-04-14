import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL!;
const ACCESS_COOKIE = 'crewsynx_access';
const REFRESH_COOKIE = 'crewsynx_refresh';
// 15 minutes and 30 days in seconds
const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(req: NextRequest) {
  let body: { user_id?: string; otp?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { user_id, otp } = body;
  if (!user_id || !otp) {
    return NextResponse.json({ error: 'user_id and otp are required' }, { status: 400 });
  }

  // Call Django server-side — tokens never touch the client
  const djangoRes = await fetch(`${API_URL}/auth/verify-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, otp }),
  });

  const data = await djangoRes.json().catch(() => ({}));

  if (!djangoRes.ok) {
    return NextResponse.json(
      { error: data?.error ?? data?.detail ?? 'OTP verification failed' },
      { status: djangoRes.status },
    );
  }

  const accessToken: string | undefined = data?.data?.access_token;
  const refreshToken: string | undefined = data?.data?.refresh_token;

  if (!accessToken) {
    return NextResponse.json({ error: 'No access token returned' }, { status: 502 });
  }

  const res = NextResponse.json({
    organizations: data?.data?.organizations ?? [],
    user: data?.data?.user ?? null,
  });

  const cookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  res.cookies.set(ACCESS_COOKIE, accessToken, { ...cookieBase, maxAge: ACCESS_MAX_AGE });
  if (refreshToken) {
    res.cookies.set(REFRESH_COOKIE, refreshToken, { ...cookieBase, maxAge: REFRESH_MAX_AGE });
  }

  return res;
}
