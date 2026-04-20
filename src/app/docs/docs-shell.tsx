"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
	AlignLeft,
	ArrowRight,
	BookOpen,
	CalendarCheck2,
	CircleHelp,
	FileBarChart2,
	Layers3,
	Menu,
	MessageSquareText,
	Rocket,
	Search,
	ShieldCheck,
	Sparkles,
	Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import { DOCS_GROUPS, DOCS_MODULE_MAP, type DocsModule, type DocsSection } from "./docs-data";

const ICON_BY_SLUG = {
	overview: BookOpen,
	"getting-started": Rocket,
	"projects-and-tasks": Workflow,
	attendance: CalendarCheck2,
	communication: MessageSquareText,
	analytics: FileBarChart2,
	integrations: Layers3,
	"security-and-admin": ShieldCheck,
} as const;

function iconForSlug(slug: string) {
	return ICON_BY_SLUG[slug as keyof typeof ICON_BY_SLUG] ?? CircleHelp;
}

function MediaPlaceholder({
	title,
	instructions,
	tall,
	type,
}: {
	title: string;
	instructions: string;
	tall?: boolean;
	type: "image" | "video";
}) {
	return (
		<div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-4">
			<div
				className={cn(
					"grid place-items-center rounded-md border border-dashed border-muted-foreground/35 bg-background px-6 text-center",
					tall ? "h-72" : "h-52"
				)}
			>
				<div className="max-w-xl space-y-2">
					<Badge variant="outline" className="font-medium uppercase tracking-wide">
						{type} slot
					</Badge>
					<p className="text-sm font-semibold text-foreground">{title}</p>
					<p className="text-sm text-muted-foreground">{instructions}</p>
				</div>
			</div>
		</div>
	);
}

function DocsNav({ currentSlug, onNavigate }: { currentSlug: string; onNavigate?: () => void }) {
	return (
		<div className="space-y-4">
			{DOCS_GROUPS.map((group) => (
				<div key={group.title} className="space-y-1">
					<p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
						{group.title}
					</p>
					{group.slugs.map((slug) => {
						const docsEntry = DOCS_MODULE_MAP.get(slug);
						if (!docsEntry) return null;
						const Icon = iconForSlug(slug);

						return (
							<Link
								key={slug}
								href={`/docs/${slug}`}
								onClick={onNavigate}
								className={cn(
									"group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
									currentSlug === slug
										? "bg-accent text-accent-foreground"
										: "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
								)}
							>
								<span
									className={cn(
										"flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
										currentSlug === slug ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
									)}
								>
									<Icon className="h-4 w-4" />
								</span>
								<span className="truncate font-medium">{docsEntry.title}</span>
							</Link>
						);
					})}
				</div>
			))}
		</div>
	);
}

function DocBody({ sections }: { sections: DocsSection[] }) {
	return (
		<div className="space-y-16">
			{sections.map((section) => (
				<section
					key={section.id}
					id={section.id}
					data-doc-section-id={section.id}
					className="scroll-mt-24 space-y-4"
				>
					<div className="space-y-2">
						<h2 className="text-[2rem] leading-tight font-semibold tracking-tight text-foreground">{section.title}</h2>
						<p className="text-base text-muted-foreground">{section.summary}</p>
					</div>

					{section.paragraphs?.map((paragraph) => (
						<p key={paragraph} className="text-[15px] leading-7 text-muted-foreground">
							{paragraph}
						</p>
					))}

					{section.bullets && section.bullets.length > 0 && (
						<ul className="space-y-2 text-[15px] leading-7 text-muted-foreground">
							{section.bullets.map((bullet) => (
								<li key={bullet} className="flex gap-2">
									<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
									<span>{bullet}</span>
								</li>
							))}
						</ul>
					)}

					{section.placeholder && (
						<MediaPlaceholder
							type={section.placeholder.type}
							title={section.placeholder.title}
							instructions={section.placeholder.instructions}
							tall={section.placeholder.tall}
						/>
					)}
				</section>
			))}
		</div>
	);
}

export function DocsShell({ docsModule }: { docsModule: DocsModule }) {
	const pathname = usePathname();
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const [activeSection, setActiveSection] = useState(docsModule.sections[0]?.id ?? "");
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const sectionElements = docsModule.sections
			.map((section) => document.getElementById(section.id))
			.filter((element): element is HTMLElement => Boolean(element));

		if (sectionElements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio);

				if (visible[0]) {
					setActiveSection(visible[0].target.id);
				}
			},
			{
				root: scrollRef.current,
				rootMargin: "-20% 0px -60% 0px",
				threshold: [0.2, 0.4, 0.6],
			}
		);

		sectionElements.forEach((section) => observer.observe(section));

		return () => observer.disconnect();
	}, [docsModule]);

	const breadcrumb = useMemo(() => {
		const parts = pathname?.split("/").filter(Boolean) ?? [];
		return ["docs", parts[parts.length - 1] ?? docsModule.slug];
	}, [docsModule.slug, pathname]);

	const currentSectionId = activeSection || docsModule.sections[0]?.id || "";

	return (
		<div className="flex min-h-screen flex-col bg-background">
			{/* Top navbar — full width, flush */}
			<header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-card/80 px-4 backdrop-blur-sm md:px-6">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-muted-foreground lg:hidden"
					onClick={() => setMobileNavOpen(true)}
					aria-label="Open documentation navigation"
				>
					<Menu className="h-4 w-4" />
				</Button>

				<div className="flex items-center gap-2">
					<span className="grid h-8 w-8 place-items-center rounded-md bg-primary/12 text-primary">
						<BookOpen className="h-4 w-4" />
					</span>
					<div className="hidden sm:block">
						<p className="text-sm font-semibold">CrewSynx Docs</p>
						<p className="text-xs text-muted-foreground">Product documentation</p>
					</div>
				</div>

				<div className="ml-2 hidden h-9 w-full max-w-xs items-center gap-2 rounded-md border border-border/60 bg-background px-2.5 md:flex">
					<Search className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm text-muted-foreground">Search docs...</span>
					<Badge variant="outline" className="ml-auto text-[10px]">cmd+k</Badge>
				</div>

				<div className="ml-auto flex items-center gap-2">
					<Button variant="outline" size="sm" asChild>
						<Link href="/dashboard">Open app</Link>
					</Button>
					<Button size="sm" asChild>
						<Link href="/onboarding">Get started</Link>
					</Button>
				</div>
			</header>

			{/* Body row — sidebar flush left, content, right TOC */}
			<div className="flex flex-1">
				{/* Left sidebar: full-height, flush to left and top of body */}
				<aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-border/50 bg-card sticky top-14 h-[calc(100vh-3.5rem)] overflow-hidden">
					<ScrollArea className="flex-1 py-4">
						<div className="px-3">
							<DocsNav currentSlug={docsModule.slug} />
						</div>
					</ScrollArea>
				</aside>

				{/* Scrollable content + right TOC */}
				<div ref={scrollRef} className="flex flex-1 min-w-0 overflow-y-auto">
					<main className="flex-1 min-w-0 px-8 py-8 max-w-3xl">
						<div className="mb-7 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
							{breadcrumb.map((crumb, index) => (
								<div key={crumb} className="flex items-center gap-2">
									{index > 0 && <ArrowRight className="h-3 w-3" />}
									<span>{crumb.replaceAll("-", " ")}</span>
								</div>
							))}
						</div>

						<section className="mb-10 space-y-4">
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{docsModule.category}</p>
							<h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-[2.8rem]">{docsModule.title}</h1>
							<p className="max-w-2xl text-lg leading-8 text-muted-foreground">{docsModule.description}</p>
						</section>

						<Card className="mb-10 border-primary/20 bg-primary/5 py-4">
							<CardContent className="px-5 text-sm leading-6 text-foreground">
								This module is part of the complete CrewSynx A to Z guide. Use the left navigation to switch modules and follow the right table of contents while scrolling.
							</CardContent>
						</Card>

						<DocBody sections={docsModule.sections} />
					</main>

					{/* Right TOC: sticky inside the scrollable column */}
					<aside className="hidden xl:block w-[230px] shrink-0 sticky top-0 h-screen py-8 pr-6">
						<div className="rounded-xl border border-border/70 bg-card p-4">
							<div className="mb-3 flex items-center gap-2">
								<AlignLeft className="h-4 w-4 text-muted-foreground" />
								<p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">On this page</p>
							</div>
							<Separator className="mb-2" />
							<nav className="space-y-1.5">
								{docsModule.sections.map((section) => {
									const isActive = section.id === currentSectionId;
									return (
										<a
											key={section.id}
											href={`#${section.id}`}
											className={cn(
												"block rounded-md border-l-2 px-3 py-1.5 text-sm transition-colors",
												isActive
													? "border-primary bg-primary/8 text-foreground"
													: "border-transparent text-muted-foreground hover:border-primary/40 hover:bg-accent/60 hover:text-foreground"
											)}
										>
											{section.title}
										</a>
									);
								})}
							</nav>
						</div>
					</aside>
				</div>
			</div>

			<Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
				<SheetContent side="left" className="w-[86vw] max-w-sm border-r border-border/60 p-0">
					<VisuallyHidden.Root>
						<SheetTitle>Documentation navigation</SheetTitle>
					</VisuallyHidden.Root>
					<div className="h-14 border-b border-border/50 px-4 py-3">
						<p className="text-sm font-semibold">CrewSynx Docs</p>
						<p className="text-xs text-muted-foreground">Module navigation</p>
					</div>
					<div className="p-3">
						<DocsNav currentSlug={docsModule.slug} onNavigate={() => setMobileNavOpen(false)} />
					</div>
				</SheetContent>
			</Sheet>

			<div className="fixed bottom-4 right-4 z-10 lg:hidden">
				<Button
					size="icon"
					className="h-10 w-10 rounded-full shadow-lg"
					onClick={() => setMobileNavOpen(true)}
					aria-label="Open docs navigation"
				>
					<Sparkles className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
