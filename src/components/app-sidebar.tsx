'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppContext } from './app-shell';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
	LayoutDashboard,
	Briefcase,
	GitBranch,
	Layers,
	Receipt,
	Clock,
	Shield,
	Settings,
	ChevronRight,
	ChevronLeft,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';

interface SubItem {
	title: string;
	href: string;
}

interface NavItem {
	title: string;
	href?: string;
	icon: React.ComponentType<{ className?: string }>;
	iconColor: string;
	iconBg: string;
	children?: SubItem[];
	permission?: (priority: number, perms: string[]) => boolean;
}

interface NavGroup {
	label: string;
	items: NavItem[];
}

function buildNavGroups(): NavGroup[] {
	return [
		{
			label: 'Workspace',
			items: [
				{
					title: 'Overview',
					href: '/dashboard',
					icon: LayoutDashboard,
					iconColor: 'text-gray-500 dark:text-gray-400',
					iconBg: 'bg-gray-100 dark:bg-gray-800',
				},
			],
		},
		{
			label: 'People',
			items: [
				{
					title: 'Employees',
					icon: Briefcase,
					iconColor: 'text-blue-600 dark:text-blue-400',
					iconBg: 'bg-blue-100 dark:bg-blue-950',
					permission: (p, perms) =>
						p <= 2 || perms.some((k) => k.startsWith('member.')),
					children: [
						{ title: 'Directory', href: '/employees' },
						{ title: 'Onboard New', href: '/employees/new' },
					],
				},
				{
					title: 'Branches',
					icon: GitBranch,
					iconColor: 'text-green-600 dark:text-green-400',
					iconBg: 'bg-green-100 dark:bg-green-950',
					permission: (p, perms) =>
						p <= 2 || perms.some((k) => k.startsWith('branch.')),
					children: [{ title: 'All Branches', href: '/branches' }],
				},
				{
					title: 'Departments',
					icon: Layers,
					iconColor: 'text-purple-600 dark:text-purple-400',
					iconBg: 'bg-purple-100 dark:bg-purple-950',
					permission: (p, perms) =>
						p <= 2 || perms.some((k) => k.startsWith('department.')),
					children: [
						{ title: 'Departments', href: '/departments' },
						{ title: 'Designations', href: '/designations' },
					],
				},
			],
		},
		{
			label: 'Operations',
			items: [
				{
					title: 'Expenses',
					icon: Receipt,
					iconColor: 'text-orange-600 dark:text-orange-400',
					iconBg: 'bg-orange-100 dark:bg-orange-950',
					children: [
						{ title: 'My Claims', href: '/expenses' },
						{ title: 'All Claims', href: '/expenses?view=all' },
					],
				},
				{
					title: 'Attendance',
					icon: Clock,
					iconColor: 'text-teal-600 dark:text-teal-400',
					iconBg: 'bg-teal-100 dark:bg-teal-950',
					children: [
						{ title: 'Records', href: '/attendance' },
						{ title: 'Away Tickets', href: '/attendance?tab=away' },
					],
				},
			],
		},
		{
			label: 'Administration',
			items: [
				{
					title: 'Roles',
					icon: Shield,
					iconColor: 'text-indigo-600 dark:text-indigo-400',
					iconBg: 'bg-indigo-100 dark:bg-indigo-950',
					permission: (p) => p <= 1,
					children: [{ title: 'Manage Roles', href: '/roles' }],
				},
				{
					title: 'Settings',
					href: '/settings',
					icon: Settings,
					iconColor: 'text-gray-500 dark:text-gray-400',
					iconBg: 'bg-gray-100 dark:bg-gray-800',
				},
			],
		},
	];
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
	const pathname = usePathname();
	const { userRole, sidebarCollapsed, setSidebarCollapsed } = useAppContext();

	const priority = userRole?.priority ?? 99;
	const perms = userRole?.permissions ?? [];
	const navGroups = buildNavGroups();

	const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

	// Auto-open the section containing the active route
	useEffect(() => {
		const updates: Record<string, boolean> = {};
		for (const group of navGroups) {
			for (const item of group.items) {
				if (
					item.children?.some((child) =>
						pathname?.startsWith(child.href.split('?')[0])
					)
				) {
					updates[item.title] = true;
				}
			}
		}
		if (Object.keys(updates).length > 0) {
			setOpenSections((prev) => ({ ...prev, ...updates }));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	const toggleSection = (title: string) => {
		setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
	};

	const isActive = (href?: string) => {
		if (!href) return false;
		const cleanHref = href.split('?')[0];
		if (cleanHref === '/dashboard') return pathname === cleanHref;
		return pathname === cleanHref || pathname?.startsWith(cleanHref + '/');
	};

	const isGroupActive = (item: NavItem) => {
		if (item.href && isActive(item.href)) return true;
		return item.children?.some((c) => isActive(c.href)) ?? false;
	};

	return (
		<div className="flex h-full flex-col">
			{/* Logo header */}
			<div
				className={cn(
					'flex h-14 shrink-0 items-center border-b border-border/50',
					sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-4'
				)}
			>
				<Logo size={28} href="/dashboard" showName={!sidebarCollapsed} />
				{!sidebarCollapsed && (
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 shrink-0 text-muted-foreground"
						onClick={() => setSidebarCollapsed(true)}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Navigation */}
			<nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
				<TooltipProvider delayDuration={0}>
					{navGroups.map((group) => {
						const visibleItems = group.items.filter(
							(item) => !item.permission || item.permission(priority, perms)
						);
						if (visibleItems.length === 0) return null;

						return (
							<div key={group.label} className="mb-3">
								{!sidebarCollapsed && (
									<p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
										{group.label}
									</p>
								)}
								{sidebarCollapsed && (
									<div className="mb-2 h-px bg-border/30 mx-2" />
								)}

								<div className="space-y-0.5">
									{visibleItems.map((item) => (
										<div key={item.title}>
											{item.children ? (
												<>
													<Tooltip>
														<TooltipTrigger asChild>
															<button
																onClick={() =>
																	!sidebarCollapsed && toggleSection(item.title)
																}
																className={cn(
																	'flex w-full items-center gap-2.5 rounded-lg py-2 text-sm transition-colors',
																	sidebarCollapsed
																		? 'justify-center px-2'
																		: 'px-3',
																	isGroupActive(item)
																		? 'bg-accent text-accent-foreground'
																		: 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
																)}
															>
																<span
																	className={cn(
																		'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
																		item.iconBg
																	)}
																>
																	<item.icon
																		className={cn('h-4 w-4', item.iconColor)}
																	/>
																</span>
																{!sidebarCollapsed && (
																	<>
																		<span className="flex-1 text-left font-medium leading-none">
																			{item.title}
																		</span>
																		<ChevronRight
																			className={cn(
																				'h-3.5 w-3.5 shrink-0 transition-transform text-muted-foreground/50',
																				openSections[item.title] && 'rotate-90'
																			)}
																		/>
																	</>
																)}
															</button>
														</TooltipTrigger>
														{sidebarCollapsed && (
															<TooltipContent side="right">
																{item.title}
															</TooltipContent>
														)}
													</Tooltip>

													{/* Sub-items */}
													{!sidebarCollapsed && openSections[item.title] && (
														<div className="ml-4 mt-0.5 space-y-0.5 border-l border-border/40 pl-3">
															{item.children.map((child) => (
																<Link
																	key={child.href}
																	href={child.href}
																	onClick={onNavigate}
																	className={cn(
																		'block rounded-md px-2 py-1.5 text-sm transition-colors',
																		isActive(child.href)
																			? 'text-foreground font-medium bg-accent/40'
																			: 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
																	)}
																>
																	{child.title}
																</Link>
															))}
														</div>
													)}
												</>
											) : (
												<Tooltip>
													<TooltipTrigger asChild>
														<Link
															href={item.href!}
															onClick={onNavigate}
															className={cn(
																'flex items-center gap-2.5 rounded-lg py-2 text-sm transition-colors',
																sidebarCollapsed
																	? 'justify-center px-2'
																	: 'px-3',
																isActive(item.href)
																	? 'bg-accent text-accent-foreground'
																	: 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
															)}
														>
															<span
																className={cn(
																	'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
																	item.iconBg
																)}
															>
																<item.icon
																	className={cn('h-4 w-4', item.iconColor)}
																/>
															</span>
															{!sidebarCollapsed && (
																<span className="font-medium leading-none">
																	{item.title}
																</span>
															)}
														</Link>
													</TooltipTrigger>
													{sidebarCollapsed && (
														<TooltipContent side="right">
															{item.title}
														</TooltipContent>
													)}
												</Tooltip>
											)}
										</div>
									))}
								</div>
							</div>
						);
					})}
				</TooltipProvider>
			</nav>

			{/* Expand button when collapsed */}
			{sidebarCollapsed && (
				<div className="shrink-0 border-t border-border/50 p-2">
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-full text-muted-foreground"
						onClick={() => setSidebarCollapsed(false)}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}

export function AppSidebar() {
	const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useAppContext();

	return (
		<>
			{/* Desktop sidebar */}
			<aside
				className={cn(
					'hidden lg:flex flex-col shrink-0 border-r border-border/50 bg-card transition-all duration-200 ease-in-out',
					sidebarCollapsed ? 'w-15' : 'w-60'
				)}
			>
				<SidebarContent />
			</aside>

			{/* Mobile sidebar (Sheet) */}
			<Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
				<SheetContent side="left" className="w-60 p-0 border-r border-border/50">
					<SidebarContent onNavigate={() => setMobileSidebarOpen(false)} />
				</SheetContent>
			</Sheet>
		</>
	);
}
