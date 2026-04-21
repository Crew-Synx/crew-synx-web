import type { MetadataRoute } from "next";
import { DOCS_MODULES } from "./docs/docs-data";

const BASE_URL =
	process.env.NEXT_PUBLIC_APP_URL ?? "https://crewsynx.butterflyinstruments.com";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 1.0,
		},
		{
			url: `${BASE_URL}/pricing`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/docs`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/security`,
			lastModified: now,
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/privacy`,
			lastModified: now,
			changeFrequency: "yearly",
			priority: 0.4,
		},
		{
			url: `${BASE_URL}/terms`,
			lastModified: now,
			changeFrequency: "yearly",
			priority: 0.4,
		},
		{
			url: `${BASE_URL}/dpa`,
			lastModified: now,
			changeFrequency: "yearly",
			priority: 0.4,
		},
	];

	const docRoutes: MetadataRoute.Sitemap = DOCS_MODULES.map((module) => ({
		url: `${BASE_URL}/docs/${module.slug}`,
		lastModified: now,
		changeFrequency: "weekly" as const,
		priority: 0.75,
	}));

	return [...staticRoutes, ...docRoutes];
}
