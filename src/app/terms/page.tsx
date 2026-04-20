import type { Metadata } from 'next';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export const metadata: Metadata = {
	title: 'Terms of Service | CrewSynx',
	description:
		'Terms governing the purchase and use of a CrewSynx perpetual software license.',
};

const EFFECTIVE_DATE = '21 April 2026';
const CONTACT_EMAIL = 'legal@crewsynx.com';

export default function TermsPage() {
	return (
		<div className="min-h-screen">
			<Navbar />

			<main className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
				<h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Effective date: {EFFECTIVE_DATE}
				</p>

				<div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-10 text-sm leading-7">

					<section>
						<h2 className="text-xl font-semibold">1. Agreement</h2>
						<p>
							These Terms of Service (&ldquo;Terms&rdquo;) are a legal agreement between you or the
							organisation you represent (&ldquo;Licensee&rdquo;, &ldquo;you&rdquo;) and CrewSynx
							(&ldquo;we&rdquo;, &ldquo;us&rdquo;). By purchasing a license, downloading, installing,
							or using CrewSynx software, you agree to be bound by these Terms. If you do not agree,
							do not use the software.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">2. Pre-Release Notice</h2>
						<p>
							CrewSynx is not yet publicly released. Access to the software during this period is
							granted on a case-by-case basis. Features, interfaces, and functionality described on
							this website are representative of the intended product and may change prior to and
							after release. We make no guarantees about release timelines.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">3. License Grant</h2>
						<p>
							Upon purchase and payment of the agreed license fee, we grant you a non-exclusive,
							non-transferable, perpetual license to install and use the specific version of CrewSynx
							software covered by your license agreement (&ldquo;Licensed Version&rdquo;) for your
							internal business operations, subject to these Terms.
						</p>
						<p className="mt-3">
							A perpetual license means you may continue to use the Licensed Version indefinitely
							without any further payment obligation. It does not entitle you to future major
							versions released after your license date unless explicitly agreed in writing.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">4. Self-Hosted Deployment</h2>
						<p>
							You are entitled to deploy the Licensed Version on any server, virtual machine, private
							cloud, or hosting environment you control. There are no restrictions on deployment
							location or hosting provider. You are responsible for:
						</p>
						<ul className="mt-2 list-disc pl-6 space-y-1">
							<li>Securing and maintaining your deployment environment</li>
							<li>Backups and disaster recovery of your data</li>
							<li>Compliance with applicable laws regarding data processed in your instance</li>
							<li>Keeping the operating system and infrastructure software up to date</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">5. No Subscription or Recurring Fees</h2>
						<p>
							CrewSynx is sold as a one-time perpetual license. There are no recurring subscription
							fees, per-seat fees, or usage-based charges associated with the Licensed Version.
							Optional future upgrades to new major versions, if offered, will be subject to
							separate pricing and agreement.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">6. Custom Feature Development</h2>
						<p>
							We may agree to develop custom features or modifications to CrewSynx at your request.
							Any such work will be governed by a separate written agreement covering scope,
							timeline, and pricing. Unless that agreement specifies otherwise:
						</p>
						<ul className="mt-2 list-disc pl-6 space-y-1">
							<li>
								Custom features become part of your Licensed Version and are covered by your
								perpetual license.
							</li>
							<li>
								We retain intellectual property rights to the underlying code and may incorporate
								generalised versions of custom features into the core product.
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">7. Restrictions</h2>
						<p>You may not:</p>
						<ul className="mt-2 list-disc pl-6 space-y-1">
							<li>Resell, sublicense, or redistribute the software or your license to third parties</li>
							<li>Reverse-engineer, decompile, or disassemble the software beyond what is permitted by applicable law</li>
							<li>Remove or alter copyright notices, license keys, or other proprietary markings</li>
							<li>Use the software to provide a competing SaaS or hosted service to third parties</li>
							<li>
								Use the software for any unlawful purpose or in violation of applicable regulations
							</li>
						</ul>
					</section>

					<section>
						<h2 className="text-xl font-semibold">8. Intellectual Property</h2>
						<p>
							CrewSynx and all associated software, documentation, trademarks, and materials are and
							remain the intellectual property of CrewSynx. These Terms do not transfer any ownership
							rights to you. Your perpetual license is a right to use, not an assignment of
							ownership.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">9. Support and Updates</h2>
						<p>
							The scope of support and any minor version updates included with your license will be
							agreed at the time of purchase. We have no general obligation to provide ongoing
							support unless covered by a separate support agreement. Bug fixes and security patches
							for your Licensed Version will be made available on a reasonable-efforts basis.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">10. Disclaimer of Warranties</h2>
						<p>
							The software is provided &ldquo;as is&rdquo; without warranty of any kind, express or
							implied, including but not limited to warranties of merchantability, fitness for a
							particular purpose, or non-infringement. We do not warrant that the software will be
							error-free or uninterrupted.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">11. Limitation of Liability</h2>
						<p>
							To the maximum extent permitted by applicable law, in no event shall CrewSynx be liable
							for any indirect, incidental, special, consequential, or punitive damages, including
							loss of profits, data, or business interruption, arising out of or in connection with
							these Terms or your use of the software, even if advised of the possibility of such
							damages.
						</p>
						<p className="mt-3">
							Our total aggregate liability for any claim under these Terms shall not exceed the
							license fee paid by you for the Licensed Version giving rise to the claim.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">12. Indemnification</h2>
						<p>
							You agree to indemnify and hold harmless CrewSynx and its personnel from any claims,
							damages, or expenses (including reasonable legal fees) arising from your use of the
							software in violation of these Terms, your deployment environment, or your processing
							of third-party personal data within your instance.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">13. Governing Law</h2>
						<p>
							These Terms are governed by and construed in accordance with the laws of the
							jurisdiction in which CrewSynx is registered, without regard to conflict-of-law
							principles. Any dispute arising under these Terms shall be subject to the exclusive
							jurisdiction of the courts of that jurisdiction, unless otherwise agreed in writing.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">14. Changes to These Terms</h2>
						<p>
							We reserve the right to update these Terms at any time. Updated Terms will be posted
							on this page with a revised effective date. For existing licensees, material changes
							will be communicated by email where feasible. Continued use of the software after
							updated Terms are posted constitutes acceptance of the new Terms.
						</p>
					</section>

					<section>
						<h2 className="text-xl font-semibold">15. Contact</h2>
						<p>
							For legal enquiries, email us at{' '}
							<a
								href={`mailto:${CONTACT_EMAIL}`}
								className="text-primary underline underline-offset-4"
							>
								{CONTACT_EMAIL}
							</a>
							. For pricing and general enquiries, use the{' '}
							<a href="/pricing" className="text-primary underline underline-offset-4">
								contact form
							</a>
							.
						</p>
					</section>
				</div>
			</main>

			<Footer />
		</div>
	);
}
