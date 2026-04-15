import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL!;
const ACCESS_COOKIE = 'crewsynx_access';
const REFRESH_COOKIE = 'crewsynx_refresh';
const ACCESS_MAX_AGE = 60 * 15;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function cookieBase(req: NextRequest) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

/** Forward response headers except those that would break the proxy */
function copyResponseHeaders(from: Response, to: NextResponse) {
  const skip = new Set(['set-cookie', 'transfer-encoding', 'connection', 'content-encoding']);
  from.headers.forEach((value, key) => {
    if (!skip.has(key.toLowerCase())) {
      to.headers.set(key, value);
    }
  });
}

export async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  // ── CSRF: same-origin check for mutating methods ──────────────────
  if (MUTATING_METHODS.has(req.method)) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const { path } = await params;
  const pathStr = path.join('/');
  const search = req.nextUrl.search;
  const djangoUrl = `${API_URL}/${pathStr}/${search}`;

  const accessToken = req.cookies.get(ACCESS_COOKIE)?.value;

  const isMultipart = req.headers.get('content-type')?.includes('multipart/form-data');
  const contentType = req.headers.get('content-type');

  const forwardHeaders: Record<string, string> = {
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(contentType && !isMultipart ? { 'Content-Type': contentType } : {}),
  };

  const orgId = req.headers.get('x-organization-id');
  if (orgId) forwardHeaders['X-Organization-ID'] = orgId;

  // Buffer body for non-streaming requests so we can retry on 401
  let bodyBuffer: ArrayBuffer | null = null;
  if (!isMultipart && req.body) {
    try {
      bodyBuffer = await req.arrayBuffer();
    } catch {
      // body may be null for GET/HEAD
    }
  }

  const makeRequest = () =>
    fetch(djangoUrl, {
      method: req.method,
      headers: forwardHeaders,
      // For multipart, stream directly. For others, use buffered body.
      body: req.method !== 'GET' && req.method !== 'HEAD'
        ? isMultipart
          ? req.body
          : bodyBuffer
        : undefined,
      // Required for streaming request bodies in Node.js fetch
      ...(isMultipart ? { duplex: 'half' } : {}),
    } as RequestInit);

  let djangoRes = await makeRequest();

  // ── 401: attempt token refresh, then retry (non-multipart only) ──
  if (djangoRes.status === 401 && !isMultipart) {
    const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;

    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json().catch(() => ({}));
        const newAccess: string | undefined = refreshData?.data?.access_token;
        const newRefresh: string | undefined = refreshData?.data?.refresh_token;

        if (newAccess) {
          forwardHeaders['Authorization'] = `Bearer ${newAccess}`;
          djangoRes = await makeRequest();

          // Set updated tokens in response cookies
          if (djangoRes.status !== 401) {
            const base = cookieBase(req);
            const retryBody = await djangoRes.arrayBuffer();
            const retryResponse = new NextResponse(retryBody, {
              status: djangoRes.status,
              statusText: djangoRes.statusText,
            });
            copyResponseHeaders(djangoRes, retryResponse);
            retryResponse.cookies.set(ACCESS_COOKIE, newAccess, { ...base, maxAge: ACCESS_MAX_AGE });
            if (newRefresh) {
              retryResponse.cookies.set(REFRESH_COOKIE, newRefresh, { ...base, maxAge: REFRESH_MAX_AGE });
            }
            return retryResponse;
          }
        }
      }
    }

    // Refresh failed or no refresh token — clear cookies and return 401
    const unauthRes = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const base = cookieBase(req);
    unauthRes.cookies.set(ACCESS_COOKIE, '', { ...base, maxAge: 0 });
    unauthRes.cookies.set(REFRESH_COOKIE, '', { ...base, maxAge: 0 });
    return unauthRes;
  }

  const NO_BODY_STATUSES = new Set([204, 304]);
  const responseBody = NO_BODY_STATUSES.has(djangoRes.status) ? null : await djangoRes.arrayBuffer();
  const proxyResponse = new NextResponse(responseBody, {
    status: djangoRes.status,
    statusText: djangoRes.statusText,
  });
  copyResponseHeaders(djangoRes, proxyResponse);
  return proxyResponse;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
