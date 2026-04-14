import { NextRequest, NextResponse } from 'next/server';
import {
  getApiErrorMessage,
  VerifyOtpDjangoResponseSchema,
  VerifyOtpPayloadSchema,
} from '@/lib/schemas';

const API_URL = process.env.API_URL!;
const ACCESS_COOKIE = 'crewsynx_access';
const REFRESH_COOKIE = 'crewsynx_refresh';
// 15 minutes and 30 days in seconds
const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const payloadResult = VerifyOtpPayloadSchema.safeParse(body);
  if (!payloadResult.success) {
    return NextResponse.json({ error: 'user_id and a 6-digit otp are required' }, { status: 400 });
  }

  const { user_id, otp } = payloadResult.data;

  // Call Django server-side — tokens never touch the client
  const djangoRes = await fetch(`${API_URL}/auth/verify-otp/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, otp }),
  });

  const rawData = await djangoRes.json().catch(() => ({}));

  if (!djangoRes.ok) {
    return NextResponse.json(
      { error: getApiErrorMessage(rawData, 'OTP verification failed') },
      { status: djangoRes.status },
    );
  }

  const verifyResult = VerifyOtpDjangoResponseSchema.safeParse(rawData);
  if (!verifyResult.success) {
    return NextResponse.json({ error: 'Unexpected verification response from server' }, { status: 502 });
  }

  const accessToken = verifyResult.data.data.access_token;
  const refreshToken = verifyResult.data.data.refresh_token;

  const res = NextResponse.json({
    organizations: verifyResult.data.data.organizations ?? [],
    user: verifyResult.data.data.user ?? null,
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
