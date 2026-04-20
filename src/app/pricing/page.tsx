import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Badge } from '@/components/ui/badge';
import { ContactForm } from '@/components/landing/contact-form';
import { Key, Server, Wrench } from 'lucide-react';

const licenseHighlights = [
	{
		icon: Key,
		title: 'Lifetime License',
		description:
			'You buy the license for a specific version and own it forever. No renewals, no per-seat fees, no expiry.',
	},
	{
		icon: Server,
		title: 'Deploy on Your Infrastructure',
		description:
			'Host on your own server, VPS, or private cloud. Your data stays entirely within your control.',
	},
	{
		icon: Wrench,
		title: 'Custom Features on Request',
		description:
			'Tell us what you need. We build it and ship it as part of your licensed version at no extra cost.',
	},
];

export const metadata: Metadata = {
	title: 'Contact & Pricing | CrewSynx',
	description:
		'Pricing is tailored to your team size and needs. Get in touch and we will put together a quote.',
};

export default function PricingPage() {
	return (
		<div className="min-h-screen">
			<Navbar />

			{/* Header */}
			<section className="relative overflow-hidden">
				<div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pt-32 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<Badge variant="secondary" className="mb-4">Pricing & Contact</Badge>
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
							No price list. Just a conversation.
						</h1>
						<p className="mt-4 text-lg text-muted-foreground">
							CrewSynx is sold as a lifetime license — no subscriptions, no recurring fees. Pricing
							depends on your team size and requirements. Fill out the form and we&apos;ll get back
							to you with a tailored quote.
						</p>
					</div>
				</div>
			</section>

			{/* License highlights */}
			<section className="border-y border-border/50 bg-muted/30">
				<div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
					<div className="grid gap-8 md:grid-cols-3">
						{licenseHighlights.map((item) => (
							<div key={item.title} className="flex gap-4">
								<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
									<item.icon className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="font-semibold">{item.title}</h3>
									<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
										{item.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Contact form */}
			<section>
				<div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
					<div className="mb-10 text-center">
						<Badge variant="outline" className="mb-4">Get a Quote</Badge>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Tell us about your team
						</h2>
						<p className="mt-3 text-muted-foreground">
							Share your requirements and any custom feature requests. We&apos;ll respond within one
							business day.
						</p>
					</div>
					<ContactForm />
				</div>
			</section>

			<Footer />
		</div>
	);
}
