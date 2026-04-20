import type { Metadata } from "next";

export const metadata: Metadata = {
	title: {
		default: "CrewSynx Documentation",
		template: "%s | CrewSynx Docs",
	},
	description: "Official documentation for CrewSynx modules, setup, governance, and operations.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
	return <section className="min-h-screen bg-background text-foreground">{children}</section>;
}
