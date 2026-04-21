import type { MetadataRoute } from "next";

const BASE_URL =
	process.env.NEXT_PUBLIC_APP_URL ?? "https://crewsynx.butterflyinstruments.com";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: ["/", "/pricing", "/docs", "/docs/", "/security", "/privacy", "/terms", "/dpa"],
				disallow: [
					"/dashboard/",
					"/attendance/",
					"/employees/",
					"/profile/",
					"/settings/",
					"/roles/",
					"/onboarding/",
					"/invite/",
					"/payments/",
					"/auth/",
					"/api/",
					"/setup/",
					"/security-posture/",
				],
			},
		],
		sitemap: `${BASE_URL}/sitemap.xml`,
		host: BASE_URL,
	};
}
