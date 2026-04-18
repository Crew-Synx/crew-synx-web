'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PUBLIC_API_URL } from '@/lib/api';
import { getApiErrorMessage, getRetryAfterSeconds, RequestOtpPayloadSchema } from '@/lib/schemas';

export default function LoginForm() {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number>(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');

  useEffect(() => {
    if (retryAfterSeconds <= 0) return;
    const timer = setTimeout(() => setRetryAfterSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [retryAfterSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (retryAfterSeconds > 0) return;

    const payloadResult = RequestOtpPayloadSchema.safeParse({ user_id: userId.trim() });
    if (!payloadResult.success) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

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
        let errorMessage = getApiErrorMessage(errorData, 'Failed to send OTP');
        if (response.status === 429 && retrySeconds) {
          errorMessage = `Too many requests. Try again in ${retrySeconds} seconds.`;
        }
        throw new Error(errorMessage);
      }

      const query = new URLSearchParams();
      query.set('user_id', payloadResult.data.user_id);
      if (redirectUri) query.set('redirect_uri', redirectUri);

      router.push(`/auth/verify?${query.toString()}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
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
            <Label htmlFor="userId" className="font-semibold text-gray-700">Email</Label>
            <Input
              id="userId"
              name="userId"
              type="email"
              autoComplete="email"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="you@email.com"
              className="w-full p-3 h-12 bg-muted/50"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading || !userId.trim() || retryAfterSeconds > 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending OTP...
              </>
            ) : retryAfterSeconds > 0 ? (
              `Try again in ${retryAfterSeconds}s`
            ) : (
              'Continue'
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/auth/register" className="font-medium text-primary hover:text-primary/90">
              Register here
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
