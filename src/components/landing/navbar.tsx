'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';

const navLinks = [
	{ label: 'Features', href: '#features' },
	{ label: 'Downloads', href: '#downloads' },
	{ label: 'Contact & Pricing', href: '/pricing' },
];

export function Navbar() {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Logo size={32} />

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

					</div>
				</div>
			)}
		</header>
	);
}
