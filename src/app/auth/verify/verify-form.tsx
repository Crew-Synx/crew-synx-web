'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyForm() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
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
      await fetch('https://crewsynx.switchspace.in/api/v1/auth/request-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      setResendCountdown(30);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    } finally {
      setIsResending(false);
    }
  }, [userId, isResending, resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('https://crewsynx.switchspace.in/api/v1/auth/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, otp }),
      });

      if (!response.ok) {
        throw new Error('Invalid or expired OTP');
      }

      const data = await response.json();
      const token = data.data.access_token;

      if (redirectUri) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
        // Support both absolute URLs and relative paths
        try {
          const link = new URL(redirectUri, window.location.origin);
          router.push(link.pathname + link.search);
        } catch {
          router.push(redirectUri);
        }
      } else {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
        if (registrationType === 'organization') {
          router.push('/setup');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      // In a real app, show a toast error here
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-card text-card-foreground">
      <CardContent className="pt-6">
        <form className="space-y-6" onSubmit={handleSubmit}>

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
