'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Loader2, Plus, Search, ArrowLeft, Users, MoreVertical,
	Eye, Pencil, Ban, Trash2,
} from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { MemberListItem, Organization, Branch, Department } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, EmployeeSchema, BranchSchema, DepartmentSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

export default function EmployeesPage() {
	const router = useRouter();
	const [org, setOrg] = useState<Organization | null>(null);
	const [employees, setEmployees] = useState<MemberListItem[]>([]);
	const [branches, setBranches] = useState<Branch[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState('');
	const [branchFilter, setBranchFilter] = useState('all');
	const [deptFilter, setDeptFilter] = useState('all');
	const [statusFilter, setStatusFilter] = useState('all');
	const [deleteTarget, setDeleteTarget] = useState<MemberListItem | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [disableTarget, setDisableTarget] = useState<MemberListItem | null>(null);
	const [disabling, setDisabling] = useState(false);

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
		loadData(o.id);
	}, [router]);

	async function loadData(orgId: string) {
		setLoading(true);
		try {
			const [empRes, brRes, deptRes] = await Promise.all([
				apiFetch(`/organizations/${orgId}/directory/`, { orgId }),
				apiFetch(`/organizations/${orgId}/branches/`, { orgId }),
				apiFetch(`/organizations/${orgId}/departments/`, { orgId }),
			]);
			if (empRes.ok) {
				const data = await empRes.json().catch(() => ({ data: [] }));
				setEmployees(parseListResponse(EmployeeSchema, data));
			}
			if (brRes.ok) {
				const brData = await brRes.json().catch(() => ({ data: [] }));
				setBranches(parseListResponse(BranchSchema, brData));
			}
			if (deptRes.ok) {
				const deptData = await deptRes.json().catch(() => ({ data: [] }));
				setDepartments(parseListResponse(DepartmentSchema, deptData));
			}
		} finally {
			setLoading(false);
		}
	}

	async function loadEmployees(orgId: string) {
		const params = new URLSearchParams();
		if (search) params.set('search', search);
		if (branchFilter !== 'all') params.set('branch', branchFilter);
		if (deptFilter !== 'all') params.set('department', deptFilter);
		if (statusFilter !== 'all') params.set('status', statusFilter);
		const qs = params.toString();
		const res = await apiFetch(`/organizations/${orgId}/directory/${qs ? `?${qs}` : ''}`, { orgId });
		if (res.ok) {
			const data = await res.json().catch(() => ({ data: [] }));
			setEmployees(parseListResponse(EmployeeSchema, data));
		}
	}

	useEffect(() => {
		if (!org) return;
		const timeout = setTimeout(() => loadEmployees(org.id), 300);
		return () => clearTimeout(timeout);
	}, [search, branchFilter, deptFilter, statusFilter]);

	async function handleDelete() {
		if (!org || !deleteTarget) return;
		setDeleting(true);
		try {
			await apiFetch(`/organizations/${org.id}/members/${deleteTarget.id}/`, {
				orgId: org.id,
				method: 'DELETE',
			});
			setEmployees(prev => prev.filter(e => e.id !== deleteTarget.id));
		} finally {
			setDeleting(false);
			setDeleteTarget(null);
		}
	}

	async function handleDisable() {
		if (!org || !disableTarget) return;
		setDisabling(true);
		try {
			const res = await apiFetch(`/organizations/${org.id}/employees/${disableTarget.id}/`, {
				orgId: org.id,
				method: 'PATCH',
				body: JSON.stringify({ status: 'suspended' }),
			});
			if (res.ok) {
				setEmployees(prev => prev.map(e =>
					e.id === disableTarget.id ? { ...e, status: 'suspended' } : e
				));
			}
		} finally {
			setDisabling(false);
			setDisableTarget(null);
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const statusConfig: Record<string, { label: string; className: string }> = {
		active: { label: 'Active', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
		suspended: { label: 'Suspended', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
		terminated: { label: 'Terminated', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
		on_notice: { label: 'On Notice', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
	};

	return (
		<>
			<div className="min-h-screen bg-background">
				<div className="mx-auto max-w-7xl p-6 space-y-6">
					{/* Header */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Button variant="ghost" size="icon" asChild>
								<Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
							</Button>
							<div>
								<h1 className="text-2xl font-bold">Employees</h1>
								<p className="text-sm text-muted-foreground">
									{employees.length} employee{employees.length !== 1 ? 's' : ''} in the organization
								</p>
							</div>
						</div>
						<Button asChild>
							<Link href="/employees/new">
								<Plus className="mr-2 h-4 w-4" />Onboard Employee
							</Link>
						</Button>
					</div>

					{/* Filters */}
					<Card>
						<CardContent className="pt-4">
							<div className="flex flex-wrap gap-4">
								<div className="relative flex-1 min-w-50">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										className="pl-9"
										placeholder="Search by name, email, or employee ID..."
										value={search}
										onChange={e => setSearch(e.target.value)}
									/>
								</div>
								<Select value={branchFilter} onValueChange={setBranchFilter}>
									<SelectTrigger className="w-40">
										<SelectValue placeholder="Branch" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Branches</SelectItem>
										{branches.map(b => (
											<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select value={deptFilter} onValueChange={setDeptFilter}>
									<SelectTrigger className="w-40">
										<SelectValue placeholder="Department" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Departments</SelectItem>
										{departments.map(d => (
											<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-35">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Status</SelectItem>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="suspended">Suspended</SelectItem>
										<SelectItem value="on_notice">On Notice</SelectItem>
										<SelectItem value="terminated">Terminated</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>

					{/* Employee table */}
					{employees.length === 0 ? (
						<Card>
							<CardContent className="flex flex-col items-center justify-center py-12 text-center">
								<Users className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="font-semibold text-lg">No employees found</h3>
								<p className="text-sm text-muted-foreground mt-1">
									Onboard your first employee to get started.
								</p>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="p-0">
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Employee ID</TableHead>
												<TableHead>Name</TableHead>
												<TableHead>Designation</TableHead>
												<TableHead>Status</TableHead>
												<TableHead className="w-12" />
											</TableRow>
										</TableHeader>
										<TableBody>
											{employees.map(emp => {
												const sc = statusConfig[emp.status] ?? { label: emp.status, className: '' };
												return (
													<TableRow key={emp.id} className="hover:bg-muted/50">
														<TableCell className="font-mono text-sm font-medium">
															{emp.employee_id || <span className="text-muted-foreground text-xs">No ID</span>}
														</TableCell>
														<TableCell>
															<div>
																<p className="font-medium">{emp.user_name || <span className="text-muted-foreground">—</span>}</p>
																<p className="text-xs text-muted-foreground">{emp.user_email || ''}</p>
															</div>
														</TableCell>
														<TableCell>
															<div>
																<p className="text-sm">{emp.designation_title || emp.role_name || <span className="text-muted-foreground">—</span>}</p>
																{emp.department_name && (
																	<p className="text-xs text-muted-foreground">{emp.department_name}</p>
																)}
															</div>
														</TableCell>
														<TableCell>
															<Badge className={sc.className} variant="secondary">
																{sc.label}
															</Badge>
														</TableCell>
														<TableCell onClick={e => e.stopPropagation()}>
															<DropdownMenu>
																<DropdownMenuTrigger asChild>
																	<Button variant="ghost" size="icon" className="h-8 w-8">
																		<MoreVertical className="h-4 w-4" />
																		<span className="sr-only">Actions</span>
																	</Button>
																</DropdownMenuTrigger>
																<DropdownMenuContent align="end">
																	<DropdownMenuItem onClick={() => router.push(`/employees/${emp.id}`)}>
																		<Eye className="mr-2 h-4 w-4" />View
																	</DropdownMenuItem>
																	<DropdownMenuItem onClick={() => router.push(`/employees/${emp.id}/edit`)}>
																		<Pencil className="mr-2 h-4 w-4" />Edit
																	</DropdownMenuItem>
																	{emp.status !== 'suspended' && (
																		<DropdownMenuItem
																			className="text-yellow-600 focus:text-yellow-600"
																			onClick={() => setDisableTarget(emp)}
																		>
																			<Ban className="mr-2 h-4 w-4" />Disable
																		</DropdownMenuItem>
																	)}
																	<DropdownMenuSeparator />
																	<DropdownMenuItem
																		className="text-destructive focus:text-destructive"
																		onClick={() => setDeleteTarget(emp)}
																	>
																		<Trash2 className="mr-2 h-4 w-4" />Delete
																	</DropdownMenuItem>
																</DropdownMenuContent>
															</DropdownMenu>
														</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>

			{/* Delete confirmation */}
			<AlertDialog open={!!deleteTarget} onOpenChange={(open: boolean) => { if (!open) setDeleteTarget(null); }}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Remove Employee</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to permanently remove <strong>{deleteTarget?.user_name}</strong>? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={deleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							{deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
							Remove
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Disable confirmation */}
			<AlertDialog open={!!disableTarget} onOpenChange={(open: boolean) => { if (!open) setDisableTarget(null); }}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Disable Employee</AlertDialogTitle>
						<AlertDialogDescription>
							Disable <strong>{disableTarget?.user_name}</strong>? Their account will be suspended. You can re-enable them later from their profile.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={disabling}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDisable}
							disabled={disabling}
							className="bg-yellow-600 text-white hover:bg-yellow-700"
						>
							{disabling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
							Disable
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
