'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowLeft, Plus, Check } from 'lucide-react';
import type { Organization, Role } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, RoleSchema } from '@/lib/schemas';

const SESSION_KEY = 'emp_new_form';

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

function OnboardEmployeeInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [org, setOrg] = useState<Organization | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [step, setStep] = useState(0);
	const [error, setError] = useState('');

	const [roles, setRoles] = useState<Role[]>([]);

	const [form, setForm] = useState({
		email: '', first_name: '', last_name: '',
		role: '',
		employment_type: 'full_time', joining_date: '',
	});

	const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

	// Save form to sessionStorage before navigating to a create page
	function navigateToCreate(path: string) {
		sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...form, _step: step }));
		router.push(`${path}?return=${encodeURIComponent('/employees/new')}`);
	}

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);

		const reloadType = searchParams.get('reload');
		const newId = searchParams.get('newId');

		// Restore saved form state (user returned from a create page)
		const savedRaw = sessionStorage.getItem(SESSION_KEY);
		if (savedRaw) {
			try {
				const saved = JSON.parse(savedRaw);
				const { _step, ...savedForm } = saved;
				setForm(f => ({ ...f, ...savedForm }));
				setStep(typeof _step === 'number' ? _step : 0);
			} catch { /* ignore */ }
			sessionStorage.removeItem(SESSION_KEY);
		}

		loadLookups(o.id, reloadType ?? undefined, newId ?? undefined);

		// Clean up URL params
		if (reloadType) {
			router.replace('/employees/new');
		}
	}, [router]); // eslint-disable-line react-hooks/exhaustive-deps

	async function loadLookups(orgId: string, reloadType?: string, newId?: string) {
		setLoading(true);
		try {
			const [roleRes] = await Promise.all([
				apiFetch(`/roles/`, { orgId }),
			]);
			if (roleRes.ok) setRoles(parseListResponse(RoleSchema, await roleRes.json().catch(() => ({ data: [] }))));

			// Auto-select the newly created item
			if (reloadType && newId) {
				setForm(f => ({ ...f, [reloadType]: newId }));
			}
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
								<div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${i < step
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
									onClick={() => navigateToCreate('/roles')}
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

						{/* Employment type chips */}
						<div>
							<Label className="text-sm font-medium text-muted-foreground">Employment type</Label>
							<div className="flex flex-wrap gap-2 mt-2">
								{EMPLOYMENT_TYPES.map(t => (
									<button
										key={t.value}
										type="button"
										onClick={() => set('employment_type', t.value)}
										className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${form.employment_type === t.value
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
								disabled={submitting || !form.role}
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

			</div>
		</div>
	);
}

export default function OnboardEmployeePage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		}>
			<OnboardEmployeeInner />
		</Suspense>
	);
}
