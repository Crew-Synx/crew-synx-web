'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	Dialog, DialogContent, DialogDescription, DialogFooter,
	DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Loader2, Plus, Building2, MapPin, Users, Trash2, Pencil, ArrowLeft,
} from 'lucide-react';
import type { Branch, Organization } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, BranchSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

function BranchesInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const returnUrl = searchParams.get('return');
	const [org, setOrg] = useState<Organization | null>(null);
	const [branches, setBranches] = useState<Branch[]>([]);
	const [loading, setLoading] = useState(true);

	// Create dialog
	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [form, setForm] = useState({
		name: '', code: '', city: '', state: '', country: '',
		phone: '', email: '', is_head_office: false,
	});

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
		loadBranches(o.id);
		if (returnUrl) setCreateOpen(true);
	}, [router, returnUrl]);

	async function loadBranches(orgId: string) {
		setLoading(true);
		try {
			const res = await apiFetch(`/organizations/${orgId}/branches/`, { orgId });
			if (res.ok) {
				const data = await res.json().catch(() => ({ data: [] }));
				setBranches(parseListResponse(BranchSchema, data));
			}
		} finally {
			setLoading(false);
		}
	}

	async function handleCreate() {
		if (!org || !form.name || !form.code) return;
		setCreating(true);
		try {
			const res = await apiFetch(`/organizations/${org.id}/branches/`, {
				method: 'POST',
				orgId: org.id,
				body: JSON.stringify(form),
			});
			if (res.ok) {
				const json = await res.json().catch(() => ({}));
				const created = json.data || json;
				setCreateOpen(false);
				setForm({ name: '', code: '', city: '', state: '', country: '', phone: '', email: '', is_head_office: false });
				if (returnUrl) {
					router.push(`${returnUrl}?reload=branch&newId=${created.id}`);
				} else {
					loadBranches(org.id);
				}
			}
		} finally {
			setCreating(false);
		}
	}

	async function handleDelete(branchId: string) {
		if (!org || !confirm('Delete this branch?')) return;
		await apiFetch(`/organizations/${org.id}/branches/${branchId}/`, {
			method: 'DELETE', orgId: org.id,
		});
		loadBranches(org.id);
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
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="icon" asChild>
							<Link href={returnUrl ?? '/dashboard'}><ArrowLeft className="h-4 w-4" /></Link>
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Branches</h1>
							<p className="text-sm text-muted-foreground">
								Manage company branches and offices
							</p>
						</div>
					</div>
					<Dialog open={createOpen} onOpenChange={setCreateOpen}>
						<DialogTrigger asChild>
							<Button><Plus className="mr-2 h-4 w-4" />Add Branch</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Create New Branch</DialogTitle>
								<DialogDescription>
									Add a new office or branch location.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Branch Name *</Label>
										<Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Bangalore HQ" />
									</div>
									<div>
										<Label>Branch Code *</Label>
										<Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. BLR" maxLength={10} />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>City</Label>
										<Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
									</div>
									<div>
										<Label>State</Label>
										<Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Country</Label>
										<Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
									</div>
									<div>
										<Label>Phone</Label>
										<Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
									</div>
								</div>
								<div>
									<Label>Email</Label>
									<Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox checked={form.is_head_office} onCheckedChange={(v) => setForm(f => ({ ...f, is_head_office: !!v }))} />
									<Label>This is the head office</Label>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
								<Button onClick={handleCreate} disabled={creating || !form.name || !form.code}>
									{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Create Branch
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{/* Branch cards */}
				{branches.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<Building2 className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="font-semibold text-lg">No branches yet</h3>
							<p className="text-sm text-muted-foreground mt-1">
								Create your first branch to start assigning employees.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{branches.map(branch => (
							<Card key={branch.id} className="relative">
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg">{branch.name}</CardTitle>
											<Badge variant="secondary" className="mt-1 font-mono">
												{branch.code}
											</Badge>
										</div>
										<div className="flex gap-1">
											{branch.is_head_office && (
												<Badge variant="default">HQ</Badge>
											)}
											<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(branch.id)}>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-2 text-sm">
									{(branch.city || branch.country) && (
										<div className="flex items-center gap-2 text-muted-foreground">
											<MapPin className="h-3.5 w-3.5" />
											{[branch.city, branch.state, branch.country].filter(Boolean).join(', ')}
										</div>
									)}
									<div className="flex items-center gap-2 text-muted-foreground">
										<Users className="h-3.5 w-3.5" />
										{branch.employee_count} employees
									</div>
									{!branch.is_active && (
										<Badge variant="destructive">Inactive</Badge>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default function BranchesPage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		}>
			<BranchesInner />
		</Suspense>
	);
}
