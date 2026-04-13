'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
	Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, ArrowLeft, Check, Plus } from 'lucide-react';
import type { Organization, Branch, Department, Designation, Role } from '@/lib/types';
import { apiFetch } from '@/lib/api';

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

const SALARY_TYPES = [
	{ value: 'monthly', label: 'Monthly' },
	{ value: 'annual', label: 'Annual' },
	{ value: 'hourly', label: 'Hourly' },
	{ value: 'weekly', label: 'Weekly' },
];

const GENDER_OPTIONS = [
	{ value: 'male', label: 'Male' },
	{ value: 'female', label: 'Female' },
	{ value: 'other', label: 'Other' },
	{ value: 'prefer_not_to_say', label: 'Prefer not to say' },
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

	// Modal state for creating new entities inline
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
				case 'role':
					url = `/roles/`;
					body = { name: modalForm.name };
					break;
				case 'branch':
					url = `/organizations/${org.id}/branches/`;
					body = { name: modalForm.name, code: modalForm.code?.toUpperCase() };
					break;
				case 'department':
					url = `/organizations/${org.id}/departments/`;
					body = { name: modalForm.name };
					break;
				case 'designation':
					url = `/organizations/${org.id}/designations/`;
					body = { title: modalForm.title };
					break;
			}

			const res = await apiFetch(url, {
				method: 'POST',
				orgId: org.id,
				body: JSON.stringify(body),
			});
			const json = await res.json();

			if (res.ok) {
				const created = json.data || json;
				// Add to local list and auto-select
				switch (modal) {
					case 'role':
						setRoles(prev => [...prev, created]);
						set('role', created.id);
						break;
					case 'branch':
						setBranches(prev => [...prev, created]);
						set('branch', created.id);
						break;
					case 'department':
						setDepartments(prev => [...prev, created]);
						set('department', created.id);
						break;
					case 'designation':
						setDesignations(prev => [...prev, created]);
						set('designation', created.id);
						break;
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
		// Basic
		email: '', first_name: '', last_name: '',
		// Role & Assignment
		role: '', branch: '', department: '', designation: '',
		// Personal
		phone: '', date_of_birth: '', gender: '',
		address_line1: '', address_line2: '', city: '', state: '', country: '', postal_code: '',
		// Emergency
		emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
		// Employment
		employment_type: 'full_time', joining_date: '', notice_period_days: '30',
		// Salary
		base_salary: '', salary_type: 'monthly', salary_currency: 'INR',
		// Bank
		bank_name: '', bank_account_number: '', bank_ifsc_code: '', bank_branch: '',
		// Tax
		pan_number: '', uan_number: '',
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
			if (brRes.ok) setBranches((await brRes.json()).data || []);
			if (deptRes.ok) setDepartments((await deptRes.json()).data || []);
			if (desRes.ok) setDesignations((await desRes.json()).data || []);
			if (roleRes.ok) setRoles((await roleRes.json()).data || []);
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
			// Remove empty strings
			Object.keys(payload).forEach(k => { if (payload[k] === '') delete payload[k]; });
			// Convert numeric fields
			if (form.base_salary) payload.base_salary = form.base_salary;
			if (form.notice_period_days) payload.notice_period_days = parseInt(form.notice_period_days);

			const res = await apiFetch(`/organizations/${org.id}/employees/`, {
				method: 'POST', orgId: org.id,
				body: JSON.stringify(payload),
			});
			if (res.ok) {
				router.push('/employees');
			} else {
				const errData = await res.json();
				if (errData.details) {
					// Validation errors: show field-level messages
					const msgs = Object.entries(errData.details)
						.map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
						.join('; ');
					setError(errData.message ? `${errData.message} ${msgs}` : msgs);
				} else {
					setError(errData.message || errData.detail || errData.error || JSON.stringify(errData));
				}
			}
		} finally {
			setSubmitting(false);
		}
	}

	const steps = [
		{ title: 'Basic Info', desc: 'Name and email' },
		{ title: 'Assignment', desc: 'Role, branch, department' },
		{ title: 'Personal', desc: 'Contact and address' },
		{ title: 'Employment', desc: 'Employment type and dates' },
		{ title: 'Compensation', desc: 'Salary and bank details (optional)' },
	];

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-3xl p-6 space-y-6">
				{/* Header */}
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/employees"><ArrowLeft className="h-4 w-4" /></Link>
					</Button>
					<div>
						<h1 className="text-2xl font-bold">Onboard New Employee</h1>
						<p className="text-sm text-muted-foreground">
							Create a full employee profile. An employee ID will be generated automatically.
						</p>
					</div>
				</div>

				{/* Step indicator */}
				<div className="flex gap-2">
					{steps.map((s, i) => (
						<button
							key={i}
							onClick={() => setStep(i)}
							className={`flex-1 rounded-md border p-3 text-left transition-colors ${i === step ? 'border-primary bg-primary/5' :
								i < step ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950' :
									'border-muted'
								}`}
						>
							<div className="flex items-center gap-2">
								{i < step ? (
									<Check className="h-4 w-4 text-green-600" />
								) : (
									<span className="flex h-5 w-5 items-center justify-center rounded-full border text-xs font-medium">
										{i + 1}
									</span>
								)}
								<span className="text-sm font-medium">{s.title}</span>
							</div>
							<p className="text-xs text-muted-foreground mt-1 hidden sm:block">{s.desc}</p>
						</button>
					))}
				</div>

				{error && (
					<div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
						{error}
					</div>
				)}

				{/* Step 0: Basic Info */}
				{step === 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Basic Information</CardTitle>
							<CardDescription>Employee name and contact email</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>Email Address *</Label>
								<Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="employee@company.com" />
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>First Name *</Label>
									<Input value={form.first_name} onChange={e => set('first_name', e.target.value)} />
								</div>
								<div>
									<Label>Last Name *</Label>
									<Input value={form.last_name} onChange={e => set('last_name', e.target.value)} />
								</div>
							</div>
							<div className="flex justify-end">
								<Button onClick={() => setStep(1)} disabled={!form.email || !form.first_name || !form.last_name}>
									Next
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Step 1: Assignment */}
				{step === 1 && (
					<Card>
						<CardHeader>
							<CardTitle>Role & Assignment</CardTitle>
							<CardDescription>Assign role, branch, department, and designation. The branch code determines the employee ID.</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<div className="flex items-center justify-between mb-1">
									<Label>Role *</Label>
									<Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => openModal('role')}>
										<Plus className="h-3 w-3" /> New
									</Button>
								</div>
								<Select value={form.role} onValueChange={v => set('role', v)}>
									<SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
									<SelectContent>
										{roles.map(r => (
											<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<div className="flex items-center justify-between mb-1">
									<Label>Branch *</Label>
									<Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => openModal('branch')}>
										<Plus className="h-3 w-3" /> New
									</Button>
								</div>
								<Select value={form.branch} onValueChange={v => set('branch', v)}>
									<SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
									<SelectContent>
										{branches.map(b => (
											<SelectItem key={b.id} value={b.id}>{b.name} ({b.code})</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground mt-1">
									Employee ID will be auto-generated based on this branch code.
								</p>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="flex items-center justify-between mb-1">
										<Label>Department</Label>
										<Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => openModal('department')}>
											<Plus className="h-3 w-3" /> New
										</Button>
									</div>
									<Select value={form.department} onValueChange={v => set('department', v)}>
										<SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
										<SelectContent>
											{departments.map(d => (
												<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<div className="flex items-center justify-between mb-1">
										<Label>Designation</Label>
										<Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={() => openModal('designation')}>
											<Plus className="h-3 w-3" /> New
										</Button>
									</div>
									<Select value={form.designation} onValueChange={v => set('designation', v)}>
										<SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
										<SelectContent>
											{designations.map(d => (
												<SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="flex justify-between">
								<Button variant="outline" onClick={() => setStep(0)}>Back</Button>
								<Button onClick={() => setStep(2)} disabled={!form.role || !form.branch}>Next</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Step 2: Personal */}
				{step === 2 && (
					<Card>
						<CardHeader>
							<CardTitle>Personal Details</CardTitle>
							<CardDescription>Contact information and emergency contact</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Phone</Label>
									<Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
								</div>
								<div>
									<Label>Date of Birth</Label>
									<Input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
								</div>
							</div>
							<div>
								<Label>Gender</Label>
								<Select value={form.gender} onValueChange={v => set('gender', v)}>
									<SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
									<SelectContent>
										{GENDER_OPTIONS.map(g => (
											<SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label>Address Line 1</Label>
								<Input value={form.address_line1} onChange={e => set('address_line1', e.target.value)} />
							</div>
							<div>
								<Label>Address Line 2</Label>
								<Input value={form.address_line2} onChange={e => set('address_line2', e.target.value)} />
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>City</Label>
									<Input value={form.city} onChange={e => set('city', e.target.value)} />
								</div>
								<div>
									<Label>State</Label>
									<Input value={form.state} onChange={e => set('state', e.target.value)} />
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Country</Label>
									<Input value={form.country} onChange={e => set('country', e.target.value)} />
								</div>
								<div>
									<Label>Postal Code</Label>
									<Input value={form.postal_code} onChange={e => set('postal_code', e.target.value)} />
								</div>
							</div>

							<div className="pt-2 border-t">
								<h4 className="font-medium mb-3">Emergency Contact</h4>
								<div className="grid grid-cols-3 gap-4">
									<div>
										<Label>Name</Label>
										<Input value={form.emergency_contact_name} onChange={e => set('emergency_contact_name', e.target.value)} />
									</div>
									<div>
										<Label>Phone</Label>
										<Input value={form.emergency_contact_phone} onChange={e => set('emergency_contact_phone', e.target.value)} />
									</div>
									<div>
										<Label>Relation</Label>
										<Input value={form.emergency_contact_relation} onChange={e => set('emergency_contact_relation', e.target.value)} placeholder="e.g. Spouse" />
									</div>
								</div>
							</div>

							<div className="flex justify-between">
								<Button variant="outline" onClick={() => setStep(1)}>Back</Button>
								<Button onClick={() => setStep(3)}>Next</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Step 3: Employment */}
				{step === 3 && (
					<Card>
						<CardHeader>
							<CardTitle>Employment Details</CardTitle>
							<CardDescription>Employment type, dates, and notice period</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<Label>Employment Type *</Label>
								<Select value={form.employment_type} onValueChange={v => set('employment_type', v)}>
									<SelectTrigger><SelectValue /></SelectTrigger>
									<SelectContent>
										{EMPLOYMENT_TYPES.map(t => (
											<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>Joining Date</Label>
									<Input type="date" value={form.joining_date} onChange={e => set('joining_date', e.target.value)} />
								</div>
								<div>
									<Label>Notice Period (days)</Label>
									<Input type="number" value={form.notice_period_days} onChange={e => set('notice_period_days', e.target.value)} />
								</div>
							</div>
							<div className="flex justify-between">
								<Button variant="outline" onClick={() => setStep(2)}>Back</Button>
								<div className="flex gap-2">
									<Button variant="outline" onClick={handleSubmit} disabled={submitting}>
										{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
										Skip & Onboard
									</Button>
									<Button onClick={() => setStep(4)}>Next</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Step 4: Compensation */}
				{step === 4 && (
					<Card>
						<CardHeader>
							<CardTitle>Compensation & Bank Details</CardTitle>
							<CardDescription>Salary information and bank account for payroll</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-3 gap-4">
								<div>
									<Label>Base Salary</Label>
									<Input type="number" step="0.01" value={form.base_salary} onChange={e => set('base_salary', e.target.value)} placeholder="50000.00" />
								</div>
								<div>
									<Label>Salary Type</Label>
									<Select value={form.salary_type} onValueChange={v => set('salary_type', v)}>
										<SelectTrigger><SelectValue /></SelectTrigger>
										<SelectContent>
											{SALARY_TYPES.map(t => (
												<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label>Currency</Label>
									<Input value={form.salary_currency} onChange={e => set('salary_currency', e.target.value)} />
								</div>
							</div>

							<div className="pt-2 border-t">
								<h4 className="font-medium mb-3">Bank Details</h4>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Bank Name</Label>
										<Input value={form.bank_name} onChange={e => set('bank_name', e.target.value)} />
									</div>
									<div>
										<Label>Account Number</Label>
										<Input value={form.bank_account_number} onChange={e => set('bank_account_number', e.target.value)} />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4 mt-4">
									<div>
										<Label>IFSC Code</Label>
										<Input value={form.bank_ifsc_code} onChange={e => set('bank_ifsc_code', e.target.value)} />
									</div>
									<div>
										<Label>Bank Branch</Label>
										<Input value={form.bank_branch} onChange={e => set('bank_branch', e.target.value)} />
									</div>
								</div>
							</div>

							<div className="pt-2 border-t">
								<h4 className="font-medium mb-3">Tax Details</h4>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>PAN Number</Label>
										<Input value={form.pan_number} onChange={e => set('pan_number', e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} />
									</div>
									<div>
										<Label>UAN Number</Label>
										<Input value={form.uan_number} onChange={e => set('uan_number', e.target.value)} />
									</div>
								</div>
							</div>

							<div className="flex justify-between pt-4">
								<Button variant="outline" onClick={() => setStep(3)}>Back</Button>
								<Button onClick={handleSubmit} disabled={submitting}>
									{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Onboard Employee
								</Button>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Create New Entity Modal */}
				<Dialog open={modal !== null} onOpenChange={open => { if (!open) setModal(null); }}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{modal === 'role' && 'Create New Role'}
								{modal === 'branch' && 'Create New Branch'}
								{modal === 'department' && 'Create New Department'}
								{modal === 'designation' && 'Create New Designation'}
							</DialogTitle>
							<DialogDescription>
								{modal === 'role' && 'Add a new role to your organization.'}
								{modal === 'branch' && 'Add a new branch. The code is used for generating employee IDs.'}
								{modal === 'department' && 'Add a new department to your organization.'}
								{modal === 'designation' && 'Add a new designation to your organization.'}
							</DialogDescription>
						</DialogHeader>

						{modalError && (
							<div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
								{modalError}
							</div>
						)}

						<div className="space-y-4">
							{(modal === 'role' || modal === 'department') && (
								<div>
									<Label>Name *</Label>
									<Input
										value={modalForm.name || ''}
										onChange={e => setModalForm(f => ({ ...f, name: e.target.value }))}
										placeholder={modal === 'role' ? 'e.g. Team Lead' : 'e.g. Engineering'}
									/>
								</div>
							)}

							{modal === 'branch' && (
								<>
									<div>
										<Label>Name *</Label>
										<Input
											value={modalForm.name || ''}
											onChange={e => setModalForm(f => ({ ...f, name: e.target.value }))}
											placeholder="e.g. Hyderabad Office"
										/>
									</div>
									<div>
										<Label>Code *</Label>
										<Input
											value={modalForm.code || ''}
											onChange={e => setModalForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
											placeholder="e.g. HYD"
											maxLength={10}
										/>
										<p className="text-xs text-muted-foreground mt-1">Short code used in employee IDs.</p>
									</div>
								</>
							)}

							{modal === 'designation' && (
								<div>
									<Label>Title *</Label>
									<Input
										value={modalForm.title || ''}
										onChange={e => setModalForm(f => ({ ...f, title: e.target.value }))}
										placeholder="e.g. Senior Engineer"
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
