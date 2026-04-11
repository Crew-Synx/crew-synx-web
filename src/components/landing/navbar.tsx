'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const navLinks = [
	{ label: 'Features', href: '#features' },
	{ label: 'Pricing', href: '/pricing' },
	{ label: 'Testimonials', href: '#testimonials' },
];

export function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
						C
					</div>
					<span className="text-lg font-bold tracking-tight">CrewSynx</span>
				</Link>

				{/* Desktop nav */}
				<nav className="hidden items-center gap-8 md:flex">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
						>
							{link.label}
						</Link>
					))}
				</nav>

				<div className="hidden items-center gap-3 md:flex">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/auth/login">Log in</Link>
					</Button>
					<Button size="sm" asChild>
						<Link href="/auth/register">Get Started</Link>
					</Button>
				</div>

				{/* Mobile toggle */}
				<button
					className="md:hidden"
					onClick={() => setMobileOpen(!mobileOpen)}
					aria-label="Toggle menu"
				>
					{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
				</button>
			</div>

			{/* Mobile nav */}
			{mobileOpen && (
				<div className="border-t border-border/50 bg-background px-4 pb-4 pt-2 md:hidden">
					<nav className="flex flex-col gap-3">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
								onClick={() => setMobileOpen(false)}
							>
								{link.label}
							</Link>
						))}
					</nav>
					<div className="mt-4 flex flex-col gap-2">
						<Button variant="ghost" size="sm" asChild>
							<Link href="/auth/login">Log in</Link>
						</Button>
						<Button size="sm" asChild>
							<Link href="/auth/register">Get Started</Link>
						</Button>
					</div>
				</div>
			)}
		</header>
	);
}
