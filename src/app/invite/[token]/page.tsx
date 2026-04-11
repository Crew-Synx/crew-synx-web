'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const API = 'https://crewsynx.switchspace.in/api/v1';

function getToken() {
	return localStorage.getItem('access_token');
}

export default function AcceptInvitePage() {
	const { token } = useParams<{ token: string }>();
	const router = useRouter();
	const [status, setStatus] = useState<'loading' | 'accepting' | 'success' | 'error' | 'unauthenticated'>('loading');
	const [message, setMessage] = useState('');

	useEffect(() => {
		const accessToken = getToken();
		if (!accessToken) {
			setStatus('unauthenticated');
			return;
		}
		setStatus('accepting');
	}, []);

	const acceptInvite = async () => {
		setStatus('accepting');
		try {
			const res = await fetch(`${API}/organizations/accept-invite/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${getToken()}`,
				},
				body: JSON.stringify({ token }),
			});

			const data = await res.json();

			if (res.ok) {
				setStatus('success');
				setMessage('You have joined the organization!');
				setTimeout(() => router.push('/dashboard'), 2000);
			} else {
				setStatus('error');
				setMessage(data.message || 'Failed to accept invite.');
			}
		} catch {
			setStatus('error');
			setMessage('Something went wrong. Please try again.');
		}
	};

	useEffect(() => {
		if (status === 'accepting') {
			acceptInvite();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardContent className="pt-8 pb-8 text-center space-y-4">
					{(status === 'loading' || status === 'accepting') && (
						<>
							<Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
							<p className="text-muted-foreground">Accepting your invitation...</p>
						</>
					)}

					{status === 'success' && (
						<>
							<CheckCircle2 className="h-10 w-10 mx-auto text-green-500" />
							<p className="text-lg font-semibold">{message}</p>
							<p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
						</>
					)}

					{status === 'error' && (
						<>
							<XCircle className="h-10 w-10 mx-auto text-red-500" />
							<p className="text-lg font-semibold">{message}</p>
							<Button onClick={() => router.push('/dashboard')} className="mt-4">
								Go to Dashboard
							</Button>
						</>
					)}

					{status === 'unauthenticated' && (
						<>
							<p className="text-lg font-semibold">Sign in to accept this invite</p>
							<p className="text-sm text-muted-foreground">
								You need to be logged in to accept an organization invitation.
							</p>
							<Button
								onClick={() => router.push(`/auth/login?redirect_uri=/invite/${token}`)}
								className="mt-4"
							>
								Sign In
							</Button>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
