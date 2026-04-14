import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';

const plans = [
	{
		name: 'Free',
		description: 'For small teams getting started',
		price: '$0',
		period: 'forever',
		badge: null,
		features: [
			'Up to 5 team members',
			'2 active projects',
			'Basic kanban boards',
			'Team chat',
			'Attendance tracking',
			'Community support',
		],
		cta: 'Get Started',
		ctaVariant: 'outline' as const,
		href: '/auth/register',
	},
	{
		name: 'Pro',
		description: 'For growing teams that need more',
		price: '$12',
		period: 'per user / month',
		badge: 'Most Popular',
		features: [
			'Unlimited team members',
			'Unlimited projects',
			'Advanced kanban & timelines',
			'Team chat with channels',
			'Attendance with geo-fencing',
			'Analytics & reports',
			'Role-based access control',
			'Integrations (Slack, Google)',
			'Priority email support',
		],
		cta: 'Start Free Trial',
		ctaVariant: 'default' as const,
		href: '/auth/register?plan=pro',
	},
	{
		name: 'Enterprise',
		description: 'For large organizations',
		price: 'Custom',
		period: 'tailored to your needs',
		badge: null,
		features: [
			'Everything in Pro',
			'SSO / SAML authentication',
			'Advanced audit logs',
			'Custom integrations',
			'Dedicated account manager',
			'SLA guarantee (99.99%)',
			'On-premises deployment option',
			'Custom onboarding & training',
			'Phone & Slack support',
		],
		cta: 'Contact Sales',
		ctaVariant: 'outline' as const,
		href: '#',
	},
];

const faqs = [
	{
		q: 'Can I switch plans later?',
		a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
	},
	{
		q: 'Is there a free trial for the Pro plan?',
		a: 'Absolutely! Every Pro plan starts with a 14-day free trial. No credit card required.',
	},
	{
		q: 'What happens when I exceed the free plan limits?',
		a: "You'll be prompted to upgrade. Your existing data is never deleted — you just won't be able to add more until you upgrade or remove items.",
	},
	{
		q: 'Do you offer discounts for nonprofits or education?',
		a: 'Yes! We offer 50% off Pro plans for verified nonprofit organizations and educational institutions. Contact our sales team.',
	},
	{
		q: 'How does billing work?',
		a: 'Pro plans are billed monthly or annually (save 20% with annual). Enterprise plans are invoiced based on your agreement.',
	},
	{
		q: 'Can I cancel anytime?',
		a: 'Yes. There are no long-term contracts. Cancel anytime from your settings and you won\'t be charged again.',
	},
];

export const metadata: Metadata = {
	title: 'Pricing | CrewSynx',
	description: 'Simple, transparent pricing for teams of all sizes. Start free, scale as you grow.',
};

export default function PricingPage() {
	return (
		<div className="min-h-screen">
			<Navbar />

			{/* Header */}
			<section className="relative overflow-hidden">
				<div className="mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 sm:pt-32 lg:px-8">
					<div className="mx-auto max-w-2xl text-center">
						<Badge variant="secondary" className="mb-4">Pricing</Badge>
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
							Simple, transparent pricing
						</h1>
						<p className="mt-4 text-lg text-muted-foreground">
							Start free. Scale as you grow. No hidden fees.
						</p>
					</div>
				</div>
			</section>

			{/* Plans */}
			<section className="pb-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid gap-8 lg:grid-cols-3">
						{plans.map((plan) => (
							<Card
								key={plan.name}
								className={`relative flex flex-col border-border/50 ${plan.badge ? 'ring-2 ring-primary shadow-lg' : ''
									}`}
							>
								{plan.badge && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2">
										<Badge className="px-3 py-1">{plan.badge}</Badge>
									</div>
								)}
								<CardHeader className="pb-2">
									<CardTitle className="text-xl">{plan.name}</CardTitle>
									<CardDescription>{plan.description}</CardDescription>
								</CardHeader>
								<CardContent className="flex flex-1 flex-col">
									<div className="mb-6">
										<span className="text-4xl font-bold">{plan.price}</span>
										{plan.period !== 'forever' && plan.price !== 'Custom' && (
											<span className="ml-1 text-sm text-muted-foreground">
												{plan.period}
											</span>
										)}
										{plan.period === 'forever' && (
											<span className="ml-2 text-sm text-muted-foreground">
												{plan.period}
											</span>
										)}
										{plan.price === 'Custom' && (
											<p className="mt-1 text-sm text-muted-foreground">
												{plan.period}
											</p>
										)}
									</div>

									<ul className="mb-8 flex-1 space-y-3">
										{plan.features.map((feature) => (
											<li key={feature} className="flex items-start gap-3 text-sm">
												<Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
												<span>{feature}</span>
											</li>
										))}
									</ul>

									<Button
										variant={plan.ctaVariant}
										className="w-full h-11"
										asChild
									>
										<Link href={plan.href}>
											{plan.cta}
											{plan.ctaVariant === 'default' && (
												<ArrowRight className="ml-2 h-4 w-4" />
											)}
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* FAQs */}
			<section className="border-t border-border/50 bg-muted/30">
				<div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
					<div className="text-center">
						<Badge variant="outline" className="mb-4">FAQ</Badge>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Frequently asked questions
						</h2>
					</div>
					<div className="mt-12 space-y-6">
						{faqs.map((faq) => (
							<div key={faq.q} className="rounded-lg border border-border/50 bg-card p-6">
								<div className="flex items-start gap-3">
									<HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
									<div>
										<h3 className="font-semibold">{faq.q}</h3>
										<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
											{faq.a}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-border/50">
				<div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
					<div className="text-center">
						<h2 className="text-2xl font-bold sm:text-3xl">
							Still have questions?
						</h2>
						<p className="mt-2 text-muted-foreground">
							Our team is here to help you find the right plan.
						</p>
						<div className="mt-6 flex justify-center gap-4">
							<Button variant="outline" asChild>
								<Link href="#">Talk to Sales</Link>
							</Button>
							<Button asChild>
								<Link href="/auth/register">
									Get Started Free
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}
