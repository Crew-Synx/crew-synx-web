'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
	Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Plus, Check } from 'lucide-react';
import type { Organization, Branch, Department, Designation, Role } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, BranchSchema, DepartmentSchema, DesignationSchema, RoleSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

const EMPLOYMENT_TYPES = [
	{ value: 'full_time', label: 'Full Time' },
	{ value: 'part_time', label: 'Part Time' },
	{ value: 'contract', label: 'Contract' },
	{ value: 'intern', label: 'Intern' },
	{ value: 'freelance', label: 'Freelance' },
];

export default function OnboardEmployeePage() {
	const router = useRouter();
	const [org, setOrg] = useState<Organization | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [step, setStep] = useState(0);
	const [error, setError] = useState('');

	const [branches, setBranches] = useState<Branch[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [designations, setDesignations] = useState<Designation[]>([]);
	const [roles, setRoles] = useState<Role[]>([]);

	const [modal, setModal] = useState<'role' | 'branch' | 'department' | 'designation' | null>(null);
	const [modalSubmitting, setModalSubmitting] = useState(false);
	const [modalError, setModalError] = useState('');
	const [modalForm, setModalForm] = useState<Record<string, string>>({});

	const openModal = (type: typeof modal) => {
		setModal(type);
		setModalForm({});
		setModalError('');
	};

	async function handleModalCreate() {
		if (!org || !modal) return;
		setModalSubmitting(true);
		setModalError('');
		try {
			let url = '';
			let body: Record<string, unknown> = {};
			switch (modal) {
				case 'role': url = `/roles/`; body = { name: modalForm.name }; break;
				case 'branch': url = `/organizations/${org.id}/branches/`; body = { name: modalForm.name, code: modalForm.code?.toUpperCase() }; break;
				case 'department': url = `/organizations/${org.id}/departments/`; body = { name: modalForm.name }; break;
				case 'designation': url = `/organizations/${org.id}/designations/`; body = { title: modalForm.title }; break;
			}
			const res = await apiFetch(url, { method: 'POST', orgId: org.id, body: JSON.stringify(body) });
			const json = await res.json().catch(() => ({}));
			if (res.ok) {
				const created = json.data || json;
				switch (modal) {
					case 'role': setRoles(prev => [...prev, created]); set('role', created.id); break;
					case 'branch': setBranches(prev => [...prev, created]); set('branch', created.id); break;
					case 'department': setDepartments(prev => [...prev, created]); set('department', created.id); break;
					case 'designation': setDesignations(prev => [...prev, created]); set('designation', created.id); break;
				}
				setModal(null);
			} else {
				setModalError(json.error || json.message || json.detail || JSON.stringify(json.errors || json));
			}
		} finally {
			setModalSubmitting(false);
		}
	}

	const [form, setForm] = useState({
		email: '', first_name: '', last_name: '',
		role: '', branch: '', department: '', designation: '',
		employment_type: 'full_time', joining_date: '',
	});

	const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
		loadLookups(o.id);
	}, [router]);

	async function loadLookups(orgId: string) {
		setLoading(true);
		try {
			const [brRes, deptRes, desRes, roleRes] = await Promise.all([
				apiFetch(`/organizations/${orgId}/branches/`, { orgId }),
				apiFetch(`/organizations/${orgId}/departments/`, { orgId }),
				apiFetch(`/organizations/${orgId}/designations/`, { orgId }),
				apiFetch(`/roles/`, { orgId }),
			]);
			if (brRes.ok) setBranches(parseListResponse(BranchSchema, await brRes.json().catch(() => ({ data: [] }))));
			if (deptRes.ok) setDepartments(parseListResponse(DepartmentSchema, await deptRes.json().catch(() => ({ data: [] }))));
			if (desRes.ok) setDesignations(parseListResponse(DesignationSchema, await desRes.json().catch(() => ({ data: [] }))));
			if (roleRes.ok) setRoles(parseListResponse(RoleSchema, await roleRes.json().catch(() => ({ data: [] }))));
		} finally {
			setLoading(false);
		}
	}

	async function handleSubmit() {
		if (!org) return;
		setSubmitting(true);
		setError('');
		try {
			const payload: Record<string, unknown> = { ...form };
			payload.name = `${form.first_name} ${form.last_name}`.trim();
			delete payload.first_name;
			delete payload.last_name;
			const selectedRole = roles.find(r => r.id === form.role);
			if (selectedRole) payload.role = selectedRole.name;
			Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });

			const res = await apiFetch(`/organizations/${org.id}/employees/`, {
				method: 'POST', orgId: org.id,
				body: JSON.stringify(payload),
			});
			if (res.ok) {
				router.push('/employees');
			} else {
				const errData = await res.json().catch(() => ({}));
				if (errData.details) {
					const msgs = Object.entries(errData.details)
						.map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
						.join('; ');
					setError(errData.message ? `${errData.message} — ${msgs}` : msgs);
				} else {
					setError(errData.message || errData.detail || errData.error || 'Something went wrong.');
				}
				setStep(0);
			}
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const steps = ['Identity', 'Work'];

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-md px-5 py-10 space-y-8">

				{/* Back + title */}
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" className="shrink-0" asChild>
						<Link href="/employees"><ArrowLeft className="h-4 w-4" /></Link>
					</Button>
					<div>
						<h1 className="text-xl font-semibold tracking-tight">Add Employee</h1>
						<p className="text-sm text-muted-foreground">Takes about 30 seconds</p>
					</div>
				</div>

				{/* Step indicator */}
				<div className="flex items-center gap-3">
					{steps.map((label, i) => (
						<div key={i} className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
									i < step
										? 'bg-primary text-primary-foreground'
										: i === step
											? 'border-2 border-primary text-primary'
											: 'border border-muted-foreground/30 text-muted-foreground'
								}`}>
									{i < step ? <Check className="h-3 w-3" /> : i + 1}
								</div>
								<span className={`text-sm font-medium ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
									{label}
								</span>
							</div>
							{i < steps.length - 1 && (
								<div className={`h-px w-6 ${i < step ? 'bg-primary' : 'bg-border'}`} />
							)}
						</div>
					))}
				</div>

				{error && (
					<div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
						{error}
					</div>
				)}

				{/* Step 0: Identity */}
				{step === 0 && (
					<div className="space-y-5">
						<div>
							<Label className="text-sm font-medium">Work email *</Label>
							<Input
								type="email"
								className="mt-1.5"
								value={form.email}
								onChange={e => set('email', e.target.value)}
								placeholder="name@company.com"
								autoFocus
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<Label className="text-sm font-medium">First name *</Label>
								<Input
									className="mt-1.5"
									value={form.first_name}
									onChange={e => set('first_name', e.target.value)}
									placeholder="Jane"
								/>
							</div>
							<div>
								<Label className="text-sm font-medium">Last name *</Label>
								<Input
									className="mt-1.5"
									value={form.last_name}
									onChange={e => set('last_name', e.target.value)}
									placeholder="Smith"
								/>
							</div>
						</div>
						<Button
							className="w-full"
							onClick={() => setStep(1)}
							disabled={!form.email || !form.first_name || !form.last_name}
						>
							Continue
						</Button>
					</div>
				)}

				{/* Step 1: Work details */}
				{step === 1 && (
					<div className="space-y-5">

						{/* Role */}
						<div>
							<div className="flex items-center justify-between mb-1.5">
								<Label className="text-sm font-medium">Role *</Label>
								<button
									type="button"
									onClick={() => openModal('role')}
									className="flex items-center gap-0.5 text-xs text-primary hover:underline"
								>
									<Plus className="h-3 w-3" /> New
								</button>
							</div>
							<Select value={form.role} onValueChange={v => set('role', v)}>
								<SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
								<SelectContent>
									{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
								</SelectContent>
							</Select>
						</div>

						{/* Branch */}
						<div>
							<div className="flex items-center justify-between mb-1.5">
								<Label className="text-sm font-medium">Branch *</Label>
								<button
									type="button"
									onClick={() => openModal('branch')}
									className="flex items-center gap-0.5 text-xs text-primary hover:underline"
								>
									<Plus className="h-3 w-3" /> New
								</button>
							</div>
							<Select value={form.branch} onValueChange={v => set('branch', v)}>
								<SelectTrigger><SelectValue placeholder="Select a branch" /></SelectTrigger>
								<SelectContent>
									{branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>)}
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground mt-1">Determines the employee ID</p>
						</div>

						{/* Department + Designation (optional) */}
						<div className="grid grid-cols-2 gap-3">
							<div>
								<div className="flex items-center justify-between mb-1.5">
									<Label className="text-sm font-medium text-muted-foreground">Department</Label>
									<button
										type="button"
										onClick={() => openModal('department')}
										className="flex items-center gap-0.5 text-xs text-primary hover:underline"
									>
										<Plus className="h-3 w-3" />
									</button>
								</div>
								<Select value={form.department} onValueChange={v => set('department', v)}>
									<SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
									<SelectContent>
										{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
									</SelectContent>
								</Select>
							</div>
							<div>
								<div className="flex items-center justify-between mb-1.5">
									<Label className="text-sm font-medium text-muted-foreground">Designation</Label>
									<button
										type="button"
										onClick={() => openModal('designation')}
										className="flex items-center gap-0.5 text-xs text-primary hover:underline"
									>
										<Plus className="h-3 w-3" />
									</button>
								</div>
								<Select value={form.designation} onValueChange={v => set('designation', v)}>
									<SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
									<SelectContent>
										{designations.map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Employment type chips */}
						<div>
							<Label className="text-sm font-medium text-muted-foreground">Employment type</Label>
							<div className="flex flex-wrap gap-2 mt-2">
								{EMPLOYMENT_TYPES.map(t => (
									<button
										key={t.value}
										type="button"
										onClick={() => set('employment_type', t.value)}
										className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
											form.employment_type === t.value
												? 'bg-primary text-primary-foreground border-primary'
												: 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
										}`}
									>
										{t.label}
									</button>
								))}
							</div>
						</div>

						{/* Joining date */}
						<div>
							<Label className="text-sm font-medium text-muted-foreground">Joining date</Label>
							<Input
								className="mt-1.5"
								type="date"
								value={form.joining_date}
								onChange={e => set('joining_date', e.target.value)}
							/>
						</div>

						<div className="flex gap-3 pt-1">
							<Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
								Back
							</Button>
							<Button
								className="flex-1"
								onClick={handleSubmit}
								disabled={submitting || !form.role || !form.branch}
							>
								{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
								Add Employee
							</Button>
						</div>

						<p className="text-xs text-center text-muted-foreground">
							Personal details, salary &amp; bank info can be added from the employee profile later.
						</p>
					</div>
				)}

				{/* Create entity modal */}
				<Dialog open={modal !== null} onOpenChange={open => { if (!open) setModal(null); }}>
					<DialogContent className="max-w-sm">
						<DialogHeader>
							<DialogTitle>
								{modal === 'role' && 'New Role'}
								{modal === 'branch' && 'New Branch'}
								{modal === 'department' && 'New Department'}
								{modal === 'designation' && 'New Designation'}
							</DialogTitle>
						</DialogHeader>

						{modalError && (
							<p className="text-sm text-destructive">{modalError}</p>
						)}

						<div className="space-y-3">
							{(modal === 'role' || modal === 'department') && (
								<div>
									<Label>Name *</Label>
									<Input
										className="mt-1.5"
										value={modalForm.name || ''}
										onChange={e => setModalForm(f => ({ ...f, name: e.target.value }))}
										placeholder={modal === 'role' ? 'e.g. Team Lead' : 'e.g. Engineering'}
										autoFocus
									/>
								</div>
							)}
							{modal === 'branch' && (
								<>
									<div>
										<Label>Name *</Label>
										<Input
											className="mt-1.5"
											value={modalForm.name || ''}
											onChange={e => setModalForm(f => ({ ...f, name: e.target.value }))}
											placeholder="e.g. Hyderabad Office"
											autoFocus
										/>
									</div>
									<div>
										<Label>Code *</Label>
										<Input
											className="mt-1.5"
											value={modalForm.code || ''}
											onChange={e => setModalForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
											placeholder="e.g. HYD"
											maxLength={10}
										/>
										<p className="text-xs text-muted-foreground mt-1">Short code used in employee IDs</p>
									</div>
								</>
							)}
							{modal === 'designation' && (
								<div>
									<Label>Title *</Label>
									<Input
										className="mt-1.5"
										value={modalForm.title || ''}
										onChange={e => setModalForm(f => ({ ...f, title: e.target.value }))}
										placeholder="e.g. Senior Engineer"
										autoFocus
									/>
								</div>
							)}
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={() => setModal(null)}>Cancel</Button>
							<Button
								onClick={handleModalCreate}
								disabled={
									modalSubmitting ||
									(modal === 'role' && !modalForm.name?.trim()) ||
									(modal === 'branch' && (!modalForm.name?.trim() || !modalForm.code?.trim())) ||
									(modal === 'department' && !modalForm.name?.trim()) ||
									(modal === 'designation' && !modalForm.title?.trim())
								}
							>
								{modalSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Create
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

			</div>
		</div>
	);
}
