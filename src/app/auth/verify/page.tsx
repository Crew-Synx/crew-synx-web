import { Suspense } from 'react';
import VerifyForm from './verify-form';

export default function VerifyPage() {
  return (
    <div className="flex h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
