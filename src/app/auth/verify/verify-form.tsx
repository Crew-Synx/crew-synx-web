'use client';

import { useState } from 'react';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  const email = searchParams.get('email');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        throw new Error('Invalid or expired OTP');
      }

      const data = await response.json();
      const token = data.data.access_token;

      if (redirectUri) {
        const link = new URL(redirectUri);
        link.searchParams.set('token', token);
        window.location.href = link.toString();
      } else {
        localStorage.setItem('access_token', token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
        router.push('/dashboard');
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
            <button type="button" className="font-medium text-primary hover:text-primary/90">
              Resend code
            </button>
          </div>

          <div className="text-center text-sm mt-2">
            <Link href={redirectUri ? `/auth/login?redirect_uri=${encodeURIComponent(redirectUri)}` : "/auth/login"} className="font-medium text-muted-foreground hover:text-foreground">
              Change email address
            </Link>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
