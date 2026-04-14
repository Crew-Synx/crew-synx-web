import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL!;
const ACCESS_COOKIE = 'crewsynx_access';
const REFRESH_COOKIE = 'crewsynx_refresh';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

  // Best-effort: call Django logout even if refresh token is missing
  if (refreshToken) {
    try {
      await fetch(`${API_URL}/auth/logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Server-side logout failure is non-fatal; we always clear cookies
    }
  }

  const res = NextResponse.json({ ok: true });
  const expireCookie = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 0 };
  res.cookies.set(ACCESS_COOKIE, '', expireCookie);
  res.cookies.set(REFRESH_COOKIE, '', expireCookie);
  return res;
}
