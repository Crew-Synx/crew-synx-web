import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://crewsynx.butterflyinstruments.com';

export const metadata: Metadata = {
	title: 'Data Processing Agreement — CrewSynx',
	description:
		'Template Data Processing Agreement (DPA) for EU and UK enterprise customers of CrewSynx. Documents the zero-access, self-hosted arrangement and GDPR compliance responsibilities.',
	keywords: ['CrewSynx DPA', 'data processing agreement', 'GDPR self-hosted software', 'EU compliance workforce platform'],
	alternates: { canonical: `${BASE_URL}/dpa` },
	openGraph: {
		title: 'Data Processing Agreement — CrewSynx',
		description: 'Template DPA for EU/UK enterprise customers. Butterfly Instruments holds zero access to self-hosted instance data.',
		type: 'website',
		url: `${BASE_URL}/dpa`,
		siteName: 'CrewSynx',
	},
	twitter: {
		card: 'summary',
		title: 'Data Processing Agreement — CrewSynx',
		description: 'Template DPA for EU/UK enterprise customers of CrewSynx.',
	},
};

const EFFECTIVE_DATE = '21 April 2026';
const CONTACT_EMAIL = 'contact@butterflyinstruments.com';
const COMPANY_NAME = 'Butterfly Instruments';
const COMPANY_ADDRESS = '[Butterfly Instruments registered address]';

export default function DPAPage() {
	return (
		<div className="min-h-screen">
			<Navbar />

			<main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
				<div className="mb-2 text-sm font-medium text-primary">Legal</div>
				<h1 className="text-4xl font-bold tracking-tight">Data Processing Agreement</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Template version — effective from {EFFECTIVE_DATE}
				</p>

				<div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-muted-foreground leading-7">
					<strong className="text-foreground">How to use this document:</strong> This is a template
					DPA for EU/UK enterprise customers. It documents that {COMPANY_NAME} does not process
					personal data from your CrewSynx instance. To execute a signed version for your records,
					email{' '}
					<a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">
						{CONTACT_EMAIL}
					</a>{' '}
					with subject line &ldquo;DPA Request&rdquo; and your organisation&apos;s details. We will
					countersign and return a PDF within 5 business days.
				</div>

				<div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-10 text-sm leading-7">

					<section>
						<h2 className="text-xl font-semibold">Data Processing Agreement</h2>
						<p>
							This Data Processing Agreement (&ldquo;DPA&rdquo;) is entered into between:
						</p>
						<p className="mt-3">
							<strong>Supplier:</strong> {COMPANY_NAME}, {COMPANY_ADDRESS}{' '}
							(&ldquo;Butterfly Instruments&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;)
						</p>
						<p className="mt-3">
							<strong>Customer:</strong> The organisation named in the associated CrewSynx license
							agreement (&ldquo;you&rdquo;, &ldquo;Customer&rdquo;)
						</p>
						<p className="mt-3">
							together referred to as the &ldquo;Parties&rdquo;.
						</p>
						<p className="mt-3">
							This DPA supplements and forms part of the CrewSynx Terms of Service between the
							Parties. In the event of conflict between this DPA and the Terms of Service, this DPA
							prevails with respect to data protection matters.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">1. Definitions</h2>
						<ul className="mt-2 list-disc pl-6 space-y-2">
							<li>
								<strong>&ldquo;Data Protection Laws&rdquo;</strong> means the EU General Data
								Protection Regulation (2016/679) (&ldquo;GDPR&rdquo;), the UK GDPR as incorporated
								into UK law, and any related national implementing legislation applicable to either
								Party.
							</li>
							<li>
								<strong>&ldquo;Personal Data&rdquo;</strong> has the meaning given in the GDPR.
							</li>
							<li>
								<strong>&ldquo;Instance Data&rdquo;</strong> means any Personal Data entered into,
								stored in, or processed by the Customer&apos;s self-hosted CrewSynx installation.
							</li>
							<li>
								<strong>&ldquo;Contact Data&rdquo;</strong> means Personal Data submitted to
								Butterfly Instruments through the CrewSynx website contact form (name, work email,
								company name).
							</li>
							<li>
								<strong>&ldquo;Software&rdquo;</strong> means the CrewSynx application licensed to
								the Customer under the Terms of Service.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">2. Nature of the Arrangement</h2>
						<p>
							CrewSynx is a self-hosted software product. The Customer deploys and operates the
							Software on infrastructure owned or contracted by the Customer. Butterfly Instruments
							does not:
						</p>
						<ul className="mt-2 list-disc pl-6 space-y-1">
							<li>host, store, or have network access to the Customer&apos;s deployed instance;</li>
							<li>receive, transmit, or process any Instance Data;</li>
							<li>act as a data processor or sub-processor in relation to Instance Data.</li>
						</ul>
						<p className="mt-3">
							The Customer is the sole data controller for all Instance Data and is independently
							responsible for ensuring its processing complies with applicable Data Protection Laws.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">3. Butterfly Instruments as Data Controller (Contact Data)</h2>
						<p>
							Where Butterfly Instruments collects Contact Data directly from individuals at the
							Customer (e.g., sales and support communications), Butterfly Instruments acts as an
							independent data controller for that Contact Data. Processing of Contact Data is
							governed by the Butterfly Instruments Privacy Policy, not by this DPA.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">4. Customer Obligations</h2>
						<p>The Customer undertakes to:</p>
						<ul className="mt-2 list-disc pl-6 space-y-1">
							<li>
								ensure it has a lawful basis for all processing of Personal Data within its
								CrewSynx instance;
							</li>
							<li>
								provide any required notices to, and obtain any required consents from, data
								subjects whose Personal Data is processed in the instance;
							</li>
							<li>
								implement appropriate technical and organisational security measures for its
								deployment environment, including access controls, encryption in transit, and
								regular backups;
							</li>
							<li>
								respond to data subject rights requests (access, erasure, restriction, portability)
								relating to Instance Data, as the Customer is the data controller for such data;
							</li>
							<li>
								not deploy the Software to process special categories of Personal Data (Article 9
								GDPR) unless the Customer has independently assessed and ensured the lawfulness of
								such processing.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">5. Security Patches and Updates</h2>
						<p>
							Butterfly Instruments will make security patches available to the Customer on a
							reasonable-efforts basis as described in the Terms of Service. The Customer is solely
							responsible for applying updates to its deployed instance in a timely manner,
							particularly those addressing security vulnerabilities.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">6. Data Breach Notification</h2>
						<p>
							Because Butterfly Instruments does not access or hold Instance Data, it will not be
							aware of security incidents within the Customer&apos;s deployment environment. The Customer
							is solely responsible for detecting, assessing, and notifying the relevant supervisory
							authority and affected data subjects of any personal data breach involving Instance
							Data, within the timeframes required by applicable Data Protection Laws (72 hours
							under GDPR where feasible).
						</p>
						<p className="mt-3">
							If the Customer discovers a vulnerability in the Software that contributed to a
							breach, it should report this to Butterfly Instruments at{' '}
							<a
								href={`mailto:${CONTACT_EMAIL}`}
								className="text-primary underline underline-offset-4"
							>
								{CONTACT_EMAIL}
							</a>{' '}
							to allow us to issue a patch.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">7. International Transfers</h2>
						<p>
							Butterfly Instruments does not transfer Instance Data internationally because it does
							not receive or hold Instance Data. Any international transfer of Instance Data is
							solely within the Customer&apos;s infrastructure and is the Customer&apos;s responsibility to
							assess under applicable Data Protection Laws.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">8. Audit Rights</h2>
						<p>
							Because Butterfly Instruments does not process Instance Data, traditional audit rights
							relating to data processing do not apply. The Customer may review the published
							Security Posture documentation and request a copy of any available third-party
							penetration test report. Requests for additional security assurance should be directed
							to{' '}
							<a
								href={`mailto:${CONTACT_EMAIL}`}
								className="text-primary underline underline-offset-4"
							>
								{CONTACT_EMAIL}
							</a>
							.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">9. Duration and Termination</h2>
						<p>
							This DPA remains in effect for as long as the underlying CrewSynx license agreement
							is in force. Termination of the license agreement automatically terminates this DPA.
							Obligations under this DPA that by their nature should survive (including sections 2,
							3, and 4) will survive termination.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">10. Governing Law</h2>
						<p>
							This DPA is governed by the same law and jurisdiction as the Terms of Service, unless
							a specific jurisdiction is agreed in writing for the Customer&apos;s signed copy.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">11. Entire Agreement</h2>
						<p>
							This DPA, together with the CrewSynx Terms of Service and Privacy Policy, constitutes
							the entire agreement between the Parties with respect to data protection and
							supersedes all prior arrangements on this subject.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">12. Contact</h2>
						<p>
							For data protection queries, DPA execution requests, or to report a security
							vulnerability, contact {COMPANY_NAME} at{' '}
							<a
								href={`mailto:${CONTACT_EMAIL}`}
								className="text-primary underline underline-offset-4"
							>
								{CONTACT_EMAIL}
							</a>
							.
						</p>
					</section>

				</div>

				<div className="mt-16 rounded-xl border border-border/60 bg-muted/40 p-8">
					<h2 className="text-lg font-semibold">Request a Signed Copy</h2>
					<p className="mt-2 text-sm text-muted-foreground leading-7">
						If your legal or compliance team requires a countersigned PDF of this DPA, email{' '}
						<a
							href={`mailto:${CONTACT_EMAIL}`}
							className="text-primary underline underline-offset-4"
						>
							{CONTACT_EMAIL}
						</a>{' '}
						with the subject line &ldquo;DPA Request&rdquo; and include your organisation name,
						registered address, and the name of the authorised signatory. We will return a
						countersigned PDF within 5 business days.
					</p>
					<div className="mt-4 flex flex-wrap gap-3 text-sm">
						<a href="/security" className="text-primary underline underline-offset-4">
							Security &amp; Compliance FAQ →
						</a>
						<span className="text-muted-foreground">·</span>
						<a href="/security-posture" className="text-primary underline underline-offset-4">
							Security Posture Overview →
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
