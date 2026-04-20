import { notFound } from "next/navigation";
import { DocsShell } from "../docs-shell";
import { DOCS_MODULES, DOCS_MODULE_MAP } from "../docs-data";

type ModulePageProps = {
	params: Promise<{
		module: string;
	}>;
};

export function generateStaticParams() {
	return DOCS_MODULES.map((module) => ({ module: module.slug }));
}

export default async function ModulePage({ params }: ModulePageProps) {
	const { module: moduleSlug } = await params;
	const docsModule = DOCS_MODULE_MAP.get(moduleSlug);

	if (!docsModule) {
		notFound();
	}

	return <DocsShell docsModule={docsModule} />;
}
