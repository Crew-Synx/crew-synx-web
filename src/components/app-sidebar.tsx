'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppContext } from './app-shell';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
	LayoutDashboard,
	Briefcase,
	Receipt,
	Clock,
	Shield,
	Settings,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';

interface NavItem {
	title: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
	iconColor: string;
	iconBg: string;
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
					href: '/employees',
					icon: Briefcase,
					iconColor: 'text-blue-600 dark:text-blue-400',
					iconBg: 'bg-blue-100 dark:bg-blue-950',
					permission: (p, perms) =>
						p <= 2 || perms.some((k) => k.startsWith('member.')),
				},
			],
		},
		{
			label: 'Operations',
			items: [
				{
					title: 'Payments',
					href: '/payments',
					icon: Receipt,
					iconColor: 'text-orange-600 dark:text-orange-400',
					iconBg: 'bg-orange-100 dark:bg-orange-950',
				},
				{
					title: 'Attendance',
					href: '/attendance',
					icon: Clock,
					iconColor: 'text-teal-600 dark:text-teal-400',
					iconBg: 'bg-teal-100 dark:bg-teal-950',
				},
			],
		},
		{
			label: 'Administration',
			items: [
				{
					title: 'Roles',
					href: '/roles',
					icon: Shield,
					iconColor: 'text-indigo-600 dark:text-indigo-400',
					iconBg: 'bg-indigo-100 dark:bg-indigo-950',
					permission: (p) => p <= 1,
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
	const isMobile = !!onNavigate;
	const pathname = usePathname();
	const { userRole, sidebarCollapsed, setSidebarCollapsed } = useAppContext();

	const priority = userRole?.priority ?? 99;
	const perms = userRole?.access ? Object.keys(userRole.access) : [];
	const navGroups = buildNavGroups();

	const isActive = (href: string) => {
		if (href === '/dashboard') return pathname === href;
		return pathname === href || pathname?.startsWith(href + '/');
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
				{!sidebarCollapsed && !isMobile && (
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
										<Tooltip key={item.title}>
											<TooltipTrigger asChild>
												<Link
													href={item.href}
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
														<item.icon className={cn('h-4 w-4', item.iconColor)} />
													</span>
													{!sidebarCollapsed && (
														<span className="font-medium leading-none">
															{item.title}
														</span>
													)}
												</Link>
											</TooltipTrigger>
											{sidebarCollapsed && (
												<TooltipContent side="right">{item.title}</TooltipContent>
											)}
										</Tooltip>
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
					<VisuallyHidden.Root>
						<SheetTitle>Navigation</SheetTitle>
					</VisuallyHidden.Root>
					<SidebarContent onNavigate={() => setMobileSidebarOpen(false)} />
				</SheetContent>
			</Sheet>
		</>
	);
}
