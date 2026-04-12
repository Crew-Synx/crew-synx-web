'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Loader2, Shield, Building2, Layers, Briefcase,
	Plus, Trash2, Check, ChevronRight, ArrowRight, Rocket,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

/* ─── Types ──────────────────────────────────────────────────────── */

interface Organization {
	id: string;
	name: string;
	slug: string;
}

interface RoleItem {
	id: string;
	name: string;
	priority: number;
}

interface BranchItem {
	id: string;
	name: string;
	code: string;
	city?: string;
	state?: string;
	country?: string;
	is_head_office: boolean;
}

interface DepartmentItem {
	id: string;
	name: string;
	code?: string;
}

interface DesignationItem {
	id: string;
	title: string;
	level: number;
}

/* ─── Steps ──────────────────────────────────────────────────────── */

const STEPS = [
	{ key: 'roles', label: 'Roles', icon: Shield, description: 'Review & customize roles' },
	{ key: 'branches', label: 'Branches', icon: Building2, description: 'Add office locations' },
	{ key: 'departments', label: 'Departments', icon: Layers, description: 'Create departments' },
	{ key: 'designations', label: 'Designations', icon: Briefcase, description: 'Define designations' },
] as const;

type StepKey = typeof STEPS[number]['key'];

/* ─── Main Page ──────────────────────────────────────────────────── */

export default function SetupPage() {
	const router = useRouter();
	const [org, setOrg] = useState<Organization | null>(null);
	const [loading, setLoading] = useState(true);
	const [currentStep, setCurrentStep] = useState(0);

	// Data for each step
	const [roles, setRoles] = useState<RoleItem[]>([]);
	const [branches, setBranches] = useState<BranchItem[]>([]);
	const [departments, setDepartments] = useState<DepartmentItem[]>([]);
	const [designations, setDesignations] = useState<DesignationItem[]>([]);

	useEffect(() => {
		const init = async () => {
			const token = localStorage.getItem('access_token');
			if (!token) { router.push('/auth/login'); return; }

			try {
				const res = await apiFetch('/organizations/');
				if (!res.ok) { router.push('/auth/login'); return; }
				const data = await res.json();
				const orgList = data.data || [];
				if (orgList.length === 0) { router.push('/onboarding'); return; }
				const o = orgList[0];
				setOrg(o);
				localStorage.setItem('selected_org', JSON.stringify(o));
				await loadAllData(o.id);
			} catch {
				router.push('/auth/login');
			} finally {
				setLoading(false);
			}
		};
		init();
	}, [router]);

	const loadAllData = async (orgId: string) => {
		const [rolesRes, branchRes, deptRes, desigRes] = await Promise.all([
			apiFetch('/roles/', { orgId }),
			apiFetch(`/organizations/${orgId}/branches/`, { orgId }),
			apiFetch(`/organizations/${orgId}/departments/`, { orgId }),
			apiFetch(`/organizations/${orgId}/designations/`, { orgId }),
		]);

		if (rolesRes.ok) { const d = await rolesRes.json(); setRoles(d.data || []); }
		if (branchRes.ok) { const d = await branchRes.json(); setBranches(d.data || []); }
		if (deptRes.ok) { const d = await deptRes.json(); setDepartments(d.data || []); }
		if (desigRes.ok) { const d = await desigRes.json(); setDesignations(d.data || []); }
	};

	const reloadStep = useCallback(async (step: StepKey) => {
		if (!org) return;
		const orgId = org.id;
		switch (step) {
			case 'roles': {
				const r = await apiFetch('/roles/', { orgId });
				if (r.ok) { const d = await r.json(); setRoles(d.data || []); }
				break;
			}
			case 'branches': {
				const r = await apiFetch(`/organizations/${orgId}/branches/`, { orgId });
				if (r.ok) { const d = await r.json(); setBranches(d.data || []); }
				break;
			}
			case 'departments': {
				const r = await apiFetch(`/organizations/${orgId}/departments/`, { orgId });
				if (r.ok) { const d = await r.json(); setDepartments(d.data || []); }
				break;
			}
			case 'designations': {
				const r = await apiFetch(`/organizations/${orgId}/designations/`, { orgId });
				if (r.ok) { const d = await r.json(); setDesignations(d.data || []); }
				break;
			}
		}
	}, [org]);

	const goNext = () => {
		if (currentStep < STEPS.length - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			localStorage.setItem('setup_complete', 'true');
			router.push('/dashboard');
		}
	};

	const goBack = () => {
		if (currentStep > 0) setCurrentStep(currentStep - 1);
	};

	const finishSetup = () => {
		localStorage.setItem('setup_complete', 'true');
		router.push('/dashboard');
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!org) return null;

	const step = STEPS[currentStep];
	const isLastStep = currentStep === STEPS.length - 1;

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-4xl p-6 space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold">Set up {org.name}</h1>
					<p className="text-muted-foreground">
						Configure your organization before adding employees
					</p>
				</div>

				{/* Step indicator */}
				<div className="flex items-center justify-center gap-2">
					{STEPS.map((s, i) => {
						const Icon = s.icon;
						const done = i < currentStep;
						const active = i === currentStep;
						return (
							<div key={s.key} className="flex items-center gap-2">
								<button
									onClick={() => setCurrentStep(i)}
									className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
											? 'bg-primary text-primary-foreground'
											: done
												? 'bg-primary/10 text-primary'
												: 'bg-muted text-muted-foreground'
										}`}
								>
									{done ? (
										<Check className="h-4 w-4" />
									) : (
										<Icon className="h-4 w-4" />
									)}
									<span className="hidden sm:inline">{s.label}</span>
								</button>
								{i < STEPS.length - 1 && (
									<ChevronRight className="h-4 w-4 text-muted-foreground" />
								)}
							</div>
						);
					})}
				</div>

				{/* Step content */}
				<Card>
					<CardContent className="p-6">
						{step.key === 'roles' && (
							<RolesStep
								orgId={org.id}
								roles={roles}
								onReload={() => reloadStep('roles')}
							/>
						)}
						{step.key === 'branches' && (
							<BranchesStep
								orgId={org.id}
								branches={branches}
								onReload={() => reloadStep('branches')}
							/>
						)}
						{step.key === 'departments' && (
							<DepartmentsStep
								orgId={org.id}
								departments={departments}
								onReload={() => reloadStep('departments')}
							/>
						)}
						{step.key === 'designations' && (
							<DesignationsStep
								orgId={org.id}
								designations={designations}
								onReload={() => reloadStep('designations')}
							/>
						)}
					</CardContent>
				</Card>

				{/* Navigation */}
				<div className="flex items-center justify-between">
					<div>
						{currentStep > 0 ? (
							<Button variant="outline" onClick={goBack}>Back</Button>
						) : (
							<Button variant="ghost" onClick={finishSetup} className="text-muted-foreground">
								Skip setup
							</Button>
						)}
					</div>
					<div className="flex items-center gap-3">
						{!isLastStep && (
							<Button variant="ghost" onClick={finishSetup} className="text-muted-foreground">
								Skip to dashboard
							</Button>
						)}
						<Button onClick={goNext}>
							{isLastStep ? (
								<>
									<Rocket className="mr-2 h-4 w-4" />
									Go to Dashboard
								</>
							) : (
								<>
									Next
									<ArrowRight className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════════
	 STEP 1 — ROLES
	 ═══════════════════════════════════════════════════════════════════ */

function RolesStep({ orgId, roles, onReload }: {
	orgId: string; roles: RoleItem[]; onReload: () => void;
}) {
	const [creating, setCreating] = useState(false);
	const [newRole, setNewRole] = useState('');
	const [saving, setSaving] = useState(false);

	const handleCreate = async () => {
		if (!newRole.trim()) return;
		setSaving(true);
		try {
			const res = await apiFetch('/roles/', {
				method: 'POST', orgId,
				body: JSON.stringify({ name: newRole.trim() }),
			});
			if (res.ok) {
				setNewRole('');
				setCreating(false);
				onReload();
			}
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (roleId: string) => {
		await apiFetch(`/roles/${roleId}/`, { method: 'DELETE', orgId });
		onReload();
	};

	const systemRoles = ['Owner', 'Admin', 'Manager', 'Developer', 'Viewer'];

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold flex items-center gap-2">
					<Shield className="h-5 w-5 text-primary" />
					Roles
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Your organization comes with default roles. You can add custom roles for your team.
				</p>
			</div>

			<div className="space-y-2">
				{roles.map(role => {
					const isSystem = systemRoles.includes(role.name);
					return (
						<div key={role.id} className="flex items-center justify-between py-3 px-4 rounded-lg border">
							<div className="flex items-center gap-3">
								<div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${isSystem ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
									}`}>
									{role.priority}
								</div>
								<div>
									<p className="font-medium">{role.name}</p>
									{isSystem && (
										<p className="text-xs text-muted-foreground">System role</p>
									)}
								</div>
							</div>
							{!isSystem && (
								<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(role.id)}>
									<Trash2 className="h-4 w-4 text-destructive" />
								</Button>
							)}
						</div>
					);
				})}
			</div>

			{creating ? (
				<div className="flex items-center gap-2">
					<Input
						placeholder="Role name"
						value={newRole}
						onChange={e => setNewRole(e.target.value)}
						onKeyDown={e => e.key === 'Enter' && handleCreate()}
						autoFocus
					/>
					<Button onClick={handleCreate} disabled={saving || !newRole.trim()}>
						{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
					</Button>
					<Button variant="ghost" onClick={() => { setCreating(false); setNewRole(''); }}>
						Cancel
					</Button>
				</div>
			) : (
				<Button variant="outline" onClick={() => setCreating(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Custom Role
				</Button>
			)}
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════════
	 STEP 2 — BRANCHES
	 ═══════════════════════════════════════════════════════════════════ */

function BranchesStep({ orgId, branches, onReload }: {
	orgId: string; branches: BranchItem[]; onReload: () => void;
}) {
	const [creating, setCreating] = useState(branches.length === 0);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		name: '', code: '', city: '', state: '', country: '',
		phone: '', email: '', is_head_office: true,
	});

	const resetForm = () => {
		setForm({ name: '', code: '', city: '', state: '', country: '', phone: '', email: '', is_head_office: false });
	};

	const handleCreate = async () => {
		if (!form.name || !form.code) return;
		setSaving(true);
		try {
			const res = await apiFetch(`/organizations/${orgId}/branches/`, {
				method: 'POST', orgId,
				body: JSON.stringify(form),
			});
			if (res.ok) {
				resetForm();
				setCreating(false);
				onReload();
			}
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		await apiFetch(`/organizations/${orgId}/branches/${id}/`, { method: 'DELETE', orgId });
		onReload();
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold flex items-center gap-2">
					<Building2 className="h-5 w-5 text-primary" />
					Branches
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Add at least one branch. The branch code is used in auto-generated employee IDs (e.g. 001-BLR).
				</p>
			</div>

			{branches.length > 0 && (
				<div className="space-y-2">
					{branches.map(b => (
						<div key={b.id} className="flex items-center justify-between py-3 px-4 rounded-lg border">
							<div className="flex items-center gap-3">
								<Building2 className="h-5 w-5 text-muted-foreground" />
								<div>
									<p className="font-medium">
										{b.name}
										{b.is_head_office && (
											<Badge variant="default" className="ml-2 text-xs">HQ</Badge>
										)}
									</p>
									<p className="text-xs text-muted-foreground">
										<span className="font-mono">{b.code}</span>
										{b.city && ` · ${[b.city, b.state, b.country].filter(Boolean).join(', ')}`}
									</p>
								</div>
							</div>
							<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(b.id)}>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</div>
					))}
				</div>
			)}

			{creating ? (
				<div className="space-y-4 p-4 rounded-lg border bg-muted/30">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label>Branch Name *</Label>
							<Input
								value={form.name}
								onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
								placeholder="e.g. Bangalore HQ"
							/>
						</div>
						<div>
							<Label>Branch Code *</Label>
							<Input
								value={form.code}
								onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
								placeholder="e.g. BLR"
								maxLength={10}
							/>
							<p className="text-xs text-muted-foreground mt-1">Used in employee IDs</p>
						</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div>
							<Label>City</Label>
							<Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
						</div>
						<div>
							<Label>State</Label>
							<Input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
						</div>
						<div>
							<Label>Country</Label>
							<Input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
						</div>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							checked={form.is_head_office}
							onCheckedChange={(v) => setForm(f => ({ ...f, is_head_office: !!v }))}
						/>
						<Label>This is the head office</Label>
					</div>
					<div className="flex gap-2">
						<Button onClick={handleCreate} disabled={saving || !form.name || !form.code}>
							{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
							Add Branch
						</Button>
						{branches.length > 0 && (
							<Button variant="ghost" onClick={() => { setCreating(false); resetForm(); }}>Cancel</Button>
						)}
					</div>
				</div>
			) : (
				<Button variant="outline" onClick={() => setCreating(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Another Branch
				</Button>
			)}

			{branches.length === 0 && !creating && (
				<p className="text-sm text-amber-600 dark:text-amber-400">
					⚠ You need at least one branch to create employee profiles.
				</p>
			)}
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════════
	 STEP 3 — DEPARTMENTS
	 ═══════════════════════════════════════════════════════════════════ */

function DepartmentsStep({ orgId, departments, onReload }: {
	orgId: string; departments: DepartmentItem[]; onReload: () => void;
}) {
	const [creating, setCreating] = useState(departments.length === 0);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({ name: '', code: '' });

	const handleCreate = async () => {
		if (!form.name) return;
		setSaving(true);
		try {
			const body: Record<string, string> = { name: form.name };
			if (form.code) body.code = form.code;
			const res = await apiFetch(`/organizations/${orgId}/departments/`, {
				method: 'POST', orgId,
				body: JSON.stringify(body),
			});
			if (res.ok) {
				setForm({ name: '', code: '' });
				setCreating(false);
				onReload();
			}
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		await apiFetch(`/organizations/${orgId}/departments/${id}/`, { method: 'DELETE', orgId });
		onReload();
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold flex items-center gap-2">
					<Layers className="h-5 w-5 text-primary" />
					Departments
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Create departments to organize your employees (e.g. Engineering, Marketing, HR).
				</p>
			</div>

			{departments.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{departments.map(d => (
						<div key={d.id} className="flex items-center gap-2 py-2 px-3 rounded-lg border">
							<span className="font-medium">{d.name}</span>
							{d.code && <Badge variant="secondary" className="font-mono text-xs">{d.code}</Badge>}
							<Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(d.id)}>
								<Trash2 className="h-3 w-3 text-destructive" />
							</Button>
						</div>
					))}
				</div>
			)}

			{creating ? (
				<div className="flex items-end gap-3 p-4 rounded-lg border bg-muted/30">
					<div className="flex-1">
						<Label>Department Name *</Label>
						<Input
							value={form.name}
							onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
							placeholder="e.g. Engineering"
							onKeyDown={e => e.key === 'Enter' && handleCreate()}
							autoFocus
						/>
					</div>
					<div className="w-32">
						<Label>Code</Label>
						<Input
							value={form.code}
							onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
							placeholder="ENG"
							maxLength={10}
						/>
					</div>
					<Button onClick={handleCreate} disabled={saving || !form.name}>
						{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
					</Button>
					{departments.length > 0 && (
						<Button variant="ghost" onClick={() => { setCreating(false); setForm({ name: '', code: '' }); }}>
							Cancel
						</Button>
					)}
				</div>
			) : (
				<Button variant="outline" onClick={() => setCreating(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Department
				</Button>
			)}
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════════
	 STEP 4 — DESIGNATIONS
	 ═══════════════════════════════════════════════════════════════════ */

function DesignationsStep({ orgId, designations, onReload }: {
	orgId: string; designations: DesignationItem[]; onReload: () => void;
}) {
	const [creating, setCreating] = useState(designations.length === 0);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({ title: '', level: '1' });

	const handleCreate = async () => {
		if (!form.title) return;
		setSaving(true);
		try {
			const res = await apiFetch(`/organizations/${orgId}/designations/`, {
				method: 'POST', orgId,
				body: JSON.stringify({ title: form.title, level: parseInt(form.level) || 1 }),
			});
			if (res.ok) {
				setForm({ title: '', level: '1' });
				setCreating(false);
				onReload();
			}
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (id: string) => {
		await apiFetch(`/organizations/${orgId}/designations/${id}/`, { method: 'DELETE', orgId });
		onReload();
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold flex items-center gap-2">
					<Briefcase className="h-5 w-5 text-primary" />
					Designations
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Define job titles/designations for employees (e.g. Software Engineer, HR Manager, CEO).
				</p>
			</div>

			{designations.length > 0 && (
				<div className="space-y-2">
					{designations.map(d => (
						<div key={d.id} className="flex items-center justify-between py-3 px-4 rounded-lg border">
							<div className="flex items-center gap-3">
								<div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
									L{d.level}
								</div>
								<p className="font-medium">{d.title}</p>
							</div>
							<Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(d.id)}>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</div>
					))}
				</div>
			)}

			{creating ? (
				<div className="flex items-end gap-3 p-4 rounded-lg border bg-muted/30">
					<div className="flex-1">
						<Label>Title *</Label>
						<Input
							value={form.title}
							onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
							placeholder="e.g. Software Engineer"
							onKeyDown={e => e.key === 'Enter' && handleCreate()}
							autoFocus
						/>
					</div>
					<div className="w-24">
						<Label>Level</Label>
						<Input
							type="number"
							min="1"
							value={form.level}
							onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
						/>
					</div>
					<Button onClick={handleCreate} disabled={saving || !form.title}>
						{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
					</Button>
					{designations.length > 0 && (
						<Button variant="ghost" onClick={() => { setCreating(false); setForm({ title: '', level: '1' }); }}>
							Cancel
						</Button>
					)}
				</div>
			) : (
				<Button variant="outline" onClick={() => setCreating(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Designation
				</Button>
			)}

			{/* Completion message on last step */}
			{designations.length > 0 && (
				<div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
					<p className="text-sm text-green-700 dark:text-green-400 font-medium flex items-center gap-2">
						<Check className="h-4 w-4" />
						You&apos;re all set! Click &quot;Go to Dashboard&quot; to start adding employees.
					</p>
				</div>
			)}
		</div>
	);
}
