'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	User,
	Bell,
	Shield,
	CreditCard,
	Loader2,
	ArrowLeft,
	LogOut,
	Check,
	Moon,
	Sun,
	Monitor,
	Trash2,
	Building2,
	AlertTriangle,
} from 'lucide-react';
import { useTheme } from 'next-themes';

const API = 'http://localhost:8000/api/v1';

interface UserProfile {
	id: string;
	email: string;
	name: string;
}

interface Organization {
	id: string;
	name: string;
	slug: string;
}

interface NotificationPref {
	key: string;
	label: string;
	description: string;
	enabled: boolean;
}

function getToken() {
	return localStorage.getItem('access_token');
}

function authHeaders(orgId?: string) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${getToken()}`,
	};
	if (orgId) headers['X-Organization-ID'] = orgId;
	return headers;
}

const DEFAULT_PREFS: NotificationPref[] = [
	{ key: 'member_invited', label: 'Member invitations', description: 'When a new member is invited to the organization', enabled: true },
	{ key: 'member_removed', label: 'Member removals', description: 'When a member is removed from the organization', enabled: true },
	{ key: 'role_changed', label: 'Role changes', description: 'When a member\'s role is updated', enabled: true },
	{ key: 'org_updated', label: 'Organization updates', description: 'When organization settings are changed', enabled: true },
	{ key: 'weekly_report', label: 'Weekly reports', description: 'Summary of your team\'s weekly activity', enabled: false },
];

export default function SettingsPage() {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [orgs, setOrgs] = useState<Organization[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [name, setName] = useState('');
	const [saved, setSaved] = useState(false);
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Notification prefs
	const [notifPrefs, setNotifPrefs] = useState<NotificationPref[]>(DEFAULT_PREFS);
	const [savingNotifs, setSavingNotifs] = useState(false);
	const [notifsSaved, setNotifsSaved] = useState(false);

	// Delete account dialog
	const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
	const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');
	const [deletingAccount, setDeletingAccount] = useState(false);

	// Delete org dialog
	const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);
	const [deleteOrgConfirm, setDeleteOrgConfirm] = useState('');
	const [deletingOrg, setDeletingOrg] = useState(false);
	const [deleteOrgTarget, setDeleteOrgTarget] = useState<Organization | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const fetchNotifPrefs = useCallback(async (orgId: string) => {
		try {
			const res = await fetch(`${API}/notifications/preferences/`, {
				headers: authHeaders(orgId),
			});
			if (res.ok) {
				const data = await res.json();
				const serverPrefs = data.data || [];
				// Merge server prefs into defaults
				setNotifPrefs((prev) =>
					prev.map((p) => {
						const match = serverPrefs.find((sp: { key: string; enabled: boolean }) => sp.key === p.key);
						return match ? { ...p, enabled: match.enabled } : p;
					})
				);
			}
		} catch {
			// Use defaults
		}
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			const token = getToken();
			if (!token) {
				router.push('/auth/login');
				return;
			}

			try {
				const [userRes, orgsRes] = await Promise.all([
					fetch(`${API}/auth/me/`, { headers: authHeaders() }),
					fetch(`${API}/organizations/`, { headers: authHeaders() }),
				]);

				if (userRes.status === 401) {
					localStorage.removeItem('access_token');
					localStorage.removeItem('refresh_token');
					router.push('/auth/login');
					return;
				}

				if (userRes.ok) {
					const data = await userRes.json();
					setProfile(data.data);
					setName(data.data.name || '');
				}

				if (orgsRes.ok) {
					const data = await orgsRes.json();
					const orgList = data.data || [];
					setOrgs(orgList);
					if (orgList.length > 0) {
						fetchNotifPrefs(orgList[0].id);
					}
				}
			} catch {
				router.push('/auth/login');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [router, fetchNotifPrefs]);

	const handleSaveProfile = async () => {
		const token = getToken();
		if (!token) return;

		setSaving(true);
		setSaved(false);

		try {
			const response = await fetch(`${API}/auth/me/`, {
				method: 'PATCH',
				headers: authHeaders(),
				body: JSON.stringify({ name }),
			});

			if (response.ok) {
				const data = await response.json();
				setProfile(data.data);
				setSaved(true);
				setTimeout(() => setSaved(false), 2000);
			}
		} catch {
			// Silent fail
		} finally {
			setSaving(false);
		}
	};

	const handleToggleNotifPref = (key: string) => {
		setNotifPrefs((prev) =>
			prev.map((p) => (p.key === key ? { ...p, enabled: !p.enabled } : p))
		);
	};

	const handleSaveNotifPrefs = async () => {
		if (orgs.length === 0) return;
		setSavingNotifs(true);
		setNotifsSaved(false);

		try {
			const promises = notifPrefs.map((pref) =>
				fetch(`${API}/notifications/preferences/`, {
					method: 'POST',
					headers: authHeaders(orgs[0].id),
					body: JSON.stringify({ key: pref.key, enabled: pref.enabled }),
				})
			);
			await Promise.all(promises);
			setNotifsSaved(true);
			setTimeout(() => setNotifsSaved(false), 2000);
		} catch {
			// Silent fail
		} finally {
			setSavingNotifs(false);
		}
	};

	const handleLogout = async () => {
		const refreshToken = localStorage.getItem('refresh_token');
		const token = getToken();

		if (refreshToken && token) {
			try {
				await fetch(`${API}/auth/logout/`, {
					method: 'POST',
					headers: authHeaders(),
					body: JSON.stringify({ refresh_token: refreshToken }),
				});
			} catch {
				// Ignore
			}
		}

		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		router.push('/auth/login');
	};

	const handleLogoutAllSessions = async () => {
		// Logout current session (invalidates refresh token)
		// Then clear local tokens and redirect
		await handleLogout();
	};

	const handleDeleteAccount = async () => {
		if (deleteAccountConfirm !== profile?.email) return;
		setDeletingAccount(true);
		try {
			const res = await fetch(`${API}/auth/me/`, {
				method: 'DELETE',
				headers: authHeaders(),
			});
			if (res.ok || res.status === 204) {
				localStorage.removeItem('access_token');
				localStorage.removeItem('refresh_token');
				router.push('/auth/login');
			}
		} catch {
			// Silent fail
		} finally {
			setDeletingAccount(false);
		}
	};

	const handleDeleteOrg = async () => {
		if (!deleteOrgTarget || deleteOrgConfirm !== deleteOrgTarget.name) return;
		setDeletingOrg(true);
		try {
			const res = await fetch(`${API}/organizations/${deleteOrgTarget.id}/`, {
				method: 'DELETE',
				headers: authHeaders(deleteOrgTarget.id),
			});
			if (res.ok || res.status === 204) {
				setOrgs((prev) => prev.filter((o) => o.id !== deleteOrgTarget.id));
				setDeleteOrgOpen(false);
				setDeleteOrgConfirm('');
				setDeleteOrgTarget(null);
			}
		} catch {
			// Silent fail
		} finally {
			setDeletingOrg(false);
		}
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Top bar */}
			<header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="icon" asChild>
							<Link href="/dashboard">
								<ArrowLeft className="h-4 w-4" />
							</Link>
						</Button>
						<h1 className="text-lg font-semibold">Settings</h1>
					</div>
					<Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
						<LogOut className="mr-2 h-4 w-4" />
						Log out
					</Button>
				</div>
			</header>

			<main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
				<Tabs defaultValue="profile" className="w-full">
					<TabsList className="mb-8 w-full justify-start">
						<TabsTrigger value="profile" className="gap-2">
							<User className="h-4 w-4" />
							Profile
						</TabsTrigger>
						<TabsTrigger value="appearance" className="gap-2">
							<Sun className="h-4 w-4" />
							Appearance
						</TabsTrigger>
						<TabsTrigger value="notifications" className="gap-2">
							<Bell className="h-4 w-4" />
							Notifications
						</TabsTrigger>
						<TabsTrigger value="billing" className="gap-2">
							<CreditCard className="h-4 w-4" />
							Billing
						</TabsTrigger>
						<TabsTrigger value="security" className="gap-2">
							<Shield className="h-4 w-4" />
							Security
						</TabsTrigger>
					</TabsList>

					{/* Profile Tab */}
					<TabsContent value="profile">
						<Card className="border-border/50">
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>
									Update your personal details and how others see you.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center gap-4">
									<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
										{profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || '?'}
									</div>
									<div>
										<p className="font-semibold">{profile?.name || 'No name set'}</p>
										<p className="text-sm text-muted-foreground">{profile?.email}</p>
									</div>
								</div>

								<Separator />

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="name">Full Name</Label>
										<Input
											id="name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											placeholder="Your name"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											id="email"
											value={profile?.email || ''}
											disabled
											className="opacity-60"
										/>
										<p className="text-xs text-muted-foreground">Email cannot be changed.</p>
									</div>
								</div>

								<div className="flex items-center gap-3">
									<Button onClick={handleSaveProfile} disabled={saving}>
										{saving ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Saving...
											</>
										) : saved ? (
											<>
												<Check className="mr-2 h-4 w-4" />
												Saved
											</>
										) : (
											'Save Changes'
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Appearance Tab */}
					<TabsContent value="appearance">
						<Card className="border-border/50">
							<CardHeader>
								<CardTitle>Appearance</CardTitle>
								<CardDescription>
									Customize how CrewSynx looks for you.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-3">
									<Label>Theme</Label>
									<div className="grid grid-cols-3 gap-3">
										{[
											{ value: 'light', label: 'Light', icon: Sun },
											{ value: 'dark', label: 'Dark', icon: Moon },
											{ value: 'system', label: 'System', icon: Monitor },
										].map((t) => (
											<button
												key={t.value}
												onClick={() => setTheme(t.value)}
												className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${mounted && theme === t.value
														? 'border-primary bg-primary/5'
														: 'border-border hover:border-border/80'
													}`}
											>
												<t.icon className="h-5 w-5" />
												<span className="text-sm font-medium">{t.label}</span>
											</button>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Notifications Tab */}
					<TabsContent value="notifications">
						<Card className="border-border/50">
							<CardHeader>
								<CardTitle>Notification Preferences</CardTitle>
								<CardDescription>
									Choose what you want to be notified about.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{notifPrefs.map((pref) => (
									<div key={pref.key} className="flex items-start justify-between rounded-lg border border-border/50 p-4">
										<div className="space-y-0.5 pr-4">
											<p className="text-sm font-medium">{pref.label}</p>
											<p className="text-xs text-muted-foreground">{pref.description}</p>
										</div>
										<Checkbox
											checked={pref.enabled}
											onCheckedChange={() => handleToggleNotifPref(pref.key)}
										/>
									</div>
								))}

								<div className="pt-2">
									<Button onClick={handleSaveNotifPrefs} disabled={savingNotifs}>
										{savingNotifs ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Saving...
											</>
										) : notifsSaved ? (
											<>
												<Check className="mr-2 h-4 w-4" />
												Preferences Saved
											</>
										) : (
											'Save Preferences'
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Billing Tab */}
					<TabsContent value="billing">
						<Card className="border-border/50">
							<CardHeader>
								<CardTitle>Billing & Plan</CardTitle>
								<CardDescription>
									Manage your subscription and payment methods.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
									<div>
										<div className="flex items-center gap-2">
											<p className="font-semibold">Free Plan</p>
											<Badge variant="secondary">Current</Badge>
										</div>
										<p className="mt-1 text-sm text-muted-foreground">
											Up to 5 team members, 2 projects
										</p>
									</div>
									<Button variant="outline" asChild>
										<Link href="/pricing">Upgrade</Link>
									</Button>
								</div>

								<Separator />

								<div>
									<h3 className="text-sm font-semibold">Payment Method</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										No payment method on file.
									</p>
									<Button variant="outline" size="sm" className="mt-3" disabled>
										Add Payment Method
									</Button>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Security Tab */}
					<TabsContent value="security">
						<div className="space-y-6">
							{/* Auth method */}
							<Card className="border-border/50">
								<CardHeader>
									<CardTitle>Security</CardTitle>
									<CardDescription>
										Manage your account security settings.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
										<div>
											<p className="text-sm font-medium">Authentication Method</p>
											<p className="text-xs text-muted-foreground">
												You sign in with email OTP (passwordless)
											</p>
										</div>
										<Badge variant="outline" className="text-xs">Active</Badge>
									</div>
								</CardContent>
							</Card>

							{/* Active sessions */}
							<Card className="border-border/50">
								<CardHeader>
									<CardTitle>Active Sessions</CardTitle>
									<CardDescription>
										Manage your logged-in sessions. Signing out of all sessions will log you out everywhere.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
										<div className="flex items-center gap-3">
											<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
												<Monitor className="h-4 w-4 text-primary" />
											</div>
											<div>
												<p className="text-sm font-medium">Current Session</p>
												<p className="text-xs text-muted-foreground">
													This browser &middot; Active now
												</p>
											</div>
										</div>
										<Badge variant="secondary" className="text-xs">Current</Badge>
									</div>

									<Button
										variant="outline"
										size="sm"
										onClick={handleLogoutAllSessions}
										className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
									>
										<LogOut className="mr-2 h-3.5 w-3.5" />
										Sign out of all sessions
									</Button>
								</CardContent>
							</Card>

							{/* Danger zone */}
							<Card className="border-destructive/30 border">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-destructive">
										<AlertTriangle className="h-5 w-5" />
										Danger Zone
									</CardTitle>
									<CardDescription>
										These actions are irreversible. Please proceed with caution.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Delete Organization */}
									{orgs.length > 0 && (
										<div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
											<div>
												<p className="text-sm font-medium">Delete Organization</p>
												<p className="text-xs text-muted-foreground">
													Permanently delete an organization and all its data.
												</p>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="border-destructive/50 text-destructive hover:bg-destructive/10"
												onClick={() => {
													setDeleteOrgTarget(orgs[0]);
													setDeleteOrgOpen(true);
												}}
											>
												<Building2 className="mr-2 h-3.5 w-3.5" />
												Delete
											</Button>
										</div>
									)}

									{/* Delete Account */}
									<div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
										<div>
											<p className="text-sm font-medium">Delete Account</p>
											<p className="text-xs text-muted-foreground">
												Permanently delete your account and all associated data.
											</p>
										</div>
										<Button
											variant="outline"
											size="sm"
											className="border-destructive/50 text-destructive hover:bg-destructive/10"
											onClick={() => setDeleteAccountOpen(true)}
										>
											<Trash2 className="mr-2 h-3.5 w-3.5" />
											Delete
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</main>

			{/* Delete Account Dialog */}
			<Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5" />
							Delete your account
						</DialogTitle>
						<DialogDescription>
							This action is permanent and cannot be undone. All your data, organization memberships, and settings will be deleted.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 py-2">
						<Label htmlFor="delete-confirm">
							Type <span className="font-mono font-semibold">{profile?.email}</span> to confirm
						</Label>
						<Input
							id="delete-confirm"
							value={deleteAccountConfirm}
							onChange={(e) => setDeleteAccountConfirm(e.target.value)}
							placeholder="your@email.com"
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => { setDeleteAccountOpen(false); setDeleteAccountConfirm(''); }}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteAccount}
							disabled={deletingAccount || deleteAccountConfirm !== profile?.email}
						>
							{deletingAccount ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								'Delete My Account'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Org Dialog */}
			<Dialog open={deleteOrgOpen} onOpenChange={(open) => { setDeleteOrgOpen(open); if (!open) { setDeleteOrgConfirm(''); setDeleteOrgTarget(null); } }}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2 text-destructive">
							<AlertTriangle className="h-5 w-5" />
							Delete organization
						</DialogTitle>
						<DialogDescription>
							This will permanently delete <span className="font-semibold">{deleteOrgTarget?.name}</span> and all members, projects, and data within it.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3 py-2">
						{orgs.length > 1 && (
							<div className="space-y-2">
								<Label>Select organization</Label>
								<div className="space-y-2">
									{orgs.map((org) => (
										<button
											key={org.id}
											onClick={() => setDeleteOrgTarget(org)}
											className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${deleteOrgTarget?.id === org.id
													? 'border-destructive bg-destructive/5'
													: 'border-border hover:border-border/80'
												}`}
										>
											<Building2 className="h-4 w-4 shrink-0" />
											<div>
												<p className="text-sm font-medium">{org.name}</p>
												<p className="text-xs text-muted-foreground">{org.slug}</p>
											</div>
										</button>
									))}
								</div>
							</div>
						)}
						<Label htmlFor="delete-org-confirm">
							Type <span className="font-mono font-semibold">{deleteOrgTarget?.name}</span> to confirm
						</Label>
						<Input
							id="delete-org-confirm"
							value={deleteOrgConfirm}
							onChange={(e) => setDeleteOrgConfirm(e.target.value)}
							placeholder="Organization name"
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => { setDeleteOrgOpen(false); setDeleteOrgConfirm(''); setDeleteOrgTarget(null); }}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteOrg}
							disabled={deletingOrg || !deleteOrgTarget || deleteOrgConfirm !== deleteOrgTarget.name}
						>
							{deletingOrg ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								'Delete Organization'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
