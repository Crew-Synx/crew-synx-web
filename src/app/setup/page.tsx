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
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
	Loader2, Shield, Building2, Layers, Briefcase,
	Plus, Trash2, Check, ArrowRight, Rocket, Copy,
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
	permissions?: string[];
}

interface RoleTemplate {
	name: string;
	description: string;
	priority: number;
	permissions: string[];
	already_applied: boolean;
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
	department: string | null;
	department_name: string | null;
}

/* ─── Steps ──────────────────────────────────────────────────────── */

const STEPS = [
	{ key: 'roles', label: 'Roles', icon: Shield, description: 'Pick role templates', optional: false },
	{ key: 'branches', label: 'Branches', icon: Building2, description: 'Add office locations', optional: true },
	{ key: 'departments', label: 'Departments', icon: Layers, description: 'Create departments', optional: false },
	{ key: 'designations', label: 'Job Roles', icon: Briefcase, description: 'Define job roles', optional: false },
] as const;

type StepKey = typeof STEPS[number]['key'];

/* ─── Main Page ──────────────────────────────────────────────────── */

export default function SetupPage() {
	const router = useRouter();
	const [org, setOrg] = useState<Organization | null>(null);
	const [loading, setLoading] = useState(true);
	const [initError, setInitError] = useState<string | null>(null);
	const [currentStep, setCurrentStep] = useState(0);

	// Data for each step
	const [roles, setRoles] = useState<RoleItem[]>([]);
	const [templates, setTemplates] = useState<RoleTemplate[]>([]);
	const [branches, setBranches] = useState<BranchItem[]>([]);
	const [departments, setDepartments] = useState<DepartmentItem[]>([]);
	const [designations, setDesignations] = useState<DesignationItem[]>([]);

	const loadAllData = useCallback(async (orgId: string) => {
		const [rolesRes, templatesRes, branchRes, deptRes, desigRes] = await Promise.all([
			apiFetch('/roles/', { orgId }).catch(() => null),
			apiFetch('/roles/templates/', { orgId }).catch(() => null),
			apiFetch(`/organizations/${orgId}/branches/`, { orgId }).catch(() => null),
			apiFetch(`/organizations/${orgId}/departments/`, { orgId }).catch(() => null),
			apiFetch(`/organizations/${orgId}/designations/`, { orgId }).catch(() => null),
		]);

		if (rolesRes?.ok) { const d = await rolesRes.json().catch(() => ({})); setRoles(d.data || []); }
		if (templatesRes?.ok) { const d = await templatesRes.json().catch(() => ({})); setTemplates(d.data || []); }
		if (branchRes?.ok) { const d = await branchRes.json().catch(() => ({})); setBranches(d.data || []); }
		if (deptRes?.ok) { const d = await deptRes.json().catch(() => ({})); setDepartments(d.data || []); }
		if (desigRes?.ok) { const d = await desigRes.json().catch(() => ({})); setDesignations(d.data || []); }
	}, []);

	useEffect(() => {
		const init = async () => {
			try {
				const res = await apiFetch('/organizations/');
				if (!res.ok) { router.push('/auth/login'); return; }
				const data = await res.json().catch(() => ({}));
				let orgList = data.data || [];

				// Fallback: if API returned empty but we just created an org,
				// use the locally stored org to avoid redirect loop
				if (orgList.length === 0) {
					const cached = localStorage.getItem('selected_org');
					if (cached) {
						try { orgList = [JSON.parse(cached)]; } catch { /* ignore */ }
					}
				}

				if (orgList.length === 0) { router.push('/onboarding'); return; }
				const o = orgList[0];
				setOrg(o);
				localStorage.setItem('selected_org', JSON.stringify(o));
				await loadAllData(o.id);
			} catch (err: unknown) {
				setInitError(err instanceof Error ? err.message : 'Failed to load setup data');
				router.push('/auth/login');
			} finally {
				setLoading(false);
			}
		};
		init();
	}, [router, loadAllData]);

	const reloadStep = useCallback(async (step: StepKey) => {
		if (!org) return;
		const orgId = org.id;
		switch (step) {
			case 'roles': {
				const [r, t] = await Promise.all([
					apiFetch('/roles/', { orgId }),
					apiFetch('/roles/templates/', { orgId }),
				]);
				if (r.ok) { const d = await r.json().catch(() => ({})); setRoles(d.data || []); }
				if (t.ok) { const d = await t.json().catch(() => ({})); setTemplates(d.data || []); }
				break;
			}
			case 'branches': {
				const r = await apiFetch(`/organizations/${orgId}/branches/`, { orgId });
				if (r.ok) { const d = await r.json().catch(() => ({})); setBranches(d.data || []); }
				break;
			}
			case 'departments': {
				const r = await apiFetch(`/organizations/${orgId}/departments/`, { orgId });
				if (r.ok) { const d = await r.json().catch(() => ({})); setDepartments(d.data || []); }
				break;
			}
			case 'designations': {
				const [r, dept] = await Promise.all([
					apiFetch(`/organizations/${orgId}/designations/`, { orgId }),
					apiFetch(`/organizations/${orgId}/departments/`, { orgId }),
				]);
				if (r.ok) { const d = await r.json().catch(() => ({})); setDesignations(d.data || []); }
				if (dept.ok) { const d = await dept.json().catch(() => ({})); setDepartments(d.data || []); }
				break;
			}
		}
	}, [org]);

	const canProceed = () => {
		const step = STEPS[currentStep];
		if (step.key === 'departments') return departments.length > 0;
		return true;
	};

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

	if (!org) {
		if (initError) {
			return (
				<div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
					<p className="text-destructive font-semibold">{initError}</p>
					<Button onClick={() => router.push('/auth/login')}>Back to Login</Button>
				</div>
			);
		}
		return null;
	}

	const step = STEPS[currentStep];
	const isLastStep = currentStep === STEPS.length - 1;

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-2xl px-5 py-10 space-y-8">
				{/* Header */}
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Set up {org.name}</h1>
					<p className="text-sm text-muted-foreground">Configure your workspace — takes about 2 minutes</p>
				</div>

				{/* Step indicator — simple numbered dots */}
				<div className="flex items-center gap-3">
					{STEPS.map((s, i) => {
						const done = i < currentStep;
						const active = i === currentStep;
						return (
							<div key={s.key} className="flex items-center gap-3">
								<button
									onClick={() => setCurrentStep(i)}
									className="flex items-center gap-2 group"
								>
									<div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${done
										? 'bg-primary text-primary-foreground'
										: active
											? 'border-2 border-primary text-primary'
											: 'border border-muted-foreground/30 text-muted-foreground'
										}`}>
										{done ? <Check className="h-3 w-3" /> : i + 1}
									</div>
									<span className={`text-sm font-medium hidden sm:inline ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
										{s.label}
										{s.optional && <span className="ml-1 text-xs opacity-50">optional</span>}
									</span>
								</button>
								{i < STEPS.length - 1 && (
									<div className={`h-px w-6 transition-colors ${done ? 'bg-primary' : 'bg-border'}`} />
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
								templates={templates}
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
								departments={departments}
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
						<Button onClick={goNext} disabled={!canProceed()}>
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

function RolesStep({ orgId, roles, templates, onReload }: {
	orgId: string; roles: RoleItem[]; templates: RoleTemplate[]; onReload: () => void;
}) {
	const [applying, setApplying] = useState<string | null>(null);
	const [creating, setCreating] = useState(false);
	const [newRole, setNewRole] = useState('');
	const [saving, setSaving] = useState(false);
	const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

	const handleApplyTemplate = async (templateName: string) => {
		setApplying(templateName);
		try {
			const res = await apiFetch('/roles/templates/apply/', {
				method: 'POST', orgId,
				body: JSON.stringify({ template: templateName }),
			});
			if (res.ok) onReload();
		} finally {
			setApplying(null);
		}
	};

	const handleCreateCustom = async () => {
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
		setDeletingRoleId(roleId);
		try {
			await apiFetch(`/roles/${roleId}/`, { method: 'DELETE', orgId });
			onReload();
		} finally {
			setDeletingRoleId(null);
		}
	};

	const nonOwnerRoles = roles.filter(r => r.name !== 'Owner');

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold flex items-center gap-2">
					<Shield className="h-5 w-5 text-primary" />
					Roles
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Pick from templates below or create your own. Templates are copied into your org — you can rename or edit them later.
				</p>
			</div>

			{/* Role Templates */}
			<div>
				<p className="text-sm font-medium mb-3">Templates</p>
				{templates.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-6 rounded-lg border border-dashed border-border/50 text-center gap-3">
						<p className="text-sm text-muted-foreground">Templates could not be loaded.</p>
						<Button variant="outline" size="sm" onClick={onReload}>
							<Loader2 className="mr-2 h-3.5 w-3.5" /> Retry
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{templates.map(t => {
							const applied = t.already_applied || nonOwnerRoles.some(r => r.name === t.name);
							return (
								<div
									key={t.name}
									className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${applied
										? 'bg-primary/5 border-primary/20'
										: 'bg-muted/30 border-border/50 hover:border-border'
										}`}
								>
									<div className="flex-1 min-w-0 mr-3">
										<p className="font-medium text-sm">{t.name}</p>
										<p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
									</div>
									{applied ? (
										<Badge variant="secondary" className="shrink-0 text-xs gap-1">
											<Check className="h-3 w-3" /> Added
										</Badge>
									) : (
										<Button
											size="sm"
											variant="outline"
											className="shrink-0"
											disabled={applying === t.name}
											onClick={() => handleApplyTemplate(t.name)}
										>
											{applying === t.name ? (
												<Loader2 className="h-3.5 w-3.5 animate-spin" />
											) : (
												<>
													<Copy className="mr-1.5 h-3.5 w-3.5" />
													Use
												</>
											)}
										</Button>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Applied roles list */}
			{nonOwnerRoles.length > 0 && (
				<div>
					<p className="text-sm font-medium mb-3">Your Roles</p>
					<div className="flex flex-wrap gap-2">
						{roles.map(role => {
							const isOwner = role.name === 'Owner';
							return (
								<div key={role.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${isOwner ? 'bg-primary/5 border-primary/20 text-primary' : 'border-border'
									}`}>
									<span className="font-medium">{role.name}</span>
									{isOwner && <span className="text-xs opacity-60">you</span>}
									{!isOwner && (
										<button
											type="button"
											onClick={() => handleDelete(role.id)}
											disabled={deletingRoleId === role.id}
											className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
										>
											{deletingRoleId === role.id
												? <Loader2 className="h-3 w-3 animate-spin" />
												: <span className="text-xs leading-none">&times;</span>
											}
										</button>
									)}
								</div>
							);
						})}
					</div>
					<p className="text-xs text-muted-foreground mt-2">You can edit role permissions from Settings after setup.</p>
				</div>
			)}

			{/* Add custom role */}
			{creating ? (
				<div className="flex items-center gap-2">
					<Input
						placeholder="Custom role name"
						value={newRole}
						onChange={e => setNewRole(e.target.value)}
						onKeyDown={e => e.key === 'Enter' && handleCreateCustom()}
						autoFocus
					/>
					<Button onClick={handleCreateCustom} disabled={saving || !newRole.trim()}>
						{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
					</Button>
					<Button variant="ghost" onClick={() => { setCreating(false); setNewRole(''); }}>
						Cancel
					</Button>
				</div>
			) : (
				<Button variant="outline" onClick={() => setCreating(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Create Custom Role
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
					<Badge variant="secondary" className="text-xs">Optional</Badge>
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Add office locations if your company has multiple branches. The branch code is used in auto-generated employee IDs (e.g. 001-BLR). You can skip this and add branches later.
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
					Add Branch
				</Button>
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
					<Badge variant="destructive" className="text-xs">Required</Badge>
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Create at least one department. Job roles will be organized under departments in the next step.
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

			{departments.length === 0 && !creating && (
				<p className="text-sm text-amber-600 dark:text-amber-400">
					You need at least one department to proceed.
				</p>
			)}
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════════
	 STEP 4 — JOB ROLES / DESIGNATIONS (per department)
	 ═══════════════════════════════════════════════════════════════════ */

function DesignationsStep({ orgId, departments, designations, onReload }: {
	orgId: string;
	departments: DepartmentItem[];
	designations: DesignationItem[];
	onReload: () => void;
}) {
	const [creating, setCreating] = useState(designations.length === 0);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({ title: '', level: '1', department: '' });

	const handleCreate = async () => {
		if (!form.title || !form.department) return;
		setSaving(true);
		try {
			const res = await apiFetch(`/organizations/${orgId}/designations/`, {
				method: 'POST', orgId,
				body: JSON.stringify({
					title: form.title,
					level: parseInt(form.level) || 1,
					department: form.department,
				}),
			});
			if (res.ok) {
				setForm({ title: '', level: '1', department: form.department });
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

	// Group designations by department
	const grouped = departments.map(dept => ({
		department: dept,
		roles: designations.filter(d => d.department === dept.id),
	}));
	const unassigned = designations.filter(d => !d.department);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold flex items-center gap-2">
					<Briefcase className="h-5 w-5 text-primary" />
					Job Roles
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Define job roles within each department (e.g. Software Engineer under Engineering, HR Manager under Human Resources).
				</p>
			</div>

			{/* Grouped display */}
			{grouped.map(g => (
				<div key={g.department.id} className="space-y-2">
					<p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
						<Layers className="h-3.5 w-3.5" />
						{g.department.name}
						{g.department.code && (
							<Badge variant="secondary" className="font-mono text-xs">{g.department.code}</Badge>
						)}
					</p>
					{g.roles.length > 0 ? (
						<div className="ml-5 space-y-1">
							{g.roles.map(d => (
								<div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-lg border">
									<div className="flex items-center gap-3">
										<div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
											L{d.level}
										</div>
										<p className="text-sm font-medium">{d.title}</p>
									</div>
									<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(d.id)}>
										<Trash2 className="h-3 w-3 text-destructive" />
									</Button>
								</div>
							))}
						</div>
					) : (
						<p className="ml-5 text-xs text-muted-foreground italic">No job roles yet</p>
					)}
				</div>
			))}

			{/* Unassigned designations (legacy) */}
			{unassigned.length > 0 && (
				<div className="space-y-2">
					<p className="text-sm font-semibold text-muted-foreground">Unassigned</p>
					<div className="ml-5 space-y-1">
						{unassigned.map(d => (
							<div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-lg border">
								<div className="flex items-center gap-3">
									<div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
										L{d.level}
									</div>
									<p className="text-sm font-medium">{d.title}</p>
								</div>
								<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(d.id)}>
									<Trash2 className="h-3 w-3 text-destructive" />
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Create form */}
			{creating ? (
				<div className="space-y-3 p-4 rounded-lg border bg-muted/30">
					<div className="grid grid-cols-2 gap-3">
						<div>
							<Label>Department *</Label>
							<Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
								<SelectTrigger>
									<SelectValue placeholder="Select department" />
								</SelectTrigger>
								<SelectContent>
									{departments.map(d => (
										<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Job Role Title *</Label>
							<Input
								value={form.title}
								onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
								placeholder="e.g. Software Engineer"
								onKeyDown={e => e.key === 'Enter' && handleCreate()}
								autoFocus
							/>
						</div>
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
					<div className="flex gap-2">
						<Button onClick={handleCreate} disabled={saving || !form.title || !form.department}>
							{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
						</Button>
						{designations.length > 0 && (
							<Button variant="ghost" onClick={() => { setCreating(false); setForm({ title: '', level: '1', department: '' }); }}>
								Cancel
							</Button>
						)}
					</div>
				</div>
			) : (
				<Button variant="outline" onClick={() => setCreating(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Add Job Role
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
