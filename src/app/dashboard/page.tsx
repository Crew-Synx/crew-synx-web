'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Loader2,
	Users,
	Settings,
	LogOut,
	Plus,
	Building2,
	UserPlus,
	Trash2,
	Shield,
	Mail,
	Crown,
	MoreHorizontal,
	Copy,
	Check,
	Bell,
	Briefcase,
	Layers,
	Receipt,
	GitBranch,
	Clock,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const API = 'https://crewsynx.switchspace.in/api/v1';

interface UserData {
	id: string;
	email: string;
	name: string;
}

interface Organization {
	id: string;
	name: string;
	slug: string;
	invite_code?: string;
	avatar_url?: string | null;
}

interface Member {
	id: string;
	user: {
		id: string;
		email: string;
		name: string;
		avatar_url?: string | null;
	};
	role: {
		id: string;
		name: string;
	};
	joined_at: string;
}

interface Role {
	id: string;
	name: string;
	is_system: boolean;
}

interface NotificationItem {
	id: string;
	notification_type: string;
	title: string;
	message: string;
	read: boolean;
	created_at: string;
	organization_name?: string;
	organization_id?: string;
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

export default function DashboardPage() {
	const [user, setUser] = useState<UserData | null>(null);
	const [orgs, setOrgs] = useState<Organization[]>([]);
	const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
	const [members, setMembers] = useState<Member[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [loading, setLoading] = useState(true);
	const [membersLoading, setMembersLoading] = useState(false);

	// Invite dialog
	const [inviteOpen, setInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState('');
	const [inviteRole, setInviteRole] = useState('');
	const [inviting, setInviting] = useState(false);

	// Org settings
	const [orgName, setOrgName] = useState('');
	const [savingOrg, setSavingOrg] = useState(false);
	const [orgSaved, setOrgSaved] = useState(false);

	// Copy invite code
	const [copied, setCopied] = useState(false);

	// Notifications
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [notifOpen, setNotifOpen] = useState(false);

	const router = useRouter();

	const fetchMembers = useCallback(async (orgId: string) => {
		setMembersLoading(true);
		try {
			const [membersRes, rolesRes] = await Promise.all([
				fetch(`${API}/organizations/${orgId}/members/`, { headers: authHeaders(orgId) }),
				fetch(`${API}/roles/`, { headers: authHeaders(orgId) }),
			]);

			if (membersRes.ok) {
				const data = await membersRes.json();
				setMembers(data.data || []);
			}
			if (rolesRes.ok) {
				const data = await rolesRes.json();
				setRoles(data.data || []);
			}
		} catch {
			// Silently fail
		} finally {
			setMembersLoading(false);
		}
	}, []);

	useEffect(() => {
		const init = async () => {
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
					setUser(data.data);
				}

				if (orgsRes.ok) {
					const data = await orgsRes.json();
					const orgList = data.data || [];
					setOrgs(orgList);
					if (orgList.length > 0) {
						const org = orgList[0];
						setSelectedOrg(org);
						setOrgName(org.name);

						// Redirect to setup wizard if org has no branches yet (first-time setup)
						if (!localStorage.getItem('setup_complete')) {
							const branchRes = await fetch(`${API}/organizations/${org.id}/branches/`, {
								headers: authHeaders(org.id),
							});
							if (branchRes.ok) {
								const branchData = await branchRes.json();
								const branchList = branchData.data || [];
								if (branchList.length === 0) {
									router.push('/setup');
									return;
								}
								localStorage.setItem('setup_complete', 'true');
							}
						}
					}
				}
			} catch {
				router.push('/auth/login');
			} finally {
				setLoading(false);
			}
		};

		init();
	}, [router]);

	// Fetch notifications and unread count, poll every 30s
	const fetchNotifications = useCallback(async () => {
		try {
			const [countRes, listRes] = await Promise.all([
				fetch(`${API}/notifications/global-unread-count/`, { headers: authHeaders() }),
				fetch(`${API}/notifications/all/`, { headers: authHeaders() }),
			]);
			if (countRes.ok) {
				const data = await countRes.json();
				setUnreadCount(data.data?.unread_count ?? 0);
			}
			if (listRes.ok) {
				const data = await listRes.json();
				setNotifications(data.data || []);
			}
		} catch {
			// Silently fail
		}
	}, []);

	useEffect(() => {
		if (!loading) {
			fetchNotifications();
			const interval = setInterval(() => {
				fetchNotifications();
				// Also refresh org list to pick up new memberships
				fetch(`${API}/organizations/`, { headers: authHeaders() })
					.then((res) => res.json())
					.then((data) => {
						const orgList = data.data || [];
						setOrgs((prev) => {
							if (orgList.length !== prev.length) {
								// New org detected — update list
								if (!selectedOrg && orgList.length > 0) {
									setSelectedOrg(orgList[0]);
									setOrgName(orgList[0].name);
								}
								return orgList;
							}
							return prev;
						});
					})
					.catch(() => { });
			}, 30000);
			return () => clearInterval(interval);
		}
	}, [loading, fetchNotifications]);

	const handleMarkNotifRead = async (notifId: string, orgId: string) => {
		try {
			await fetch(`${API}/notifications/${notifId}/read/`, {
				method: 'POST',
				headers: authHeaders(orgId),
			});
			setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, read: true } : n));
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch {
			// Silently fail
		}
	};

	useEffect(() => {
		if (selectedOrg) {
			localStorage.setItem('selected_org', JSON.stringify(selectedOrg));
			fetchMembers(selectedOrg.id);
		}
	}, [selectedOrg, fetchMembers]);

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

	const handleInviteMember = async () => {
		if (!selectedOrg || !inviteEmail) return;
		setInviting(true);
		try {
			const res = await fetch(`${API}/organizations/${selectedOrg.id}/members/`, {
				method: 'POST',
				headers: authHeaders(selectedOrg.id),
				body: JSON.stringify({ email: inviteEmail, role_id: inviteRole || undefined }),
			});

			if (res.ok) {
				setInviteEmail('');
				setInviteRole('');
				setInviteOpen(false);
				fetchMembers(selectedOrg.id);
			}
		} catch {
			// Silently fail
		} finally {
			setInviting(false);
		}
	};

	const handleRemoveMember = async (memberId: string) => {
		if (!selectedOrg || !confirm('Remove this member from the organization?')) return;
		try {
			await fetch(`${API}/organizations/${selectedOrg.id}/members/${memberId}/`, {
				method: 'DELETE',
				headers: authHeaders(selectedOrg.id),
			});
			fetchMembers(selectedOrg.id);
		} catch {
			// Silently fail
		}
	};

	const handleUpdateMemberRole = async (memberId: string, roleId: string) => {
		if (!selectedOrg) return;
		try {
			await fetch(`${API}/organizations/${selectedOrg.id}/members/${memberId}/`, {
				method: 'PATCH',
				headers: authHeaders(selectedOrg.id),
				body: JSON.stringify({ role_id: roleId }),
			});
			fetchMembers(selectedOrg.id);
		} catch {
			// Silently fail
		}
	};

	const handleSaveOrg = async () => {
		if (!selectedOrg) return;
		setSavingOrg(true);
		setOrgSaved(false);
		try {
			const res = await fetch(`${API}/organizations/${selectedOrg.id}/`, {
				method: 'PATCH',
				headers: authHeaders(selectedOrg.id),
				body: JSON.stringify({ name: orgName }),
			});
			if (res.ok) {
				const data = await res.json();
				const updated = data.data;
				setSelectedOrg(updated);
				setOrgs((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
				setOrgSaved(true);
				setTimeout(() => setOrgSaved(false), 2000);
			}
		} catch {
			// Silently fail
		} finally {
			setSavingOrg(false);
		}
	};

	const handleCopyInviteCode = () => {
		if (!selectedOrg?.invite_code) return;
		navigator.clipboard.writeText(selectedOrg.invite_code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	const getRoleIcon = (roleName?: string) => {
		if (roleName?.toLowerCase() === 'owner') return <Crown className="h-3.5 w-3.5" />;
		if (roleName?.toLowerCase() === 'admin') return <Shield className="h-3.5 w-3.5" />;
		return null;
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Top bar */}
			<header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
							C
						</div>
						<span className="text-lg font-bold tracking-tight">CrewSynx</span>
						<span className="text-sm text-muted-foreground hidden sm:inline">/ Management</span>
					</div>
					<div className="flex items-center gap-2">
						{/* Notification Bell */}
						<DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="sm" className="relative">
									<Bell className="h-4 w-4" />
									{unreadCount > 0 && (
										<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
											{unreadCount > 9 ? '9+' : unreadCount}
										</span>
									)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
								{notifications.length === 0 ? (
									<div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
								) : (
									notifications.slice(0, 15).map((notif) => (
										<DropdownMenuItem
											key={notif.id}
											className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notif.read ? 'bg-accent/50' : ''}`}
											onClick={() => {
												if (!notif.read && notif.organization_id) {
													handleMarkNotifRead(notif.id, notif.organization_id);
												}
												// Switch to the notification's org if it exists
												if (notif.organization_id) {
													const org = orgs.find((o) => o.id === notif.organization_id);
													if (org) {
														setSelectedOrg(org);
														setOrgName(org.name);
													}
												}
												setNotifOpen(false);
											}}
										>
											<span className="text-sm font-medium leading-tight">{notif.title}</span>
											<span className="text-xs text-muted-foreground leading-tight">{notif.message}</span>
											{notif.organization_name && (
												<span className="text-[10px] text-muted-foreground/70">{notif.organization_name}</span>
											)}
										</DropdownMenuItem>
									))
								)}
							</DropdownMenuContent>
						</DropdownMenu>
						<Button variant="ghost" size="sm" asChild>
							<Link href="/settings">
								<Settings className="mr-2 h-4 w-4" />
								Settings
							</Link>
						</Button>
						<Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive hover:text-destructive">
							<LogOut className="mr-2 h-4 w-4" />
							Log out
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Welcome */}
				<div className="mb-8">
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
						Welcome back{user?.name ? `, ${user.name}` : ''}
					</h1>
					<p className="mt-1 text-muted-foreground">
						Manage your organization and team members.
					</p>
				</div>

				{/* Org Selector */}
				{orgs.length > 1 && (
					<div className="mb-6">
						<Label className="text-xs text-muted-foreground mb-1.5 block">Organization</Label>
						<Select
							value={selectedOrg?.id}
							onValueChange={(id) => {
								const org = orgs.find((o) => o.id === id);
								if (org) {
									setSelectedOrg(org);
									setOrgName(org.name);
								}
							}}
						>
							<SelectTrigger className="w-64">
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
					</div>
				)}

				{selectedOrg ? (
					<div className="space-y-6">
						{/* HRMS Quick Access */}
						<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
							<Link href="/employees" className="group">
								<Card className="border-border/50 transition-colors group-hover:border-primary/50">
									<CardContent className="flex items-center gap-3 p-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
											<Briefcase className="h-5 w-5" />
										</div>
										<div>
											<p className="text-sm font-medium">Employees</p>
											<p className="text-xs text-muted-foreground">Directory & onboard</p>
										</div>
									</CardContent>
								</Card>
							</Link>
							<Link href="/branches" className="group">
								<Card className="border-border/50 transition-colors group-hover:border-primary/50">
									<CardContent className="flex items-center gap-3 p-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
											<GitBranch className="h-5 w-5" />
										</div>
										<div>
											<p className="text-sm font-medium">Branches</p>
											<p className="text-xs text-muted-foreground">Offices & locations</p>
										</div>
									</CardContent>
								</Card>
							</Link>
							<Link href="/departments" className="group">
								<Card className="border-border/50 transition-colors group-hover:border-primary/50">
									<CardContent className="flex items-center gap-3 p-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
											<Layers className="h-5 w-5" />
										</div>
										<div>
											<p className="text-sm font-medium">Departments</p>
											<p className="text-xs text-muted-foreground">Org structure</p>
										</div>
									</CardContent>
								</Card>
							</Link>
							<Link href="/expenses" className="group">
								<Card className="border-border/50 transition-colors group-hover:border-primary/50">
									<CardContent className="flex items-center gap-3 p-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
											<Receipt className="h-5 w-5" />
										</div>
										<div>
											<p className="text-sm font-medium">Expenses</p>
											<p className="text-xs text-muted-foreground">Claims & reimburse</p>
										</div>
									</CardContent>
								</Card>
							</Link>
							<Link href="/attendance" className="group">
								<Card className="border-border/50 transition-colors group-hover:border-primary/50">
									<CardContent className="flex items-center gap-3 p-4">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
											<Clock className="h-5 w-5" />
										</div>
										<div>
											<p className="text-sm font-medium">Attendance</p>
											<p className="text-xs text-muted-foreground">QR scan & away tickets</p>
										</div>
									</CardContent>
								</Card>
							</Link>
						</div>

						<div className="grid gap-6 lg:grid-cols-3">
							{/* Left: Organization Settings */}
							<div className="space-y-6">
								<Card className="border-border/50">
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-lg">
											<Building2 className="h-5 w-5" />
											Organization
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="orgName">Name</Label>
											<Input
												id="orgName"
												value={orgName}
												onChange={(e) => setOrgName(e.target.value)}
											/>
										</div>
										<Button
											size="sm"
											onClick={handleSaveOrg}
											disabled={savingOrg || orgName === selectedOrg.name}
										>
											{savingOrg ? (
												<>
													<Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
													Saving...
												</>
											) : orgSaved ? (
												<>
													<Check className="mr-2 h-3.5 w-3.5" />
													Saved
												</>
											) : (
												'Save'
											)}
										</Button>

										{selectedOrg.invite_code && (
											<>
												<Separator />
												<div className="space-y-2">
													<Label className="text-xs text-muted-foreground">Invite Code</Label>
													<div className="flex items-center gap-2">
														<code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono truncate">
															{selectedOrg.invite_code}
														</code>
														<Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={handleCopyInviteCode}>
															{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
														</Button>
													</div>
												</div>
											</>
										)}

										<Separator />
										<div className="text-xs text-muted-foreground">
											<span className="font-medium">Slug:</span> {selectedOrg.slug}
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Right: Members */}
							<div className="lg:col-span-2">
								<Card className="border-border/50">
									<CardHeader>
										<div className="flex items-center justify-between">
											<div>
												<CardTitle className="flex items-center gap-2 text-lg">
													<Users className="h-5 w-5" />
													Team Members
												</CardTitle>
												<CardDescription>
													{members.length} member{members.length !== 1 ? 's' : ''}
												</CardDescription>
											</div>
											<Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
												<DialogTrigger asChild>
													<Button size="sm">
														<UserPlus className="mr-2 h-4 w-4" />
														Invite
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Invite a team member</DialogTitle>
														<DialogDescription>
															Send an invitation to join this organization.
														</DialogDescription>
													</DialogHeader>
													<div className="space-y-4 py-2">
														<div className="space-y-2">
															<Label htmlFor="invite-email">Email address</Label>
															<Input
																id="invite-email"
																type="email"
																placeholder="colleague@company.com"
																value={inviteEmail}
																onChange={(e) => setInviteEmail(e.target.value)}
															/>
														</div>
														{roles.length > 0 && (
															<div className="space-y-2">
																<Label>Role</Label>
																<Select value={inviteRole} onValueChange={setInviteRole}>
																	<SelectTrigger>
																		<SelectValue placeholder="Select a role" />
																	</SelectTrigger>
																	<SelectContent>
																		{roles.filter((r) => r.name?.toLowerCase() !== 'owner').map((role) => (
																			<SelectItem key={role.id} value={role.id}>
																				{role.name}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</div>
														)}
													</div>
													<DialogFooter>
														<Button variant="outline" onClick={() => setInviteOpen(false)}>
															Cancel
														</Button>
														<Button onClick={handleInviteMember} disabled={inviting || !inviteEmail}>
															{inviting ? (
																<>
																	<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																	Inviting...
																</>
															) : (
																<>
																	<Mail className="mr-2 h-4 w-4" />
																	Send Invite
																</>
															)}
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										</div>
									</CardHeader>
									<CardContent>
										{membersLoading ? (
											<div className="flex justify-center py-8">
												<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
											</div>
										) : members.length === 0 ? (
											<div className="flex flex-col items-center justify-center py-12 text-center">
												<Users className="h-10 w-10 text-muted-foreground/40" />
												<p className="mt-3 text-sm text-muted-foreground">
													No members found. Invite someone to get started.
												</p>
											</div>
										) : (
											<div className="space-y-2">
												{members.map((member) => (
													<div
														key={member.id}
														className="flex items-center justify-between rounded-lg border border-border/50 p-3"
													>
														<div className="flex items-center gap-3 min-w-0">
															<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
																{member.user?.name?.charAt(0)?.toUpperCase() || member.user?.email?.charAt(0)?.toUpperCase() || '?'}
															</div>
															<div className="min-w-0">
																<p className="text-sm font-medium truncate">
																	{member.user?.name || member.user?.email || 'Unknown'}
																	{member.user?.id === user?.id && (
																		<span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
																	)}
																</p>
																<p className="text-xs text-muted-foreground truncate">{member.user?.email}</p>
															</div>
														</div>
														<div className="flex items-center gap-2 shrink-0">
															<Badge variant="secondary" className="text-xs gap-1">
																{getRoleIcon(member.role?.name)}
																{member.role?.name || 'No role'}
															</Badge>
															{member.user?.id !== user?.id && (
																<DropdownMenu>
																	<DropdownMenuTrigger asChild>
																		<Button variant="ghost" size="icon" className="h-8 w-8">
																			<MoreHorizontal className="h-4 w-4" />
																		</Button>
																	</DropdownMenuTrigger>
																	<DropdownMenuContent align="end">
																		{roles
																			.filter((r) => r.id !== member.role?.id && r.name?.toLowerCase() !== 'owner')
																			.map((role) => (
																				<DropdownMenuItem
																					key={role.id}
																					onClick={() => handleUpdateMemberRole(member.id, role.id)}
																				>
																					Change to {role.name}
																				</DropdownMenuItem>
																			))}
																		<DropdownMenuItem
																			className="text-destructive focus:text-destructive"
																			onClick={() => handleRemoveMember(member.id)}
																		>
																			<Trash2 className="mr-2 h-3.5 w-3.5" />
																			Remove
																		</DropdownMenuItem>
																	</DropdownMenuContent>
																</DropdownMenu>
															)}
														</div>
													</div>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				) : (
					<Card className="border-border/50">
						<CardContent className="flex flex-col items-center justify-center py-16 text-center">
							<Building2 className="h-12 w-12 text-muted-foreground/40" />
							<h2 className="mt-4 text-lg font-semibold">No organization yet</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Create or join an organization to get started.
							</p>
							<Button className="mt-6" asChild>
								<Link href="/onboarding">
									<Plus className="mr-2 h-4 w-4" />
									Set Up Organization
								</Link>
							</Button>
						</CardContent>
					</Card>
				)}
			</main>
		</div>
	);
}
