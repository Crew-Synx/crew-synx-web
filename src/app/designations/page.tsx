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
import { Loader2, Plus, Award, Trash2, ArrowLeft } from 'lucide-react';
import type { Organization, Designation } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, DesignationSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

function DesignationsInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const returnUrl = searchParams.get('return');

	const [org, setOrg] = useState<Organization | null>(null);
	const [designations, setDesignations] = useState<Designation[]>([]);
	const [loading, setLoading] = useState(true);

	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [form, setForm] = useState({ title: '' });

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
		loadDesignations(o.id);
		if (returnUrl) setCreateOpen(true);
	}, [router, returnUrl]);

	async function loadDesignations(orgId: string) {
		setLoading(true);
		try {
			const res = await apiFetch(`/organizations/${orgId}/designations/`, { orgId });
			if (res.ok) {
				const data = await res.json().catch(() => ({ data: [] }));
				setDesignations(parseListResponse(DesignationSchema, data));
			}
		} finally {
			setLoading(false);
		}
	}

	async function handleCreate() {
		if (!org || !form.title.trim()) return;
		setCreating(true);
		try {
			const res = await apiFetch(`/organizations/${org.id}/designations/`, {
				method: 'POST',
				orgId: org.id,
				body: JSON.stringify(form),
			});
			if (res.ok) {
				const json = await res.json().catch(() => ({}));
				const created = json.data || json;
				setCreateOpen(false);
				setForm({ title: '' });
				if (returnUrl) {
					router.push(`${returnUrl}?reload=designation&newId=${created.id}`);
				} else {
					loadDesignations(org.id);
				}
			}
		} finally {
			setCreating(false);
		}
	}

	async function handleDelete(desId: string) {
		if (!org || !confirm('Delete this designation?')) return;
		await apiFetch(`/organizations/${org.id}/designations/${desId}/`, {
			method: 'DELETE', orgId: org.id,
		});
		loadDesignations(org.id);
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
							<h1 className="text-2xl font-bold">Designations</h1>
							<p className="text-sm text-muted-foreground">Manage employee job designations</p>
						</div>
					</div>
					<Dialog open={createOpen} onOpenChange={setCreateOpen}>
						<DialogTrigger asChild>
							<Button><Plus className="mr-2 h-4 w-4" />Add Designation</Button>
						</DialogTrigger>
						<DialogContent className="max-w-sm">
							<DialogHeader>
								<DialogTitle>Create New Designation</DialogTitle>
								<DialogDescription>Add a job designation for employees.</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div>
									<Label>Title *</Label>
									<Input
										value={form.title}
										onChange={e => setForm({ title: e.target.value })}
										placeholder="e.g. Senior Engineer"
										autoFocus
										onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
									/>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
								<Button onClick={handleCreate} disabled={creating || !form.title.trim()}>
									{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Create
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{designations.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<Award className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="font-semibold text-lg">No designations yet</h3>
							<p className="text-sm text-muted-foreground mt-1">
								Create designations to assign to employees.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{designations.map(d => (
							<Card key={d.id}>
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg">{d.title}</CardTitle>
											{d.level > 0 && (
												<Badge variant="secondary" className="mt-1">Level {d.level}</Badge>
											)}
										</div>
										<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(d.id)}>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								</CardHeader>
								{!d.is_active && (
									<CardContent>
										<Badge variant="destructive">Inactive</Badge>
									</CardContent>
								)}
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default function DesignationsPage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		}>
			<DesignationsInner />
		</Suspense>
	);
}
