'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppContext } from './app-shell';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Bell, LogOut, User, Settings, Menu, AlignLeft } from 'lucide-react';

function formatTimeAgo(dateStr: string) {
	const diff = Date.now() - new Date(dateStr).getTime();
	const mins = Math.floor(diff / 60_000);
	if (mins < 1) return 'just now';
	if (mins < 60) return `${mins}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `${hrs}h ago`;
	return `${Math.floor(hrs / 24)}d ago`;
}

export function AppNavbar() {
	const {
		user,
		orgs,
		selectedOrg,
		setSelectedOrg,
		unreadCount,
		notifications,
		markNotifRead,
		setSidebarCollapsed,
		setMobileSidebarOpen,
		handleLogout,
	} = useAppContext();

	const [notifOpen, setNotifOpen] = useState(false);

	const userInitials = user?.name
		? user.name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
		: (user?.email?.charAt(0).toUpperCase() ?? '?');

	return (
		<header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-card/80 backdrop-blur-sm px-4">
			{/* Left: sidebar toggles */}
			<div className="flex items-center gap-1">
				{/* Desktop: toggle collapse */}
				<Button
					variant="ghost"
					size="icon"
					className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground"
					onClick={() => setSidebarCollapsed((prev) => !prev)}
				>
					<AlignLeft className="h-4 w-4" />
				</Button>
				{/* Mobile: open sheet */}
				<Button
					variant="ghost"
					size="icon"
					className="flex lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
					onClick={() => setMobileSidebarOpen(true)}
				>
					<Menu className="h-4 w-4" />
				</Button>
			</div>

			{/* Org switcher */}
			{orgs.length > 1 && selectedOrg ? (
				<Select
					value={selectedOrg.id}
					onValueChange={(id) => {
						const org = orgs.find((o) => o.id === id);
						if (org) setSelectedOrg(org);
					}}
				>
					<SelectTrigger className="h-8 w-44 text-sm border-border/50">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{orgs.map((org) => (
							<SelectItem key={org.id} value={org.id}>
								{org.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			) : selectedOrg ? (
				<span className="hidden sm:block text-sm font-medium text-muted-foreground truncate max-w-40">
					{selectedOrg.name}
				</span>
			) : null}

			{/* Spacer */}
			<div className="flex-1" />

			{/* Notification bell */}
			<DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
					>
						<Bell className="h-4 w-4" />
						{unreadCount > 0 && (
							<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
								{unreadCount > 9 ? '9+' : unreadCount}
							</span>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-80">
					<DropdownMenuLabel className="flex items-center justify-between">
						<span>Notifications</span>
						{unreadCount > 0 && (
							<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
								{unreadCount} new
							</span>
						)}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{notifications.length === 0 ? (
						<div className="py-6 text-center text-sm text-muted-foreground">
							No notifications
						</div>
					) : (
						<div className="max-h-72 overflow-y-auto">
							{notifications.slice(0, 10).map((n) => (
								<DropdownMenuItem
									key={n.id}
									className={cn(
										'flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer',
										!n.read && 'bg-accent/30'
									)}
									onClick={() => {
										if (!n.read) {
											const orgId =
												(n as { organization_id?: string }).organization_id ||
												selectedOrg?.id ||
												'';
											markNotifRead(n.id, orgId);
										}
									}}
								>
									<div className="flex w-full items-start justify-between gap-2">
										<span className={cn('text-sm leading-snug', !n.read && 'font-semibold')}>
											{n.title}
										</span>
										{!n.read && (
											<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
										)}
									</div>
									<span className="text-xs text-muted-foreground line-clamp-2">
										{n.message}
									</span>
									<span className="text-[11px] text-muted-foreground/60">
										{formatTimeAgo(n.created_at)}
									</span>
								</DropdownMenuItem>
							))}
						</div>
					)}
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild className="justify-center text-xs text-muted-foreground">
						<Link href="/settings?tab=notifications">View all notifications</Link>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* User pill dropdown — hamburger lines + avatar */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						className="flex items-center rounded-full bg-foreground/8 hover:bg-foreground/12 border border-border/50 transition-colors overflow-hidden"
						aria-label="User menu"
					>
						{/* Hamburger lines side */}
						<span className="flex items-center justify-center w-8 h-8 text-muted-foreground">
							<svg
								width="14"
								height="10"
								viewBox="0 0 14 10"
								fill="none"
								className="shrink-0"
							>
								<rect y="0" width="14" height="1.5" rx="0.75" fill="currentColor" />
								<rect y="4.25" width="14" height="1.5" rx="0.75" fill="currentColor" />
								<rect y="8.5" width="14" height="1.5" rx="0.75" fill="currentColor" />
							</svg>
						</span>
						{/* Avatar side */}
						<span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
							{userInitials}
						</span>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col gap-0.5">
							<p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
							<p className="text-xs text-muted-foreground truncate">{user?.email}</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<Link href="/profile">
							<User className="mr-2 h-4 w-4" />
							My Profile
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link href="/settings">
							<Settings className="mr-2 h-4 w-4" />
							Settings
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={handleLogout}
					>
						<LogOut className="mr-2 h-4 w-4" />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}
