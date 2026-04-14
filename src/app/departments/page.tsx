'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
	Loader2, Plus, Layers, Trash2, ArrowLeft, Users,
} from 'lucide-react';
import type { Department, Organization } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, DepartmentSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

export default function DepartmentsPage() {
	const router = useRouter();
	const [org, setOrg] = useState<Organization | null>(null);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);

	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [form, setForm] = useState({ name: '', code: '' });

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
		loadDepartments(o.id);
	}, [router]);

	async function loadDepartments(orgId: string) {
		setLoading(true);
		try {
			const res = await apiFetch(`/organizations/${orgId}/departments/`, { orgId });
			if (res.ok) {
				const data = await res.json().catch(() => ({ data: [] }));
				setDepartments(parseListResponse(DepartmentSchema, data));
			}
		} finally {
			setLoading(false);
		}
	}

	async function handleCreate() {
		if (!org || !form.name) return;
		setCreating(true);
		try {
			const res = await apiFetch(`/organizations/${org.id}/departments/`, {
				method: 'POST', orgId: org.id,
				body: JSON.stringify(form),
			});
			if (res.ok) {
				setCreateOpen(false);
				setForm({ name: '', code: '' });
				loadDepartments(org.id);
			}
		} finally {
			setCreating(false);
		}
	}

	async function handleDelete(deptId: string) {
		if (!org || !confirm('Delete this department?')) return;
		await apiFetch(`/organizations/${org.id}/departments/${deptId}/`, {
			method: 'DELETE', orgId: org.id,
		});
		loadDepartments(org.id);
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
							<Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Departments</h1>
							<p className="text-sm text-muted-foreground">
								Manage organizational departments
							</p>
						</div>
					</div>
					<Dialog open={createOpen} onOpenChange={setCreateOpen}>
						<DialogTrigger asChild>
							<Button><Plus className="mr-2 h-4 w-4" />Add Department</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Create Department</DialogTitle>
								<DialogDescription>
									Add a new department to the organization.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div>
									<Label>Department Name *</Label>
									<Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Engineering" />
								</div>
								<div>
									<Label>Code</Label>
									<Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. ENG" maxLength={10} />
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
								<Button onClick={handleCreate} disabled={creating || !form.name}>
									{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Create
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{departments.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<Layers className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="font-semibold text-lg">No departments yet</h3>
							<p className="text-sm text-muted-foreground mt-1">Create departments to organize your employees.</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{departments.map(dept => (
							<Card key={dept.id}>
								<CardHeader className="pb-2">
									<div className="flex items-start justify-between">
										<div>
											<CardTitle className="text-lg">{dept.name}</CardTitle>
											{dept.code && <Badge variant="secondary" className="mt-1 font-mono">{dept.code}</Badge>}
										</div>
										<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(dept.id)}>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									</div>
								</CardHeader>
								<CardContent className="space-y-2 text-sm">
									{dept.head_name && (
										<p className="text-muted-foreground">Head: {dept.head_name}</p>
									)}
									<div className="flex items-center gap-2 text-muted-foreground">
										<Users className="h-3.5 w-3.5" />
										{dept.employee_count} employees
									</div>
									{!dept.is_active && <Badge variant="destructive">Inactive</Badge>}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
