'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PUBLIC_API_URL } from '@/lib/api';

export default function VerifyForm() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  const userId = searchParams.get('user_id');
  const registrationType = searchParams.get('registration_type');

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleResend = useCallback(async () => {
    if (!userId || isResending || resendCountdown > 0) return;
    setIsResending(true);
    try {
      await fetch(`${PUBLIC_API_URL}/auth/request-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      setResendCountdown(30);
    } catch {
      // Resend failure is non-fatal
    } finally {
      setIsResending(false);
    }
  }, [userId, isResending, resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Call the Next.js route handler — tokens are set as httpOnly cookies server-side
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, otp }),
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Invalid or expired OTP');
      }

      if (redirectUri) {
        try {
          const link = new URL(redirectUri, window.location.origin);
          router.push(link.pathname + link.search);
        } catch {
          router.push(redirectUri);
        }
      } else if (registrationType === 'organization') {
        router.push('/setup');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-card text-card-foreground">
      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="otp" className="font-semibold">6-Digit Code</Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="000000"
              className="w-full text-center text-2xl tracking-widest p-3 h-14 bg-muted/50"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading || otp.length < 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify & Sign In'
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Didn't receive the code? </span>
            {resendCountdown > 0 ? (
              <span className="text-muted-foreground">Resend in {resendCountdown}s</span>
            ) : (
              <button type="button" onClick={handleResend} disabled={isResending} className="font-medium text-primary hover:text-primary/90 disabled:opacity-50">
                {isResending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          <div className="text-center text-sm mt-2">
            <Link href={redirectUri ? `/auth/login?redirect_uri=${encodeURIComponent(redirectUri)}` : "/auth/login"} className="font-medium text-muted-foreground hover:text-foreground">
              Change Employee ID
            </Link>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
