import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from './login-form';
import { LogoMark } from '@/components/ui/logo';

export const metadata: Metadata = {
  title: 'Sign In | CrewSynx',
  description: 'Sign in to CrewSynx with your employee ID and a one-time password.',
};

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center">
            <LogoMark size={56} />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Sign in to CrewSynx
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email to receive a one-time password
          </p>
        </div>
        <Suspense fallback={<div>Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
