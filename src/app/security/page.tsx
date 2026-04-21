import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://crewsynx.butterflyinstruments.com';

export const metadata: Metadata = {
	title: 'Security & Compliance FAQ — CrewSynx',
	description:
		'Answers to common security and compliance questions about CrewSynx — SOC 2, GDPR, HIPAA, authentication, responsible disclosure, and how the self-hosted model gives you full control.',
	keywords: [
		'CrewSynx security',
		'self-hosted software compliance',
		'GDPR self-hosted HR platform',
		'SOC 2 self-hosted software',
		'workforce management security FAQ',
		'responsible disclosure software',
	],
	alternates: { canonical: `${BASE_URL}/security` },
	openGraph: {
		title: 'Security & Compliance FAQ — CrewSynx',
		description: 'SOC 2, GDPR, HIPAA, authentication, and responsible disclosure — how CrewSynx handles security in a self-hosted model.',
		type: 'website',
		url: `${BASE_URL}/security`,
		siteName: 'CrewSynx',
		images: [
			{
				url: `${BASE_URL}/og-image.png`,
				width: 1200,
				height: 630,
				alt: 'CrewSynx Security & Compliance',
				type: 'image/png',
			},
		],
	},
	twitter: {
		card: 'summary_large_image',
		title: 'Security & Compliance FAQ — CrewSynx',
		description: 'How CrewSynx handles security, GDPR, SOC 2, and compliance in a self-hosted deployment.',
		images: [`${BASE_URL}/og-image.png`],
	},
};

const EFFECTIVE_DATE = '21 April 2026';
const CONTACT_EMAIL = 'contact@butterflyinstruments.com';
const COMPANY_NAME = 'Butterfly Instruments';

const faqs: { q: string; a: string }[] = [
	{
		q: 'Does CrewSynx store our data?',
		a: 'No. CrewSynx is a self-hosted product — you deploy it on your own server, VPS, or private cloud. Butterfly Instruments has zero access to any data processed inside your instance. You are the sole custodian of all employee records, attendance logs, project data, and messages stored in your installation.',
	},
	{
		q: 'Is CrewSynx SOC 2 certified?',
		a: 'SOC 2 is a certification for cloud service providers that store or process customer data on shared infrastructure. Because CrewSynx does not operate as a SaaS — we ship software for you to run — the SOC 2 framework does not apply to us in the traditional sense. The compliance obligations for your deployment environment (infrastructure, access controls, backups) rest with your organisation. If you require independent assurance of the application\'s security, we can provide a third-party penetration test report upon request.',
	},
	{
		q: 'Who is responsible for GDPR / data protection compliance?',
		a: 'Your organisation is the independent data controller for all personal data processed inside your CrewSynx instance. Butterfly Instruments is not a data processor in relation to that data — we never receive, access, or host it. You are responsible for ensuring your deployment meets applicable data protection laws (GDPR, UK GDPR, CCPA, etc.) in your jurisdiction.',
	},
	{
		q: 'What personal data does Butterfly Instruments hold about us?',
		a: 'The only personal data we hold is what you voluntarily provide when contacting us — typically your name, work email, and company name submitted through our pricing/contact form. This is used solely to respond to your inquiry. See our Privacy Policy for full details.',
	},
	{
		q: 'How are security vulnerabilities handled?',
		a: `We maintain a responsible disclosure process. If you discover a security vulnerability in CrewSynx, please report it to ${CONTACT_EMAIL} with details and steps to reproduce. We will acknowledge receipt within 2 business days, investigate, and release a patch for affected versions as quickly as possible. We ask that you do not publicly disclose findings until we have had reasonable time to address them.`,
	},
	{
		q: 'Do you provide security patches for older versions?',
		a: 'We make security patches available for the Licensed Version covered by your agreement on a reasonable-efforts basis. Critical vulnerabilities are prioritised. Patches are distributed as version updates, and we notify license holders by email when a security-relevant update is available.',
	},
	{
		q: 'Can we run CrewSynx in an air-gapped environment?',
		a: 'Yes. CrewSynx is designed to run entirely on infrastructure you control with no mandatory call-home to Butterfly Instruments servers. You can deploy it in a fully isolated network if your security requirements demand it.',
	},
	{
		q: 'What authentication options are available?',
		a: 'CrewSynx supports email/password login with hashed credentials (bcrypt), role-based access control (RBAC) with granular permission sets, and organisation-level data isolation. Integration with your existing identity provider (SAML, LDAP/AD) can be scoped as a custom feature — contact us if this is a requirement.',
	},
	{
		q: 'Does CrewSynx support HIPAA compliance?',
		a: 'HIPAA compliance is the responsibility of the deploying organisation. CrewSynx does not hold protected health information (PHI) itself. Whether your use of CrewSynx involves PHI processing depends entirely on what data your organisation inputs into your instance. If you are in a HIPAA-regulated environment, your IT/compliance team should review your deployment configuration independently.',
	},
	{
		q: 'Do you offer a Data Processing Agreement (DPA)?',
		a: 'Because Butterfly Instruments does not process personal data from your CrewSynx instance, a traditional DPA (where we act as data processor) is not applicable. However, we offer a template DPA document for EU enterprise customers that formally documents this zero-access arrangement — available on our DPA page. If you have specific contractual requirements, contact us.',
	},
	{
		q: 'Where can I find your full security posture documentation?',
		a: 'We publish a one-page Security Posture overview covering our development practices, vulnerability management, and deployment security guidance. This is available on our Security Posture page, which you can share with your security team.',
	},
];

export default function SecurityFAQPage() {
	return (
		<div className="min-h-screen">
			<Navbar />

			<main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="mb-2 text-sm font-medium text-primary">Security</div>
				<h1 className="text-4xl font-bold tracking-tight">Security &amp; Compliance FAQ</h1>
				<p className="mt-4 text-muted-foreground leading-relaxed">
					Common questions from security teams, IT managers, and enterprise buyers about how CrewSynx
					handles data, compliance, and vulnerability management. Because CrewSynx is self-hosted, many
					of the answers are different from what you might expect from a SaaS product.
				</p>
				<p className="mt-2 text-sm text-muted-foreground">Last updated: {EFFECTIVE_DATE}</p>

				<div className="mt-12 space-y-10">
					{faqs.map((faq, i) => (
						<div key={i} className="border-b border-border/50 pb-10 last:border-0">
							<h2 className="text-base font-semibold leading-7">{faq.q}</h2>
							<p className="mt-3 text-sm text-muted-foreground leading-7">{faq.a}</p>
						</div>
					))}
				</div>

				<div className="mt-16 rounded-xl border border-border/60 bg-muted/40 p-8">
					<h2 className="text-lg font-semibold">Still have questions?</h2>
					<p className="mt-2 text-sm text-muted-foreground leading-7">
						If you have a specific security requirement, are filling out a vendor questionnaire, or
						need documentation for your compliance team, contact us at{' '}
						<a
							href={`mailto:${CONTACT_EMAIL}`}
							className="text-primary underline underline-offset-4"
						>
							{CONTACT_EMAIL}
						</a>
						. We respond to security inquiries within 2 business days.
					</p>
					<div className="mt-4 flex flex-wrap gap-3 text-sm">
						<a href="/security-posture" className="text-primary underline underline-offset-4">
							Security Posture Overview →
						</a>
						<span className="text-muted-foreground">·</span>
						<a href="/dpa" className="text-primary underline underline-offset-4">
							EU Data Processing Agreement →
						</a>
						<span className="text-muted-foreground">·</span>
						<a href="/privacy" className="text-primary underline underline-offset-4">
							Privacy Policy →
						</a>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
