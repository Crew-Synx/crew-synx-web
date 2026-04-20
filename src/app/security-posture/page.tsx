import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';
import { Shield, Server, Code2, Bug, Lock, Bell } from 'lucide-react';

export const metadata: Metadata = {
	title: 'Security Posture | CrewSynx',
	description:
		'An overview of CrewSynx development practices, vulnerability management, and deployment security guidance for security teams and enterprise buyers.',
};

const EFFECTIVE_DATE = '21 April 2026';
const CONTACT_EMAIL = 'contact@butterflyinstruments.com';
const COMPANY_NAME = 'Butterfly Instruments';

const sections = [
	{
		icon: Server,
		title: 'Architecture & Data Ownership',
		items: [
			'CrewSynx is a self-hosted application — you deploy it on infrastructure you own and control.',
			'Butterfly Instruments has no network access to, and retains no copy of, any data processed inside your instance.',
			'No mandatory outbound connections to Butterfly Instruments servers are required at runtime.',
			'Air-gapped deployments are fully supported.',
			'All data at rest and in transit is managed entirely within your infrastructure boundary.',
		],
	},
	{
		icon: Lock,
		title: 'Application Security',
		items: [
			'Authentication uses industry-standard password hashing (bcrypt) — passwords are never stored in plaintext.',
			'All API endpoints enforce role-based access control (RBAC) with organisation-level data isolation.',
			'Input validation and parameterised queries are used throughout to prevent injection attacks.',
			'HTTPS/TLS is required and enforced for all web-facing endpoints.',
			'Session tokens are cryptographically signed with expiry enforced server-side.',
			'Sensitive fields are excluded from API responses and application logs.',
		],
	},
	{
		icon: Code2,
		title: 'Development Practices',
		items: [
			'Dependencies are reviewed for known vulnerabilities before each release.',
			'The codebase follows OWASP Top 10 guidelines as a baseline for security review.',
			'No third-party analytics, advertising SDKs, or telemetry libraries are bundled in the application.',
			'New features undergo internal security review before release.',
			'Source code is version-controlled with signed commits for release builds.',
		],
	},
	{
		icon: Bug,
		title: 'Vulnerability Management',
		items: [
			'Security vulnerabilities can be reported confidentially to contact@butterflyinstruments.com.',
			'We acknowledge receipt of vulnerability reports within 2 business days.',
			'Critical and high-severity vulnerabilities are prioritised and patched as quickly as possible.',
			'Security patches are made available to all active license holders via versioned releases.',
			'License holders are notified by email when a security-relevant update is released.',
			'We request a reasonable coordinated disclosure window before public reporting of vulnerabilities.',
		],
	},
	{
		icon: Bell,
		title: 'Incident & Update Notification',
		items: [
			'License holders are notified directly by email when security patches are released.',
			'Release notes for each version clearly indicate whether a release includes security fixes.',
			'There are no automatic or forced updates — you control when and whether to apply updates.',
		],
	},
	{
		icon: Shield,
		title: 'Deployment Security Guidance',
		items: [
			'Deploy behind a reverse proxy (e.g. Nginx, Caddy) with TLS termination.',
			'Restrict database access to the application server only — do not expose the database publicly.',
			'Enable firewall rules to limit inbound access to only required ports (80/443).',
			'Schedule regular backups of the database and store them off-server.',
			'Keep the host operating system and all system packages updated.',
			'Use strong, unique credentials for the database and application admin accounts.',
			'Review and apply the principle of least privilege for all system accounts.',
		],
	},
];

export default function SecurityPosturePage() {
	return (
		<div className="min-h-screen">
			<Navbar />

			<main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="mb-2 text-sm font-medium text-primary">Security</div>
				<h1 className="text-4xl font-bold tracking-tight">Security Posture Overview</h1>
				<p className="mt-4 text-muted-foreground leading-relaxed">
					This document is intended for security teams, IT managers, and enterprise buyers evaluating
					CrewSynx. It covers application security practices, vulnerability management, and deployment
					guidance. Because CrewSynx is self-hosted, your organisation controls the environment — this
					document explains what we are responsible for and what you are responsible for.
				</p>
				<p className="mt-2 text-sm text-muted-foreground">Last updated: {EFFECTIVE_DATE}</p>

				<div className="mt-12 space-y-12">
					{sections.map((section) => {
						const Icon = section.icon;
						return (
							<div key={section.title}>
								<div className="flex items-center gap-3">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
										<Icon className="h-4 w-4 text-primary" />
									</div>
									<h2 className="text-lg font-semibold">{section.title}</h2>
								</div>
								<ul className="mt-4 space-y-2 pl-11">
									{section.items.map((item, i) => (
										<li key={i} className="flex gap-2 text-sm text-muted-foreground leading-7">
											<span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>

				<div className="mt-16 space-y-6 rounded-xl border border-border/60 bg-muted/40 p-8">
					<div>
						<h2 className="text-lg font-semibold">Responsibility Split</h2>
						<p className="mt-2 text-sm text-muted-foreground leading-7">
							As a self-hosted product, security responsibilities are shared. The table below
							summarises who is responsible for what.
						</p>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-border/60">
									<th className="py-2 pr-6 text-left font-semibold">Area</th>
									<th className="py-2 pr-6 text-left font-semibold">{COMPANY_NAME}</th>
									<th className="py-2 text-left font-semibold">Your Organisation</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40 text-muted-foreground">
								<tr>
									<td className="py-3 pr-6 font-medium text-foreground">Application code security</td>
									<td className="py-3 pr-6">✓ Responsible</td>
									<td className="py-3"></td>
								</tr>
								<tr>
									<td className="py-3 pr-6 font-medium text-foreground">Security patch releases</td>
									<td className="py-3 pr-6">✓ Responsible</td>
									<td className="py-3"></td>
								</tr>
								<tr>
									<td className="py-3 pr-6 font-medium text-foreground">Applying security updates</td>
									<td className="py-3 pr-6"></td>
									<td className="py-3">✓ Responsible</td>
								</tr>
								<tr>
									<td className="py-3 pr-6 font-medium text-foreground">Server &amp; infrastructure hardening</td>
									<td className="py-3 pr-6"></td>
									<td className="py-3">✓ Responsible</td>
								</tr>
								<tr>
									<td className="py-3 pr-6 font-medium text-foreground">Data backup &amp; recovery</td>
									<td className="py-3 pr-6"></td>
									<td className="py-3">✓ Responsible</td>
								</tr>
								<tr>
									<td className="py-3 pr-6 font-medium text-foreground">Network &amp; firewall configuration</td>
									<td className="py-3 pr-6"></td>
									<td className="py-3">✓ Responsible</td>
								</tr>
								<tr>
									<td className="py-3 pr-6 font-medium text-foreground">Data protection compliance (GDPR etc.)</td>
									<td className="py-3 pr-6"></td>
									<td className="py-3">✓ Responsible</td>
								</tr>
								<tr>
									<td className="py-3 pr-6 font-medium text-foreground">Access &amp; user account management</td>
									<td className="py-3 pr-6"></td>
									<td className="py-3">✓ Responsible</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div className="mt-10 rounded-xl border border-border/60 bg-muted/40 p-8">
					<h2 className="text-lg font-semibold">Contact &amp; Disclosure</h2>
					<p className="mt-2 text-sm text-muted-foreground leading-7">
						For security questions, vendor questionnaire support, penetration test requests, or to
						report a vulnerability, contact{' '}
						<a
							href={`mailto:${CONTACT_EMAIL}`}
							className="text-primary underline underline-offset-4"
						>
							{CONTACT_EMAIL}
						</a>
						. We aim to respond to security-related inquiries within 2 business days.
					</p>
					<div className="mt-4 flex flex-wrap gap-3 text-sm">
						<a href="/security" className="text-primary underline underline-offset-4">
							Security &amp; Compliance FAQ →
						</a>
						<span className="text-muted-foreground">·</span>
						<a href="/dpa" className="text-primary underline underline-offset-4">
							EU Data Processing Agreement →
						</a>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
}
