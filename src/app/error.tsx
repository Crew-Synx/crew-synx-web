'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error('[GlobalError]', error);
	}, [error]);

	return (
		<div className="flex h-screen w-full flex-col items-center justify-center gap-4 p-6 text-center">
			<AlertTriangle className="h-12 w-12 text-destructive" />
			<h1 className="text-2xl font-semibold">Something went wrong</h1>
			<p className="max-w-md text-muted-foreground">
				An unexpected error occurred. Please try again or contact support if the problem persists.
			</p>
			{error.digest && (
				<p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
			)}
			<Button onClick={reset}>Try again</Button>
		</div>
	);
}
