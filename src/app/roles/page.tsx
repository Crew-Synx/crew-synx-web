'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	Dialog, DialogContent, DialogDescription, DialogFooter,
	DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Shield, Trash2, ArrowLeft, Pencil } from 'lucide-react';
import type { Organization, Role, AccessLevel } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, RoleSchema } from '@/lib/schemas';

// ─── Level config ────────────────────────────────────────────────────────────

const LEVELS: { value: AccessLevel; label: string; desc: string; badge: string }[] = [
	{ value: 'admin', label: 'Admin', desc: 'Full control — create, edit, delete, manage', badge: 'bg-violet-100 text-violet-700' },
	{ value: 'write', label: 'Write', desc: 'Can create and edit', badge: 'bg-blue-100 text-blue-700' },
	{ value: 'read', label: 'Read', desc: 'Can view only', badge: 'bg-emerald-100 text-emerald-700' },
	{ value: 'hide', label: 'Hide', desc: 'No access — section hidden', badge: 'bg-gray-100 text-gray-500' },
];

function levelBadge(level: AccessLevel) {
	const cfg = LEVELS.find(l => l.value === level) ?? LEVELS[3];
	return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>;
}

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

// ─── Access summary for the roles table ──────────────────────────────────────

function RoleAccessSummary({ role }: { role: Role }) {
	const modules = Object.values(role.access ?? {});
	if (modules.length === 0) return <span className="text-muted-foreground text-sm">No access set</span>;

	const counts = { admin: 0, write: 0, read: 0, hide: 0 } as Record<AccessLevel, number>;
	modules.forEach(m => { counts[m.level] = (counts[m.level] ?? 0) + 1; });

	return (
		<div className="flex flex-wrap gap-1">
			{(Object.entries(counts) as [AccessLevel, number][])
				.filter(([, n]) => n > 0)
				.map(([level, count]) => {
					const cfg = LEVELS.find(l => l.value === level)!;
					return (
						<span key={level} className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
							{count} {cfg.label}
						</span>
					);
				})}
		</div>
	);
}

// ─── Edit dialog: module access table ────────────────────────────────────────

function AccessTable({
	access,
	onChange,
	disabled,
}: {
	access: Record<string, { level: AccessLevel; label: string }>;
	onChange: (module: string, level: AccessLevel) => void;
	disabled?: boolean;
}) {
	const modules = Object.entries(access);
	if (modules.length === 0) return null;

	return (
		<div className="rounded-md border overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40">
						<TableHead className="w-36">Module</TableHead>
						{LEVELS.map(l => (
							<TableHead key={l.value} className="text-center w-20 px-1">
								<div className="font-semibold">{l.label}</div>
								<div className="text-[10px] text-muted-foreground font-normal leading-tight hidden sm:block">{l.desc}</div>
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{modules.map(([key, mod]) => (
						<TableRow key={key}>
							<TableCell className="font-medium text-sm py-2.5">{mod.label}</TableCell>
							{LEVELS.map(l => (
								<TableCell key={l.value} className="text-center px-1 py-2.5">
									<input
										type="radio"
										name={`access-${key}`}
										value={l.value}
										checked={mod.level === l.value}
										onChange={() => onChange(key, l.value)}
										disabled={disabled}
										className="accent-violet-600 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
									/>
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

// ─── Main page ────────────────────────────────────────────────────────────────

function RolesInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const returnUrl = searchParams.get('return');

	const [org, setOrg] = useState<Organization | null>(null);
	const [roles, setRoles] = useState<Role[]>([]);
	const [loading, setLoading] = useState(true);

	// Create dialog
	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [newRoleName, setNewRoleName] = useState('');

	// Edit dialog
	const [editRole, setEditRole] = useState<Role | null>(null);
	const [editName, setEditName] = useState('');
	const [editAccess, setEditAccess] = useState<Record<string, { level: AccessLevel; label: string }>>({});
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
		loadRoles(o.id).finally(() => setLoading(false));
		if (returnUrl) setCreateOpen(true);
	}, [router, returnUrl]);

	async function loadRoles(orgId: string) {
		const res = await apiFetch(`/roles/`, { orgId });
		if (res.ok) {
			const data = await res.json().catch(() => ({ data: [] }));
			setRoles(parseListResponse(RoleSchema, data));
		}
	}

	async function handleCreate() {
		if (!org || !newRoleName.trim()) return;
		setCreating(true);
		try {
			const res = await apiFetch(`/roles/`, {
				method: 'POST',
				orgId: org.id,
				body: JSON.stringify({ name: newRoleName.trim() }),
			});
			if (res.ok) {
				const json = await res.json().catch(() => ({}));
				const created = json.data || json;
				setCreateOpen(false);
				setNewRoleName('');
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
		// Deep-copy access so changes don't mutate the list
		setEditAccess(JSON.parse(JSON.stringify(role.access ?? {})));
	}

	function handleAccessChange(module: string, level: AccessLevel) {
		setEditAccess(prev => ({
			...prev,
			[module]: { ...prev[module], level },
		}));
	}

	async function handleSave() {
		if (!org || !editRole) return;
		setSaving(true);
		try {
			// Build simplified access payload {module: level}
			const accessPayload: Record<string, AccessLevel> = {};
			Object.entries(editAccess).forEach(([k, v]) => { accessPayload[k] = v.level; });

			const body: Record<string, unknown> = { access: accessPayload };
			if (editName.trim() && editName.trim() !== editRole.name) {
				body.name = editName.trim();
			}

			const res = await apiFetch(`/roles/${editRole.id}/`, {
				method: 'PATCH',
				orgId: org.id,
				body: JSON.stringify(body),
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
		if (!org || !confirm('Delete this role? Members assigned to it will have no role until reassigned.')) return;
		await apiFetch(`/roles/${roleId}/`, { method: 'DELETE', orgId: org.id });
		await loadRoles(org.id);
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-5xl p-6 space-y-6">

				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="icon" asChild>
							<Link href={returnUrl ?? '/dashboard'}><ArrowLeft className="h-4 w-4" /></Link>
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Roles & Access</h1>
							<p className="text-sm text-muted-foreground">Control what each role can see and do</p>
						</div>
					</div>

					{/* Create Role */}
					<Dialog open={createOpen} onOpenChange={setCreateOpen}>
						<DialogTrigger asChild>
							<Button><Plus className="mr-2 h-4 w-4" />New Role</Button>
						</DialogTrigger>
						<DialogContent className="max-w-sm">
							<DialogHeader>
								<DialogTitle>Create New Role</DialogTitle>
								<DialogDescription>Give it a name. You can set access levels after.</DialogDescription>
							</DialogHeader>
							<div className="py-4">
								<Label>Role Name</Label>
								<Input
									value={newRoleName}
									onChange={e => setNewRoleName(e.target.value)}
									placeholder="e.g. Team Lead"
									autoFocus
									className="mt-1"
									onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
								/>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
								<Button onClick={handleCreate} disabled={creating || !newRoleName.trim()}>
									{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Create
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{/* Level legend */}
				<div className="flex flex-wrap gap-3 text-sm">
					{LEVELS.map(l => (
						<span key={l.value} className="flex items-center gap-1.5">
							<span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${l.badge}`}>{l.label}</span>
							<span className="text-muted-foreground">{l.desc}</span>
						</span>
					))}
				</div>

				{/* Roles list */}
				{roles.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<Shield className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="font-semibold text-lg">No roles yet</h3>
							<p className="text-sm text-muted-foreground mt-1">Create a role to assign to team members.</p>
						</CardContent>
					</Card>
				) : (
					<Card>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Role</TableHead>
									<TableHead>Access Summary</TableHead>
									<TableHead className="w-24 text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{roles.map(role => (
									<TableRow key={role.id}>
										<TableCell>
											<div className="font-medium">{role.name}</div>
											{role.name === 'Owner' && (
												<div className="text-xs text-muted-foreground">Full access — cannot be edited</div>
											)}
										</TableCell>
										<TableCell><RoleAccessSummary role={role} /></TableCell>
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
						<DialogTitle>Edit Role</DialogTitle>
						<DialogDescription>
							Set what this role can do in each area. Changes apply to all members with this role.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-5 py-2">
						{/* Role name */}
						<div>
							<Label>Role Name</Label>
							<Input
								value={editName}
								onChange={e => setEditName(e.target.value)}
								disabled={editRole?.name === 'Owner'}
								className="mt-1"
							/>
						</div>

						{/* Access table */}
						{Object.keys(editAccess).length > 0 && (
							<div>
								<Label className="mb-3 block">Module Access</Label>
								<AccessTable
									access={editAccess}
									onChange={handleAccessChange}
									disabled={editRole?.name === 'Owner'}
								/>
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
