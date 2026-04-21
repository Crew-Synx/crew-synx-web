import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DocsShell } from "../docs-shell";
import { DOCS_MODULES, DOCS_MODULE_MAP } from "../docs-data";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://crewsynx.butterflyinstruments.com";

type ModulePageProps = {
	params: Promise<{
		module: string;
	}>;
};

export function generateStaticParams() {
	return DOCS_MODULES.map((module) => ({ module: module.slug }));
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
	const { module: moduleSlug } = await params;
	const docsModule = DOCS_MODULE_MAP.get(moduleSlug);

	if (!docsModule) {
		return {
			title: "Not Found",
			robots: { index: false, follow: false },
		};
	}

	const title = `${docsModule.title} — CrewSynx Docs`;
	const description = docsModule.description;
	const url = `${BASE_URL}/docs/${moduleSlug}`;

	return {
		title: docsModule.title,
		description,
		alternates: { canonical: url },
		openGraph: {
			title,
			description,
			url,
			siteName: "CrewSynx",
			type: "article",
			images: [
				{
					url: `${BASE_URL}/og-image.png`,
					width: 1200,
					height: 630,
					alt: title,
					type: "image/png",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [`${BASE_URL}/og-image.png`],
		},
	};
}

export default async function ModulePage({ params }: ModulePageProps) {
	const { module: moduleSlug } = await params;
	const docsModule = DOCS_MODULE_MAP.get(moduleSlug);

	if (!docsModule) {
		notFound();
	}

	return <DocsShell docsModule={docsModule} />;
}
