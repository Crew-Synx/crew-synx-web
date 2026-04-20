import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
	title: 'Privacy Policy | CrewSynx',
	description:
		'How Butterfly Instruments collects, uses, and protects information on the CrewSynx website and contact form.',
};

const EFFECTIVE_DATE = '21 April 2026';
const CONTACT_EMAIL = 'contact@butterflyinstruments.com';
const COMPANY_NAME = 'Butterfly Instruments';
const MAIN_SITE = 'https://butterflyinstruments.com';
const PRODUCT_SITE = 'https://crewsynx.butterflyinstruments.com';

export default function PrivacyPage() {
	return (
		<div className="min-h-screen">
			<Navbar />

			<main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
				<h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Effective date: {EFFECTIVE_DATE}
				</p>

				<div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-10 text-sm leading-7">

					<section>
						<h2 className="text-xl font-semibold">1. Who We Are</h2>
						<p>
							{COMPANY_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is the company behind
							CrewSynx, a self-hosted workforce management platform available at{' '}
							<a href={PRODUCT_SITE} className="text-primary underline underline-offset-4">{PRODUCT_SITE}</a>.
							Our main website is{' '}
							<a href={MAIN_SITE} className="text-primary underline underline-offset-4">{MAIN_SITE}</a>.
							We distribute CrewSynx as a perpetual license; customers deploy and operate it on their
							own infrastructure. This Privacy Policy covers only the{' '}
							<strong>CrewSynx website and contact form</strong> — it does not govern data processed
							inside a self-hosted CrewSynx instance, which is entirely the responsibility of the
							deploying organisation.
						</p>
						<p className="mt-3">
							For questions, contact us at{' '}
							<a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">
								{CONTACT_EMAIL}
							</a>.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">2. Information We Collect</h2>

						<h3 className="mt-5 font-semibold">2.1 Contact and Pricing Inquiries</h3>
						<p>
							When you submit our contact/pricing form we collect:
						</p>
						<ul className="mt-2 list-disc pl-6 space-y-1">
							<li>Full name</li>
							<li>Work email address</li>
							<li>Company or organisation name (optional)</li>
							<li>Team size range (optional)</li>
							<li>The message or custom request you write</li>
						</ul>
						<p className="mt-3">
							This information is transmitted directly to our team via email and is used solely to
							respond to your inquiry.
						</p>

						<h3 className="mt-5 font-semibold">2.2 Automatically Collected Information</h3>
						<p>
							Like most websites, our web server may log standard technical data including IP
							addresses, browser type, referring URL, and pages visited. These logs are used for
							security monitoring and diagnosing server issues. We do not run advertising trackers
							or third-party analytics scripts.
						</p>

						<h3 className="mt-5 font-semibold">2.3 Cookies</h3>
						<p>
							We use only the cookies strictly necessary to operate the website (e.g. theme
							preference). We do not use advertising cookies, cross-site tracking, or fingerprinting.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
						<p>We use the information we collect to:</p>
						<ul className="mt-2 list-disc pl-6 space-y-1">
							<li>Respond to your pricing or general inquiries</li>
							<li>Provide a quote and discuss your licensing requirements</li>
							<li>Communicate further about the product upon your request</li>
							<li>Maintain security and integrity of our website</li>
						</ul>
						<p className="mt-3">
							We do not sell, rent, or share your personal information with third parties for
							marketing purposes.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">4. Legal Basis for Processing (GDPR)</h2>
						<p>
							If you are located in the European Economic Area (EEA) or United Kingdom, our legal
							basis for processing your personal data is:
						</p>
						<ul className="mt-2 list-disc pl-6 space-y-1">
							<li>
								<strong>Legitimate interests</strong> — responding to inquiries you initiate and
								maintaining the security of our systems.
							</li>
							<li>
								<strong>Pre-contractual measures</strong> — where you request a quote or licensing
								information.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">5. Data Retention</h2>
						<p>
							Inquiry emails and the personal information they contain are retained for as long as
							necessary to manage the business relationship arising from your contact (typically up
							to two years). Server access logs are retained for a maximum of 90 days.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">6. Your Rights</h2>
						<p>
							Depending on your jurisdiction you may have the right to access, correct, delete, or
							restrict the processing of your personal data, or to object to processing and to data
							portability. To exercise any of these rights, email us at{' '}
							<a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">
								{CONTACT_EMAIL}
							</a>{' '}
							and we will respond within 30 days.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">7. Self-Hosted Instances</h2>
						<p>
							CrewSynx is deployed on infrastructure operated and controlled by the purchasing
							organisation. We have no access to, and bear no responsibility for, any personal data
							processed within a customer&apos;s self-hosted CrewSynx installation. Each deploying
							organisation acts as an independent data controller and must comply with applicable
							privacy laws.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">8. Security</h2>
						<p>
							We use industry-standard security measures to protect data in transit (TLS/HTTPS) and
							limit access to contact inquiry data to authorised personnel only. No method of
							transmission over the internet is 100% secure; we cannot guarantee absolute security
							but we take it seriously and continuously review our practices.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">9. Third-Party Services</h2>
						<p>
							We use Gmail SMTP (Google) to deliver contact inquiry emails internally. Your inquiry
							data passes through Google&apos;s mail infrastructure subject to{' '}
							<a
								href="https://policies.google.com/privacy"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary underline underline-offset-4"
							>
								Google&apos;s Privacy Policy
							</a>
							. No other third-party services receive your inquiry data.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
						<p>
							We may update this Privacy Policy from time to time. The effective date at the top of
							this page will reflect when the most recent changes were made. Continued use of our
							website after changes are posted constitutes your acceptance of the updated policy.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">11. Contact</h2>
						<p>
							If you have questions or concerns about this Privacy Policy, please contact{' '}
							{COMPANY_NAME} at{' '}
							<a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">
								{CONTACT_EMAIL}
							</a>
							{' '}or visit{' '}
							<a href={MAIN_SITE} className="text-primary underline underline-offset-4">{MAIN_SITE}</a>.
						</p>
					</section>
				</div>
			</main>

			<Footer />
		</div>
	);
}
