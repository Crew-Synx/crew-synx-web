import type { Metadata } from 'next';
import { Suspense } from 'react';
import VerifyForm from './verify-form';
import { LogoMark } from '@/components/ui/logo';

export const metadata: Metadata = {
  title: 'Verify OTP | CrewSynx',
  description: 'Enter the one-time password sent to your email to complete sign in.',
};

export default function VerifyPage() {
  return (
    <div className="flex h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center">
            <LogoMark size={56} />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Verify your identity
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a 6-digit code to your email
          </p>
        </div>
        <Suspense fallback={<div>Loading form...</div>}>
          <VerifyForm />
        </Suspense>
      </div>
    </div>
  );
}
