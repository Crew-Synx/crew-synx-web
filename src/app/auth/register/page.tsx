'use client';

import { Suspense, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, User } from 'lucide-react';
import RegisterForm from './register-form';
import Link from 'next/link';

type RegistrationType = 'individual' | 'organization';

function TypeSelector({ onSelect }: { onSelect: (type: RegistrationType) => void }) {
  const [selected, setSelected] = useState<RegistrationType | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${selected === 'individual'
              ? 'ring-2 ring-primary border-primary'
              : 'border-muted'
            }`}
          onClick={() => setSelected('individual')}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Individual</h3>
            <p className="text-xs text-muted-foreground">
              Join an existing organization or explore on your own
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all hover:shadow-md ${selected === 'organization'
              ? 'ring-2 ring-primary border-primary'
              : 'border-muted'
            }`}
          onClick={() => setSelected('organization')}
        >
          <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Organization</h3>
            <p className="text-xs text-muted-foreground">
              Create a new workspace and invite your team
            </p>
          </CardContent>
        </Card>
      </div>

      <Button
        className="w-full h-12 text-base font-semibold"
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
      >
        Continue
      </Button>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link href="/auth/login" className="font-medium text-primary hover:text-primary/90">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [registrationType, setRegistrationType] = useState<RegistrationType | null>(null);

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
            {registrationType ? 'Create an account' : 'How will you use Crewsynx?'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {registrationType
              ? `Signing up as ${registrationType === 'individual' ? 'an individual' : 'an organization'}`
              : 'Choose how you want to get started'}
          </p>
        </div>

        {registrationType ? (
          <Suspense fallback={<div>Loading form...</div>}>
            <RegisterForm
              registrationType={registrationType}
              onBack={() => setRegistrationType(null)}
            />
          </Suspense>
        ) : (
          <TypeSelector onSelect={setRegistrationType} />
        )}
      </div>
    </div>
  );
}
