'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/components/app-shell';
import {
	Loader2,
	Users,
	Plus,
	Building2,
	UserPlus,
	Trash2,
	Shield,
	Crown,
	MoreHorizontal,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { apiFetch } from '@/lib/api';
import {
	parseListResponse, MemberSchema, RoleSchema,
} from '@/lib/schemas';

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
	priority: number;
	is_system?: boolean;
	permissions: string[];
}

function getRoleIcon(roleName?: string) {
	if (roleName?.toLowerCase() === 'owner') return <Crown className="h-3 w-3 text-yellow-500" />;
	if (roleName?.toLowerCase() === 'admin') return <Shield className="h-3 w-3 text-blue-500" />;
	return null;
}

export default function DashboardPage() {
	const { user, selectedOrg } = useAppContext();
	const [members, setMembers] = useState<Member[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);
	const [membersLoading, setMembersLoading] = useState(false);

	// Error / action states
	const [actionError, setActionError] = useState<string | null>(null);
	const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

	const router = useRouter();

	const fetchMembers = useCallback(async (orgId: string) => {
		setMembersLoading(true);
		try {
			const [membersRes, rolesRes] = await Promise.all([
				apiFetch(`/organizations/${orgId}/members/`, { orgId }),
				apiFetch(`/roles/`, { orgId }),
			]);
			if (membersRes.ok) {
				const data = await membersRes.json().catch(() => ({ data: [] }));
				setMembers(parseListResponse(MemberSchema, data) as Member[]);
			}
			if (rolesRes.ok) {
				const data = await rolesRes.json().catch(() => ({ data: [] }));
				setRoles(parseListResponse(RoleSchema, data) as Role[]);
			}
		} catch {
			setActionError('Failed to load team members');
		} finally {
			setMembersLoading(false);
		}
	}, []);

	// First-time setup redirect
	useEffect(() => {
		if (!selectedOrg) return;
		if (!localStorage.getItem('setup_complete')) {
			router.push('/setup');
		}
	}, [selectedOrg?.id, router]);

	useEffect(() => {
		if (selectedOrg) {
			fetchMembers(selectedOrg.id);
		}
	}, [selectedOrg?.id, fetchMembers]);

	const handleRemoveMember = async (memberId: string) => {
		if (!selectedOrg) return;
		setActionError(null);
		try {
			const res = await apiFetch(`/organizations/${selectedOrg.id}/members/${memberId}/`, {
				method: 'DELETE',
				orgId: selectedOrg.id,
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data?.error ?? data?.detail ?? 'Failed to remove member');
			}
			fetchMembers(selectedOrg.id);
		} catch (err: unknown) {
			setActionError(err instanceof Error ? err.message : 'Failed to remove member');
		}
	};

	const handleUpdateMemberRole = async (memberId: string, roleId: string) => {
		if (!selectedOrg) return;
		setRoleUpdating(memberId);
		try {
			await apiFetch(`/organizations/${selectedOrg.id}/members/${memberId}/`, {
				method: 'PATCH',
				orgId: selectedOrg.id,
				body: JSON.stringify({ role_id: roleId }),
			});
			fetchMembers(selectedOrg.id);
		} catch (err: unknown) {
			setActionError(err instanceof Error ? err.message : 'Failed to update role');
		} finally {
			setRoleUpdating(null);
		}
	};

	return (
		<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
			{/* Welcome */}
			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
					Welcome back{user?.name ? `, ${user.name}` : ''}
				</h1>
				<p className="mt-1 text-muted-foreground">
					Manage your organization and team members.
				</p>
			</div>

			{selectedOrg ? (
				<div>
					{/* Team members */}
					<div>
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
									<Button size="sm" asChild>
										<Link href="/employees/new">
											<UserPlus className="mr-2 h-4 w-4" />
											Add Employee
										</Link>
									</Button>
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
											No members yet. Add employees to your organization to start
											collaborating.
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
														{member.user?.name?.charAt(0)?.toUpperCase() ||
															member.user?.email?.charAt(0)?.toUpperCase() ||
															'?'}
													</div>
													<div className="min-w-0">
														<p className="text-sm font-medium truncate">
															{member.user?.name || member.user?.email || 'Unknown'}
															{member.user?.id === user?.id && (
																<span className="ml-1.5 text-xs text-muted-foreground">
																	(you)
																</span>
															)}
														</p>
														<p className="text-xs text-muted-foreground truncate">
															{member.user?.email}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-2 shrink-0">
													{roleUpdating === member.id ? (
														<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
													) : (
														<Badge variant="secondary" className="text-xs gap-1">
															{getRoleIcon(member.role?.name)}
															{member.role?.name || 'No role'}
														</Badge>
													)}
													{member.user?.id !== user?.id &&
														member.role?.name?.toLowerCase() !== 'owner' && (
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button variant="ghost" size="icon" className="h-8 w-8">
																		<MoreHorizontal className="h-4 w-4" />
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	{roles
																		.filter(
																			(r) =>
																				r.id !== member.role?.id &&
																				r.name?.toLowerCase() !== 'owner'
																		)
																		.map((role) => (
																			<DropdownMenuItem
																				key={role.id}
																				onClick={() =>
																					handleUpdateMemberRole(member.id, role.id)
																				}
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
			) : (
				<Card className="border-border/50">
					<CardContent className="flex flex-col items-center justify-center py-16 text-center">
						<Building2 className="h-12 w-12 text-muted-foreground/40" />
						<h2 className="mt-4 text-lg font-semibold">No organization yet</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Create an organization to get started.
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
		</div>
	);
}
