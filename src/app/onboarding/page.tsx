'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { LogoMark } from '@/components/ui/logo';

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

			const orgData = await res.json().catch(() => ({}));
			if (orgData?.data) {
				localStorage.setItem('selected_org', JSON.stringify(orgData.data));
			}

			router.push('/setup');
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Failed to create organization');
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center px-6">
			<div className="w-full max-w-sm space-y-8">
				<div className="space-y-4">
					<LogoMark size={48} />
					<div>
						<h1 className="text-2xl font-semibold tracking-tight">Create your organization</h1>
						<p className="text-sm text-muted-foreground mt-1">You can change this later from settings</p>
					</div>
				</div>

				<form className="space-y-4" onSubmit={handleCreateOrg}>
					<div>
						<Label htmlFor="orgName" className="text-sm font-medium">Organization name</Label>
						<Input
							id="orgName"
							required
							value={orgName}
							onChange={(e) => setOrgName(e.target.value)}
							placeholder="Acme Corp"
							className="mt-1.5"
							disabled={isLoading}
							autoFocus
						/>
					</div>

					{error && (
						<p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
					)}

					<Button
						type="submit"
						className="w-full"
						disabled={isLoading || !orgName.trim()}
					>
						{isLoading ? (
							<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
						) : (
							'Continue'
						)}
					</Button>
				</form>
			</div>
		</div>
	);
}
