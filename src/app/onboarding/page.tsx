'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Search, Plus, Loader2 } from 'lucide-react';

type OnboardingStep = 'choice' | 'create' | 'join';

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('choice');
  const [orgName, setOrgName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getToken = () => localStorage.getItem('access_token');

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/organizations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: orgName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create organization');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/organizations/join/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ invite_code: inviteCode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join organization');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            {step === 'choice' && 'Set up your workspace'}
            {step === 'create' && 'Create an organization'}
            {step === 'join' && 'Join an organization'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === 'choice' && 'Create a new organization or join an existing one'}
            {step === 'create' && 'Give your organization a name to get started'}
            {step === 'join' && 'Enter the invite code shared by your team'}
          </p>
        </div>

        {step === 'choice' && (
          <div className="space-y-4">
            <Card
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
              onClick={() => setStep('create')}
            >
              <CardContent className="flex items-center gap-4 py-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Create an organization</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up a new workspace and invite your team
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
              onClick={() => setStep('join')}
            >
              <CardContent className="flex items-center gap-4 py-6">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Join an organization</h3>
                  <p className="text-sm text-muted-foreground">
                    Use an invite code to join your team&apos;s workspace
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => router.push('/dashboard')}
            >
              Skip for now
            </Button>
          </div>
        )}

        {step === 'create' && (
          <Card className="shadow-lg border-0 bg-card text-card-foreground">
            <CardContent className="pt-6">
              <form className="space-y-6" onSubmit={handleCreateOrg}>
                <button
                  type="button"
                  onClick={() => setStep('choice')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <div className="space-y-2">
                  <Label htmlFor="orgName" className="font-semibold">Organization Name</Label>
                  <Input
                    id="orgName"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="My Company"
                    className="w-full p-3 bg-muted/50"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading || !orgName.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Organization'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'join' && (
          <Card className="shadow-lg border-0 bg-card text-card-foreground">
            <CardContent className="pt-6">
              <form className="space-y-6" onSubmit={handleJoinOrg}>
                <button
                  type="button"
                  onClick={() => setStep('choice')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <div className="space-y-2">
                  <Label htmlFor="inviteCode" className="font-semibold">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter invite code"
                    className="w-full p-3 bg-muted/50"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={isLoading || !inviteCode.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Organization'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
