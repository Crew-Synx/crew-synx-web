import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://crewsynx.butterflyinstruments.com";

export const metadata: Metadata = {
	title: {
		default: "Documentation — CrewSynx",
		template: "%s | CrewSynx Docs",
	},
	description:
		"Official documentation for CrewSynx — a self-hosted workforce management platform. Learn how to set up, configure, and operate projects, attendance, analytics, integrations, and governance.",
	keywords: [
		"CrewSynx documentation",
		"workforce management docs",
		"self-hosted HR platform guide",
		"project management setup",
		"attendance tracking configuration",
		"team workspace tutorial",
	],
	alternates: {
		canonical: `${BASE_URL}/docs`,
	},
	openGraph: {
		type: "website",
		siteName: "CrewSynx",
		url: `${BASE_URL}/docs`,
		title: "Documentation — CrewSynx",
		description:
			"Set up and operate your CrewSynx workspace. Full documentation for projects, attendance, analytics, integrations, and security.",
		images: [
			{
				url: `${BASE_URL}/og-image.png`,
				width: 1200,
				height: 630,
				alt: "CrewSynx Documentation",
				type: "image/png",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Documentation — CrewSynx",
		description:
			"Official documentation for CrewSynx — your self-hosted workforce management platform.",
		images: [`${BASE_URL}/og-image.png`],
	},
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
	return <section className="min-h-screen bg-background text-foreground">{children}</section>;
}
