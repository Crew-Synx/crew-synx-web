import Link from 'next/link';

export default function NotFound() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<div className="text-center space-y-4 p-8">
				<h1 className="text-6xl font-bold text-muted-foreground">404</h1>
				<h2 className="text-xl font-semibold">Page Not Found</h2>
				<p className="text-muted-foreground max-w-md">
					The page you&apos;re looking for doesn&apos;t exist or has been moved.
				</p>
				<Link
					href="/dashboard"
					className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
				>
					Go to Dashboard
				</Link>
			</div>
		</div>
	);
}
