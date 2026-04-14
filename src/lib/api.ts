// Public API URL — only for unauthenticated forms (login, register).
// Authenticated calls go through /api/proxy which reads httpOnly cookies.
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

// ─── 429 Rate-Limit Toast (deduplicated) ────────────────────────────
let lastRateLimitToast = 0;
const RATE_LIMIT_TOAST_COOLDOWN_MS = 5_000;

function showRateLimitToast(retryAfterSec: number | null) {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (now - lastRateLimitToast < RATE_LIMIT_TOAST_COOLDOWN_MS) return;
  lastRateLimitToast = now;

  // Dynamic import to avoid SSR issues
  import('sonner').then(({ toast }) => {
    const msg = retryAfterSec
      ? `Too many requests. Try again in ${retryAfterSec} seconds.`
      : 'Too many requests. Please wait a moment and try again.';
    toast.warning(msg, { id: 'rate-limit', duration: (retryAfterSec ?? 5) * 1000 });
  });
}

/**
 * All authenticated API calls must go through this function.
 * Tokens are stored exclusively in httpOnly cookies and are managed by the
 * /api/proxy route handler — never accessible from client-side JS.
 *
 * @param path    Django API path starting with "/" (e.g. "/organizations/")
 * @param options Standard fetch options + optional orgId and silent429 flag
 */
export async function apiFetch(
  path: string,
  options: RequestInit & { orgId?: string; silent429?: boolean } = {},
): Promise<Response> {
  const { orgId, silent429, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  // JSON content-type for non-FormData bodies
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (orgId) headers['X-Organization-ID'] = orgId;

  const res = await fetch(`/api/proxy${path}`, {
    ...fetchOptions,
    credentials: 'include',
    headers,
  });

  if (res.status === 401) {
    // Cookies already cleared by proxy; redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    throw new Error('Unauthorized');
  }

  if (res.status === 429 && !silent429) {
    const retryAfter = res.headers.get('Retry-After');
    const seconds = retryAfter ? parseInt(retryAfter, 10) : null;
    showRateLimitToast(Number.isFinite(seconds) ? seconds : null);
  }

  return res;
}
