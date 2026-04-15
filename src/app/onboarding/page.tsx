'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function OnboardingPage() {
	const [orgName, setOrgName] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const handleCreateOrg = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setIsLoading(true);
		try {
			const res = await apiFetch('/organizations/', {
				method: 'POST',
				body: JSON.stringify({ name: orgName }),
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				throw new Error(errorData.message || errorData.error || 'Failed to create organization');
			}

			router.push('/dashboard');
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Failed to create organization');
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
						Create an organization
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Give your organization a name to get started
					</p>
				</div>

				<Card className="shadow-lg border-0 bg-card text-card-foreground">
					<CardContent className="pt-6">
						<form className="space-y-6" onSubmit={handleCreateOrg}>
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

							{error && (
								<p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
							)}

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
			</div>
		</div>
	);
}
