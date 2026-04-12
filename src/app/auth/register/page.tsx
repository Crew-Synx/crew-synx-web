'use client';

import { Suspense } from 'react';
import RegisterForm from './register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
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
