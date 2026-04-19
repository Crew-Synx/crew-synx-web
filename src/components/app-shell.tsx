'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import {
	parseListResponse,
	OrganizationSchema,
	MemberSchema,
	RoleSchema,
	NotificationSchema,
} from '@/lib/schemas';
import type { Organization, Role } from '@/lib/types';
import { AppSidebar } from './app-sidebar';
import { AppNavbar } from './app-navbar';

// Routes that display the app shell (sidebar + navbar)
const APP_ROUTE_PREFIXES = [
	'/dashboard',
	'/employees',
	'/payments',
	'/attendance',
	'/roles',
	'/settings',
	'/profile',
	'/analytics',
	'/chat',
];

export interface UserData {
	id: string;
	email: string;
	name: string;
	avatar_url?: string | null;
}

export interface NotificationItem {
	id: string;
	notification_type: string;
	title: string;
	message: string;
	read: boolean;
	created_at: string;
	organization_id?: string;
	organization_name?: string;
}

export interface AppContextValue {
	user: UserData | null;
	orgs: Organization[];
	selectedOrg: Organization | null;
	setSelectedOrg: (org: Organization) => void;
	userRole: Role | null;
	unreadCount: number;
	notifications: NotificationItem[];
	markNotifRead: (id: string, orgId: string) => void;
	sidebarCollapsed: boolean;
	setSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
	mobileSidebarOpen: boolean;
	setMobileSidebarOpen: (v: boolean) => void;
	handleLogout: () => void;
	loading: boolean;
	refreshNotifications: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext() {
	const ctx = useContext(AppContext);
	if (!ctx) throw new Error('useAppContext must be used within AppShellProvider');
	return ctx;
}

export function AppShellProvider({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAppRoute = APP_ROUTE_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

	if (!isAppRoute) return <>{children}</>;
	return <AppShellInner>{children}</AppShellInner>;
}

function AppShellInner({ children }: { children: React.ReactNode }) {
	const router = useRouter();

	const [user, setUser] = useState<UserData | null>(null);
	const [orgs, setOrgs] = useState<Organization[]>([]);
	const [selectedOrg, setSelectedOrgState] = useState<Organization | null>(null);
	const [userRole, setUserRole] = useState<Role | null>(null);
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
	const [loading, setLoading] = useState(true);

	const currentUserIdRef = useRef<string | null>(null);
	const prevOrgIdRef = useRef<string | null>(null);

	const setSelectedOrg = useCallback((org: Organization) => {
		setSelectedOrgState(org);
		localStorage.setItem('selected_org', JSON.stringify(org));
	}, []);

	const setSidebarCollapsed = useCallback((v: boolean | ((prev: boolean) => boolean)) => {
		setSidebarCollapsedState((prev) => {
			const next = typeof v === 'function' ? v(prev) : v;
			localStorage.setItem('sidebar_collapsed', String(next));
			return next;
		});
	}, []);

	const handleLogout = useCallback(async () => {
		await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => { });
		localStorage.removeItem('selected_org');
		router.push('/auth/login');
	}, [router]);

	const refreshNotifications = useCallback(async () => {
		try {
			const [countRes, listRes] = await Promise.all([
				apiFetch('/notifications/global-unread-count/', { silent429: true }),
				apiFetch('/notifications/all/', { silent429: true }),
			]);
			if (countRes.ok) {
				const data = await countRes.json().catch(() => ({ data: { unread_count: 0 } }));
				setUnreadCount(data.data?.unread_count ?? 0);
			}
			if (listRes.ok) {
				const data = await listRes.json().catch(() => ({ data: [] }));
				setNotifications(parseListResponse(NotificationSchema, data) as NotificationItem[]);
			}
		} catch {
			// Notifications are non-critical
		}
	}, []);

	const markNotifRead = useCallback(async (id: string, orgId: string) => {
		try {
			await apiFetch(`/notifications/${id}/read/`, { method: 'POST', orgId });
			setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch {
			// Silently fail
		}
	}, []);

	async function fetchUserRole(orgId: string, userId: string) {
		try {
			const [memberRes, roleRes] = await Promise.all([
				apiFetch(`/organizations/${orgId}/members/`, { orgId }),
				apiFetch('/roles/', { orgId }),
			]);
			if (memberRes.ok && roleRes.ok) {
				const memberData = await memberRes.json().catch(() => ({ data: [] }));
				const roleData = await roleRes.json().catch(() => ({ data: [] }));
				const members = parseListResponse(MemberSchema, memberData);
				const roles = parseListResponse(RoleSchema, roleData);
				const myMember = members.find((m) => m.user.id === userId);
				if (myMember?.role?.id) {
					const fullRole = roles.find((r) => r.id === myMember.role.id);
					if (fullRole) setUserRole(fullRole as Role);
				}
			}
		} catch {
			// Role fetch failure is non-critical
		}
	}

	// Load persistent UI state
	useEffect(() => {
		const stored = localStorage.getItem('sidebar_collapsed');
		if (stored !== null) setSidebarCollapsedState(stored === 'true');
	}, []);

	// Bootstrap: fetch user + orgs
	useEffect(() => {
		async function init() {
			try {
				const cachedOrg = localStorage.getItem('selected_org');
				const cached: Organization | null = cachedOrg ? JSON.parse(cachedOrg) : null;
				if (cached) setSelectedOrgState(cached);

				const [userRes, orgRes] = await Promise.all([
					apiFetch('/auth/me/'),
					apiFetch('/organizations/'),
				]);

				if (!userRes.ok) {
					router.push('/auth/login');
					return;
				}

				const userData = await userRes.json().catch(() => null);
				const u: UserData = userData?.data ?? userData;
				setUser(u);
				currentUserIdRef.current = u?.id ?? null;

				if (orgRes.ok) {
					const orgData = await orgRes.json().catch(() => ({ data: [] }));
					const orgList = parseListResponse(OrganizationSchema, orgData) as Organization[];
					setOrgs(orgList);

					const orgToUse = cached ?? orgList[0] ?? null;
					if (orgToUse) {
						if (!cached) setSelectedOrg(orgToUse);
						prevOrgIdRef.current = orgToUse.id;
						if (u?.id) {
							await fetchUserRole(orgToUse.id, u.id);
						}
					}
				}

				await refreshNotifications();
			} catch {
				router.push('/auth/login');
			} finally {
				setLoading(false);
			}
		}
		init();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Re-fetch role when org changes
	useEffect(() => {
		if (!selectedOrg || !currentUserIdRef.current) return;
		if (selectedOrg.id === prevOrgIdRef.current) return;
		prevOrgIdRef.current = selectedOrg.id;
		fetchUserRole(selectedOrg.id, currentUserIdRef.current);
		refreshNotifications();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedOrg?.id]);

	// Poll notifications every 30s
	useEffect(() => {
		if (loading) return;
		const interval = setInterval(refreshNotifications, 30_000);
		return () => clearInterval(interval);
	}, [loading, refreshNotifications]);

	const ctx: AppContextValue = {
		user,
		orgs,
		selectedOrg,
		setSelectedOrg,
		userRole,
		unreadCount,
		notifications,
		markNotifRead,
		sidebarCollapsed,
		setSidebarCollapsed,
		mobileSidebarOpen,
		setMobileSidebarOpen,
		handleLogout,
		loading,
		refreshNotifications,
	};

	return (
		<AppContext.Provider value={ctx}>
			<div className="flex h-screen overflow-hidden bg-background">
				<AppSidebar />
				<div className="flex flex-1 flex-col overflow-hidden min-w-0">
					<AppNavbar />
					<main className="flex-1 overflow-y-auto">
						{loading ? (
							<div className="flex h-full items-center justify-center">
								<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							</div>
						) : (
							children
						)}
					</main>
				</div>
			</div>
		</AppContext.Provider>
	);
}
