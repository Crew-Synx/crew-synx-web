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
	Eye, Pencil, Ban, Trash2, SlidersHorizontal,
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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import type { MemberListItem, Organization } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, EmployeeSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

export default function EmployeesPage() {
	const router = useRouter();
	const [org, setOrg] = useState<Organization | null>(null);
	const [employees, setEmployees] = useState<MemberListItem[]>([]);
	const [loading, setLoading] = useState(true);

	const [search, setSearch] = useState('');
	const [filterOpen, setFilterOpen] = useState(false);
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
			const empRes = await apiFetch(`/organizations/${orgId}/directory/`, { orgId });
			if (empRes.ok) {
				const data = await empRes.json().catch(() => ({ data: [] }));
				setEmployees(parseListResponse(EmployeeSchema, data));
			}
		} finally {
			setLoading(false);
		}
	}

	async function loadEmployees(orgId: string) {
		const params = new URLSearchParams();
		if (search) params.set('search', search);
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
	}, [search, statusFilter]);

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
				<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5">

					{/* Header */}
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3 min-w-0">
							<Button variant="ghost" size="icon" className="shrink-0" asChild>
								<Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
							</Button>
							<div className="min-w-0">
								<h1 className="text-xl font-bold sm:text-2xl">Employees</h1>
								<p className="text-xs text-muted-foreground sm:text-sm">
									{employees.length} employee{employees.length !== 1 ? 's' : ''} in the organization
								</p>
							</div>
						</div>
						<Button asChild className="shrink-0">
							<Link href="/employees/new">
								<Plus className="mr-2 h-4 w-4" />
								<span className="hidden sm:inline">Onboard Employee</span>
								<span className="sm:hidden">Add</span>
							</Link>
						</Button>
					</div>

					{/* Filters */}
					<div className="flex gap-2 items-center">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								className="pl-9"
								placeholder="Search by name or email..."
								value={search}
								onChange={e => setSearch(e.target.value)}
							/>
						</div>
						<Button
							variant={statusFilter !== 'all' ? 'default' : 'outline'}
							size="icon"
							className="shrink-0"
							onClick={() => setFilterOpen(true)}
						>
							<SlidersHorizontal className="h-4 w-4" />
						</Button>
					</div>

					{/* Employee list */}
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
						<>
							{/* Mobile card list */}
							<div className="sm:hidden space-y-2">
								{employees.map(emp => {
									const sc = statusConfig[emp.status] ?? { label: emp.status, className: '' };
									const initials = (emp.user_name || emp.user_email || '?')
										.split(' ')
										.map((w: string) => w[0])
										.slice(0, 2)
										.join('')
										.toUpperCase();
									return (
										<div
											key={emp.id}
											className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3"
										>
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
												{initials}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium truncate">{emp.user_name || '—'}</p>
												<p className="text-xs text-muted-foreground truncate">{emp.user_email}</p>
												{emp.role_name && (
													<p className="text-xs text-muted-foreground mt-0.5">{emp.role_name}</p>
												)}
											</div>
											<div className="flex flex-col items-end gap-2 shrink-0">
												<Badge className={sc.className} variant="secondary">
													{sc.label}
												</Badge>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" size="icon" className="h-7 w-7">
															<MoreVertical className="h-4 w-4" />
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
											</div>
										</div>
									);
								})}
							</div>

							{/* Desktop table */}
							<Card className="hidden sm:block">
								<CardContent className="p-0">
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Name</TableHead>
													<TableHead>Role</TableHead>
													<TableHead>Status</TableHead>
													<TableHead className="w-12" />
												</TableRow>
											</TableHeader>
											<TableBody>
												{employees.map(emp => {
													const sc = statusConfig[emp.status] ?? { label: emp.status, className: '' };
													return (
														<TableRow key={emp.id} className="hover:bg-muted/50">
															<TableCell>
																<p className="font-medium">{emp.user_name || '—'}</p>
																<p className="text-xs text-muted-foreground">{emp.user_email || ''}</p>
															</TableCell>
															<TableCell>
																<p className="text-sm">{emp.role_name || '—'}</p>
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
						</>
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

			{/* Filter modal */}
			<Dialog open={filterOpen} onOpenChange={setFilterOpen}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Filter Employees</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<p className="text-sm font-medium">Status</p>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="All Status" />
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
						{statusFilter !== 'all' && (
							<Button
								variant="ghost"
								className="w-full text-muted-foreground"
								onClick={() => setStatusFilter('all')}
							>
								Clear filters
							</Button>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
