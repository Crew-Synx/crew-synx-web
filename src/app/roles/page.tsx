'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
	Dialog, DialogContent, DialogDescription, DialogFooter,
	DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Shield, Trash2, ArrowLeft, Pencil } from 'lucide-react';
import type { Organization, Role, Permission } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, RoleSchema, PermissionSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

// Group permission keys by their prefix (e.g. "employees.view" → "employees")
function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
	const groups: Record<string, Permission[]> = {};
	for (const perm of permissions) {
		const group = perm.key.split('.')[0] ?? 'other';
		(groups[group] ??= []).push(perm);
	}
	return groups;
}

function RolesInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const returnUrl = searchParams.get('return');

	const [org, setOrg] = useState<Organization | null>(null);
	const [roles, setRoles] = useState<Role[]>([]);
	const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
	const [loading, setLoading] = useState(true);

	// Create dialog
	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [createForm, setCreateForm] = useState({ name: '' });

	// Edit dialog
	const [editRole, setEditRole] = useState<Role | null>(null);
	const [editName, setEditName] = useState('');
	const [editPerms, setEditPerms] = useState<Set<string>>(new Set());
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
		Promise.all([loadRoles(o.id), loadPermissions()]).finally(() => setLoading(false));
		if (returnUrl) setCreateOpen(true);
	}, [router, returnUrl]);

	async function loadRoles(orgId: string) {
		const res = await apiFetch(`/roles/`, { orgId });
		if (res.ok) {
			const data = await res.json().catch(() => ({ data: [] }));
			setRoles(parseListResponse(RoleSchema, data));
		}
	}

	async function loadPermissions() {
		const res = await apiFetch(`/roles/permissions/`);
		if (res.ok) {
			const data = await res.json().catch(() => ({ data: [] }));
			setAllPermissions(parseListResponse(PermissionSchema, data));
		}
	}

	async function handleCreate() {
		if (!org || !createForm.name.trim()) return;
		setCreating(true);
		try {
			const res = await apiFetch(`/roles/`, {
				method: 'POST',
				orgId: org.id,
				body: JSON.stringify({ name: createForm.name }),
			});
			if (res.ok) {
				const json = await res.json().catch(() => ({}));
				const created = json.data || json;
				setCreateOpen(false);
				setCreateForm({ name: '' });
				if (returnUrl) {
					router.push(`${returnUrl}?reload=role&newId=${created.id}`);
				} else {
					await loadRoles(org.id);
				}
			}
		} finally {
			setCreating(false);
		}
	}

	function openEdit(role: Role) {
		setEditRole(role);
		setEditName(role.name);
		setEditPerms(new Set(role.permissions));
	}

	async function handleSave() {
		if (!org || !editRole) return;
		setSaving(true);
		try {
			// Update name if changed
			if (editName.trim() && editName.trim() !== editRole.name) {
				await apiFetch(`/roles/${editRole.id}/`, {
					method: 'PATCH',
					orgId: org.id,
					body: JSON.stringify({ name: editName.trim() }),
				});
			}
			// Update permissions
			const res = await apiFetch(`/roles/${editRole.id}/`, {
				method: 'PATCH',
				orgId: org.id,
				body: JSON.stringify({ permissions: Array.from(editPerms) }),
			});
			if (res.ok) {
				setEditRole(null);
				await loadRoles(org.id);
			}
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(roleId: string) {
		if (!org || !confirm('Delete this role?')) return;
		await apiFetch(`/roles/${roleId}/`, { method: 'DELETE', orgId: org.id });
		await loadRoles(org.id);
	}

	function togglePerm(key: string) {
		setEditPerms(prev => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key); else next.add(key);
			return next;
		});
	}

	function toggleGroup(keys: string[], allChecked: boolean) {
		setEditPerms(prev => {
			const next = new Set(prev);
			if (allChecked) keys.forEach(k => next.delete(k));
			else keys.forEach(k => next.add(k));
			return next;
		});
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const permGroups = groupPermissions(allPermissions);

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-6xl p-6 space-y-6">

				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="icon" asChild>
							<Link href={returnUrl ?? '/dashboard'}><ArrowLeft className="h-4 w-4" /></Link>
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Roles</h1>
							<p className="text-sm text-muted-foreground">Manage employee roles and their permissions</p>
						</div>
					</div>

					{/* Create Role Dialog */}
					<Dialog open={createOpen} onOpenChange={setCreateOpen}>
						<DialogTrigger asChild>
							<Button><Plus className="mr-2 h-4 w-4" />Add Role</Button>
						</DialogTrigger>
						<DialogContent className="max-w-sm">
							<DialogHeader>
								<DialogTitle>Create New Role</DialogTitle>
								<DialogDescription>Add a new role for employees in your organization.</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div>
									<Label>Role Name *</Label>
									<Input
										value={createForm.name}
										onChange={e => setCreateForm({ name: e.target.value })}
										placeholder="e.g. Team Lead"
										autoFocus
										onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
								<Button onClick={handleCreate} disabled={creating || !createForm.name.trim()}>
									{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Create Role
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{/* Roles Table */}
				{roles.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<Shield className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="font-semibold text-lg">No roles yet</h3>
							<p className="text-sm text-muted-foreground mt-1">Create roles to assign to employees.</p>
						</CardContent>
					</Card>
				) : (
					<Card>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Role Name</TableHead>
									<TableHead className="w-24 text-center">Priority</TableHead>
									<TableHead>Permissions</TableHead>
									<TableHead className="w-24 text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{roles.map(role => (
									<TableRow key={role.id}>
										<TableCell className="font-medium">{role.name}</TableCell>
										<TableCell className="text-center text-muted-foreground">{role.priority}</TableCell>
										<TableCell>
											{role.permissions.length === 0 ? (
												<span className="text-muted-foreground text-sm">No permissions</span>
											) : (
												<div className="flex flex-wrap gap-1">
													{role.permissions.slice(0, 5).map(p => (
														<Badge key={p} variant="secondary" className="text-xs font-mono">{p}</Badge>
													))}
													{role.permissions.length > 5 && (
														<Badge variant="outline" className="text-xs">+{role.permissions.length - 5} more</Badge>
													)}
												</div>
											)}
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-1">
												<Button
													variant="ghost" size="icon" className="h-8 w-8"
													onClick={() => openEdit(role)}
													title="Edit role"
												>
													<Pencil className="h-4 w-4" />
												</Button>
												{role.name !== 'Owner' && (
													<Button
														variant="ghost" size="icon" className="h-8 w-8"
														onClick={() => handleDelete(role.id)}
														title="Delete role"
													>
														<Trash2 className="h-4 w-4 text-destructive" />
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Card>
				)}
			</div>

			{/* Edit Role Dialog */}
			<Dialog open={!!editRole} onOpenChange={open => { if (!open) setEditRole(null); }}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Edit Role: {editRole?.name}</DialogTitle>
						<DialogDescription>Update the role name and assign permissions.</DialogDescription>
					</DialogHeader>

					<div className="space-y-5 py-2">
						{/* Name field — disabled for Owner */}
						<div>
							<Label>Role Name</Label>
							<Input
								value={editName}
								onChange={e => setEditName(e.target.value)}
								disabled={editRole?.name === 'Owner'}
								className="mt-1"
							/>
						</div>

						{/* Permissions */}
						{allPermissions.length > 0 && (
							<div>
								<Label className="mb-3 block">Permissions</Label>
								<div className="space-y-4">
									{Object.entries(permGroups).sort().map(([group, perms]) => {
										const keys = perms.map(p => p.key);
										const allChecked = keys.every(k => editPerms.has(k));
										const someChecked = keys.some(k => editPerms.has(k));
										return (
											<div key={group} className="rounded-md border p-3 space-y-2">
												<div className="flex items-center gap-2">
													<Checkbox
														id={`group-${group}`}
														checked={allChecked}
														data-state={someChecked && !allChecked ? 'indeterminate' : undefined}
														onCheckedChange={() => toggleGroup(keys, allChecked)}
														disabled={editRole?.name === 'Owner'}
													/>
													<label
														htmlFor={`group-${group}`}
														className="text-sm font-semibold capitalize cursor-pointer select-none"
													>
														{group.replace(/_/g, ' ')}
													</label>
												</div>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
													{perms.map(perm => (
														<div key={perm.key} className="flex items-start gap-2">
															<Checkbox
																id={perm.key}
																checked={editPerms.has(perm.key)}
																onCheckedChange={() => togglePerm(perm.key)}
																disabled={editRole?.name === 'Owner'}
																className="mt-0.5"
															/>
															<label
																htmlFor={perm.key}
																className="text-sm cursor-pointer select-none leading-tight"
															>
																<span className="font-mono text-xs text-muted-foreground block">{perm.key}</span>
																{perm.description && (
																	<span className="text-muted-foreground">{perm.description}</span>
																)}
															</label>
														</div>
													))}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setEditRole(null)}>Cancel</Button>
						<Button onClick={handleSave} disabled={saving || editRole?.name === 'Owner'}>
							{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default function RolesPage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		}>
			<RolesInner />
		</Suspense>
	);
}
