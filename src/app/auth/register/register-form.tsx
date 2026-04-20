'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PUBLIC_API_URL } from '@/lib/api';
import { getApiErrorMessage, getRetryAfterSeconds, RegisterPayloadSchema } from '@/lib/schemas';

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
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    if (retryAfterSeconds <= 0) return;
    const timer = setTimeout(() => setRetryAfterSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [retryAfterSeconds]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (retryAfterSeconds > 0) return;

    const payloadResult = RegisterPayloadSchema.safeParse({
      email: formData.email.trim(),
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      registration_type: 'organization',
      organization_name: formData.company.trim(),
    });

    if (!payloadResult.success) {
      setError('Please complete all fields with valid values.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${PUBLIC_API_URL}/auth/register/`, {
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
        const fallback = response.status === 429 && retrySeconds
          ? `Too many requests. Try again in ${retrySeconds} seconds.`
          : 'Registration failed';
        throw new Error(getApiErrorMessage(errorData, fallback));
      }

      const query = new URLSearchParams();
      query.set('user_id', payloadResult.data.email);
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
            <FloatingLabelInput
              id="firstName"
              label="First Name"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className="bg-muted/50"
              disabled={isLoading}
            />
            <FloatingLabelInput
              id="lastName"
              label="Last Name"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="bg-muted/50"
              disabled={isLoading}
            />
          </div>

          <FloatingLabelInput
            id="email"
            label="Email address"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="bg-muted/50"
            disabled={isLoading}
          />

          <FloatingLabelInput
            id="company"
            label="Organization Name"
            name="company"
            required
            value={formData.company}
            onChange={handleInputChange}
            className="bg-muted/50"
            disabled={isLoading}
          />

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
            disabled={isLoading || !agreed || retryAfterSeconds > 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : retryAfterSeconds > 0 ? (
              `Try again in ${retryAfterSeconds}s`
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
