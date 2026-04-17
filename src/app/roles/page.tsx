'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog, DialogContent, DialogDescription, DialogFooter,
	DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Plus, Shield, Trash2, ArrowLeft } from 'lucide-react';
import type { Organization, Role } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, RoleSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

function RolesInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const returnUrl = searchParams.get('return');

	const [org, setOrg] = useState<Organization | null>(null);
	const [roles, setRoles] = useState<Role[]>([]);
	const [loading, setLoading] = useState(true);

	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [form, setForm] = useState({ name: '' });

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
		loadRoles(o.id);
		if (returnUrl) setCreateOpen(true);
	}, [router, returnUrl]);

	async function loadRoles(orgId: string) {
		setLoading(true);
		try {
			const res = await apiFetch(`/roles/`, { orgId });
			if (res.ok) {
				const data = await res.json().catch(() => ({ data: [] }));
				setRoles(parseListResponse(RoleSchema, data));
			}
		} finally {
			setLoading(false);
		}
	}

	async function handleCreate() {
		if (!org || !form.name.trim()) return;
		setCreating(true);
		try {
			const res = await apiFetch(`/roles/`, {
				method: 'POST',
				orgId: org.id,
				body: JSON.stringify(form),
			});
			if (res.ok) {
				const json = await res.json().catch(() => ({}));
				const created = json.data || json;
				setCreateOpen(false);
				setForm({ name: '' });
				if (returnUrl) {
					router.push(`${returnUrl}?reload=role&newId=${created.id}`);
				} else {
					loadRoles(org.id);
				}
			}
		} finally {
			setCreating(false);
		}
	}

	async function handleDelete(roleId: string) {
		if (!org || !confirm('Delete this role?')) return;
		await apiFetch(`/roles/${roleId}/`, { method: 'DELETE', orgId: org.id });
		loadRoles(org.id);
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
			<div className="mx-auto max-w-6xl p-6 space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="icon" asChild>
							<Link href={returnUrl ?? '/dashboard'}><ArrowLeft className="h-4 w-4" /></Link>
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Roles</h1>
							<p className="text-sm text-muted-foreground">Manage employee roles in your organization</p>
						</div>
					</div>
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
										value={form.name}
										onChange={e => setForm({ name: e.target.value })}
										placeholder="e.g. Team Lead"
										autoFocus
										onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
								<Button onClick={handleCreate} disabled={creating || !form.name.trim()}>
									{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Create Role
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{roles.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<Shield className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="font-semibold text-lg">No roles yet</h3>
							<p className="text-sm text-muted-foreground mt-1">
								Create roles to assign to employees.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{roles.map(role => (
							<Card key={role.id}>
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<CardTitle className="text-lg">{role.name}</CardTitle>
										<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(role.id)}>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="text-sm text-muted-foreground">
									Priority: {role.priority}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
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
