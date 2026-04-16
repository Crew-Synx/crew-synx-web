'use client';

import { Suspense } from 'react';
import RegisterForm from './register-form';
import Link from 'next/link';
import { LogoMark } from '@/components/ui/logo';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center">
            <LogoMark size={56} />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Create your organization
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Set up your workspace and start managing your team
          </p>
        </div>

        <Suspense fallback={<div>Loading form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
