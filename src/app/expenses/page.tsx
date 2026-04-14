'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
	Dialog, DialogContent, DialogDescription, DialogFooter,
	DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
	Loader2, Plus, Receipt, ArrowLeft, Search, CheckCircle, XCircle, DollarSign,
} from 'lucide-react';
import type { ExpenseClaim, Organization } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, ExpenseClaimSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

const EXPENSE_TYPES = [
	'travel', 'food', 'accommodation', 'transport', 'office_supplies',
	'equipment', 'software', 'training', 'medical', 'communication',
	'client_entertainment', 'other',
];

export default function ExpensesPage() {
	const router = useRouter();
	const [org, setOrg] = useState<Organization | null>(null);
	const [claims, setClaims] = useState<ExpenseClaim[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState('all');
	const [typeFilter, setTypeFilter] = useState('all');

	// Create dialog
	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [form, setForm] = useState({
		title: '', description: '', expense_type: 'other',
		amount: '', currency: 'INR', expense_date: '', vendor_name: '', receipt_number: '',
	});

	// Review dialog
	const [reviewOpen, setReviewOpen] = useState(false);
	const [reviewClaim, setReviewClaim] = useState<ExpenseClaim | null>(null);
	const [reviewNote, setReviewNote] = useState('');
	const [reviewing, setReviewing] = useState(false);

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
		loadClaims(o.id);
	}, [router]);

	async function loadClaims(orgId: string) {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (statusFilter !== 'all') params.set('status', statusFilter);
			if (typeFilter !== 'all') params.set('expense_type', typeFilter);
			const qs = params.toString();
			const res = await apiFetch(`/organizations/${orgId}/payments/expenses/${qs ? `?${qs}` : ''}`, { orgId });
			if (res.ok) {
				const data = await res.json().catch(() => ({ data: [] }));
				setClaims(parseListResponse(ExpenseClaimSchema, data));
			}
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (!org) return;
		loadClaims(org.id);
	}, [statusFilter, typeFilter]);

	async function handleCreate() {
		if (!org || !form.title || !form.amount) return;
		setCreating(true);
		try {
			const res = await apiFetch(`/organizations/${org.id}/payments/expenses/`, {
				method: 'POST', orgId: org.id,
				body: JSON.stringify(form),
			});
			if (res.ok) {
				setCreateOpen(false);
				setForm({ title: '', description: '', expense_type: 'other', amount: '', currency: 'INR', expense_date: '', vendor_name: '', receipt_number: '' });
				loadClaims(org.id);
			}
		} finally {
			setCreating(false);
		}
	}

	async function handleReview(action: 'approved' | 'rejected') {
		if (!org || !reviewClaim) return;
		setReviewing(true);
		try {
			const res = await apiFetch(`/organizations/${org.id}/payments/expenses/${reviewClaim.id}/review/`, {
				method: 'POST', orgId: org.id,
				body: JSON.stringify({ action, review_note: reviewNote }),
			});
			if (res.ok) {
				setReviewOpen(false);
				setReviewClaim(null);
				setReviewNote('');
				loadClaims(org.id);
			}
		} finally {
			setReviewing(false);
		}
	}

	async function handleReimburse(claimId: string) {
		if (!org) return;
		const ref = prompt('Enter reimbursement reference number:');
		if (!ref) return;
		const res = await apiFetch(`/organizations/${org.id}/payments/expenses/${claimId}/reimburse/`, {
			method: 'POST', orgId: org.id,
			body: JSON.stringify({ reimbursement_reference: ref }),
		});
		if (res.ok) loadClaims(org.id);
	}

	const statusBadge: Record<string, { color: string; label: string }> = {
		draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', label: 'Draft' },
		submitted: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Submitted' },
		under_review: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Under Review' },
		approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Approved' },
		rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Rejected' },
		reimbursed: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', label: 'Reimbursed' },
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-7xl p-6 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="icon" asChild>
							<Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Expense Claims</h1>
							<p className="text-sm text-muted-foreground">
								Submit and manage expense reimbursements
							</p>
						</div>
					</div>
					<Dialog open={createOpen} onOpenChange={setCreateOpen}>
						<DialogTrigger asChild>
							<Button><Plus className="mr-2 h-4 w-4" />New Expense</Button>
						</DialogTrigger>
						<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Submit Expense Claim</DialogTitle>
								<DialogDescription>Submit a bill or expense for reimbursement.</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div>
									<Label>Title *</Label>
									<Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Client dinner" />
								</div>
								<div>
									<Label>Description</Label>
									<Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Type</Label>
										<Select value={form.expense_type} onValueChange={v => setForm(f => ({ ...f, expense_type: v }))}>
											<SelectTrigger><SelectValue /></SelectTrigger>
											<SelectContent>
												{EXPENSE_TYPES.map(t => (
													<SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div>
										<Label>Date</Label>
										<Input type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Amount *</Label>
										<Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
									</div>
									<div>
										<Label>Currency</Label>
										<Input value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} />
									</div>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label>Vendor</Label>
										<Input value={form.vendor_name} onChange={e => setForm(f => ({ ...f, vendor_name: e.target.value }))} />
									</div>
									<div>
										<Label>Receipt #</Label>
										<Input value={form.receipt_number} onChange={e => setForm(f => ({ ...f, receipt_number: e.target.value }))} />
									</div>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
								<Button onClick={handleCreate} disabled={creating || !form.title || !form.amount}>
									{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									Submit Claim
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{/* Filters */}
				<Card>
					<CardContent className="pt-4">
						<div className="flex gap-4">
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="submitted">Submitted</SelectItem>
									<SelectItem value="under_review">Under Review</SelectItem>
									<SelectItem value="approved">Approved</SelectItem>
									<SelectItem value="rejected">Rejected</SelectItem>
									<SelectItem value="reimbursed">Reimbursed</SelectItem>
								</SelectContent>
							</Select>
							<Select value={typeFilter} onValueChange={setTypeFilter}>
								<SelectTrigger className="w-45">
									<SelectValue placeholder="Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									{EXPENSE_TYPES.map(t => (
										<SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Claims table */}
				{claims.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<Receipt className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="font-semibold text-lg">No expense claims</h3>
							<p className="text-sm text-muted-foreground mt-1">
								Submit your first expense claim for reimbursement.
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
										<TableHead>Title</TableHead>
										<TableHead>Employee</TableHead>
										<TableHead>Type</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{claims.map(claim => {
										const sb = statusBadge[claim.status] || statusBadge.draft;
										return (
											<TableRow key={claim.id}>
												<TableCell>
													<div>
														<p className="font-medium">{claim.title}</p>
														{claim.vendor_name && (
															<p className="text-xs text-muted-foreground">{claim.vendor_name}</p>
														)}
													</div>
												</TableCell>
												<TableCell className="text-sm">{claim.employee_name}</TableCell>
												<TableCell className="text-sm capitalize">{claim.expense_type?.replace(/_/g, ' ') || '-'}</TableCell>
												<TableCell className="font-mono">
													{claim.currency} {parseFloat(claim.amount).toLocaleString()}
												</TableCell>
												<TableCell className="text-sm">{claim.expense_date || '-'}</TableCell>
												<TableCell>
													<Badge className={sb.color} variant="secondary">{sb.label}</Badge>
												</TableCell>
												<TableCell>
													<div className="flex gap-1">
														{(claim.status === 'submitted' || claim.status === 'under_review') && (
															<Button
																variant="ghost" size="sm"
																onClick={() => { setReviewClaim(claim); setReviewOpen(true); }}
															>
																Review
															</Button>
														)}
														{claim.status === 'approved' && (
															<Button
																variant="ghost" size="sm"
																onClick={() => handleReimburse(claim.id)}
															>
																<DollarSign className="mr-1 h-3 w-3" />Reimburse
															</Button>
														)}
													</div>
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

				{/* Review dialog */}
				<Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
					<DialogContent className="max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Review Expense Claim</DialogTitle>
							<DialogDescription>
								{reviewClaim && `${reviewClaim.title} - ${reviewClaim.currency} ${parseFloat(reviewClaim.amount).toLocaleString()}`}
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4 py-4">
							{reviewClaim?.description && (
								<div>
									<Label>Description</Label>
									<p className="text-sm text-muted-foreground">{reviewClaim.description}</p>
								</div>
							)}
							<div>
								<Label>Review Note</Label>
								<Textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Add a note..." rows={3} />
							</div>
						</div>
						<DialogFooter className="gap-2">
							<Button variant="destructive" onClick={() => handleReview('rejected')} disabled={reviewing}>
								<XCircle className="mr-2 h-4 w-4" />Reject
							</Button>
							<Button onClick={() => handleReview('approved')} disabled={reviewing}>
								{reviewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
								Approve
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
