'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { OtpInput } from '@/components/ui/otp-input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PUBLIC_API_URL } from '@/lib/api';
import { getApiErrorMessage, getRetryAfterSeconds, RequestOtpPayloadSchema, VerifyOtpPayloadSchema } from '@/lib/schemas';

export default function VerifyForm() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
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

  useEffect(() => {
    if (retryAfterSeconds <= 0) return;
    const timer = setTimeout(() => setRetryAfterSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [retryAfterSeconds]);

  const handleResend = useCallback(async () => {
    if (!userId || isResending || resendCountdown > 0) return;

    const payloadResult = RequestOtpPayloadSchema.safeParse({ user_id: userId.trim() });
    if (!payloadResult.success) {
      setError('Missing user identifier. Please go back and sign in again.');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch(`${PUBLIC_API_URL}/auth/request-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadResult.data),
      });

      if (!response.ok) {
        let retrySeconds: number | null = null;
        if (response.status === 429) {
          retrySeconds = getRetryAfterSeconds(response.headers) ?? 60;
          setRetryAfterSeconds(retrySeconds);
        }

        const errorData = await response.json().catch(() => ({}));
        const fallback = response.status === 429 && retrySeconds
          ? `Too many requests. Try again in ${retrySeconds} seconds.`
          : 'Unable to resend code right now.';
        setError(getApiErrorMessage(errorData, fallback));
        return;
      }

      setError(null);
      setResendCountdown(30);
    } catch {
      setError('Unable to resend code right now. Please try again.');
    } finally {
      setIsResending(false);
    }
  }, [userId, isResending, resendCountdown, retryAfterSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payloadResult = VerifyOtpPayloadSchema.safeParse({
      user_id: userId?.trim() ?? '',
      otp: otp.trim(),
    });
    if (!payloadResult.success) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the Next.js route handler — tokens are set as httpOnly cookies server-side
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadResult.data),
        credentials: 'include',
      });

      if (!response.ok) {
        let retrySeconds: number | null = null;
        if (response.status === 429) {
          retrySeconds = getRetryAfterSeconds(response.headers) ?? 60;
          setRetryAfterSeconds(retrySeconds);
        }

        const data = await response.json().catch(() => ({}));
        const fallback = response.status === 429 && retrySeconds
          ? `Too many requests. Try again in ${retrySeconds} seconds.`
          : 'Invalid or expired OTP';
        throw new Error(getApiErrorMessage(data, fallback));
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

          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading || otp.length < 6 || retryAfterSeconds > 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : retryAfterSeconds > 0 ? (
              `Try again in ${retryAfterSeconds}s`
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
              Change Email
            </Link>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
