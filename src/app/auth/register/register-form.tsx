'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PUBLIC_API_URL } from '@/lib/api';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: Record<string, string> = {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        registration_type: 'organization',
        organization_name: formData.company,
      };

      const response = await fetch(`${PUBLIC_API_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Registration failed');
      }

      const query = new URLSearchParams();
      query.set('user_id', formData.email);
      query.set('registration_type', 'organization');
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="font-semibold">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-3 bg-muted/50"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="font-semibold">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-3 bg-muted/50"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-semibold">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 bg-muted/50"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="font-semibold">Organization Name</Label>
            <Input
              id="company"
              name="company"
              required
              value={formData.company}
              onChange={handleInputChange}
              className="w-full p-3 bg-muted/50"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(c) => setAgreed(c as boolean)}
              disabled={isLoading}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the <Link href="/terms" className="text-primary hover:text-primary/90">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:text-primary/90">Privacy Policy</Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading || !agreed}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>

          <div className="text-center text-sm mt-4">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/login" className="font-medium text-primary hover:text-primary/90">
              Sign in
            </Link>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
