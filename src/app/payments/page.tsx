'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingLabelInput, FloatingLabelTextarea } from '@/components/ui/floating-label-input';
import { Label } from '@/components/ui/label';
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
	Loader2, Plus, Receipt, ArrowLeft, CheckCircle, XCircle, DollarSign,
	CreditCard, Wallet,
} from 'lucide-react';
import type { Payment, Organization } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, PaymentSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

type PaymentType = 'client_payment' | 'expense';

const TYPE_TABS: { key: 'all' | PaymentType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
	{ key: 'all', label: 'All', icon: Receipt },
	{ key: 'client_payment', label: 'Client Payments', icon: CreditCard },
	{ key: 'expense', label: 'Expenses', icon: Wallet },
];

const STATUS_CHOICES = ['pending', 'approved', 'rejected', 'paid'];

const STATUS_BADGE: Record<string, { color: string; label: string }> = {
	pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Pending' },
	approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Approved' },
	rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Rejected' },
	paid: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Paid' },
};

export default function PaymentsPage() {
	const router = useRouter();
	const [org, setOrg] = useState<Organization | null>(null);
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);
	const [typeTab, setTypeTab] = useState<'all' | PaymentType>('all');
	const [statusFilter, setStatusFilter] = useState('all');

	// Create dialog
	const [createOpen, setCreateOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [createType, setCreateType] = useState<PaymentType>('expense');
	const [form, setForm] = useState({
		title: '', description: '', amount: '', currency: 'INR',
		payment_date: '', vendor_name: '', receipt_number: '',
	});
	const [receiptFile, setReceiptFile] = useState<File | null>(null);

	// Approve/reject dialog
	const [reviewOpen, setReviewOpen] = useState(false);
	const [reviewPayment, setReviewPayment] = useState<Payment | null>(null);
	const [reviewing, setReviewing] = useState(false);

	const loadPayments = useCallback(async (orgId: string, tab: string, status: string) => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (tab !== 'all') params.set('payment_type', tab);
			if (status !== 'all') params.set('status', status);
			const qs = params.toString();
			const res = await apiFetch(`/payments/${qs ? `?${qs}` : ''}`, { orgId });
			if (res.ok) {
				const data = await res.json().catch(() => ({ data: [] }));
				setPayments(parseListResponse(PaymentSchema, data) as Payment[]);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
		loadPayments(o.id, 'all', 'all');
	}, [router, loadPayments]);

	useEffect(() => {
		if (!org) return;
		loadPayments(org.id, typeTab, statusFilter);
	}, [typeTab, statusFilter, org, loadPayments]);

	function resetForm() {
		setForm({ title: '', description: '', amount: '', currency: 'INR', payment_date: '', vendor_name: '', receipt_number: '' });
		setReceiptFile(null);
	}

	async function handleCreate() {
		if (!org || !form.title || !form.amount) return;
		setCreating(true);
		try {
			const res = await apiFetch(`/payments/`, {
				method: 'POST', orgId: org.id,
				body: JSON.stringify({ ...form, payment_type: createType }),
			});
			if (res.ok) {
				const created = await res.json().catch(() => null);
				if (receiptFile && created?.data?.id) {
					const fd = new FormData();
					fd.append('receipt', receiptFile);
					await apiFetch(`/payments/${created.data.id}/receipt/`, {
						method: 'POST', orgId: org.id, body: fd,
					});
				}
				setCreateOpen(false);
				resetForm();
				loadPayments(org.id, typeTab, statusFilter);
			}
		} finally {
			setCreating(false);
		}
	}

	async function handleStatusChange(payment: Payment, newStatus: string) {
		if (!org) return;
		const res = await apiFetch(`/payments/${payment.id}/`, {
			method: 'PATCH', orgId: org.id,
			body: JSON.stringify({ status: newStatus }),
		});
		if (res.ok) {
			setReviewOpen(false);
			setReviewPayment(null);
			loadPayments(org.id, typeTab, statusFilter);
		}
	}

	async function handleDelete(payment: Payment) {
		if (!org || !confirm('Delete this payment?')) return;
		await apiFetch(`/payments/${payment.id}/`, {
			method: 'DELETE', orgId: org.id,
		});
		loadPayments(org.id, typeTab, statusFilter);
	}

	if (loading && payments.length === 0) {
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
							<h1 className="text-2xl font-bold">Payments</h1>
							<p className="text-sm text-muted-foreground">
								Client payments received and employee expense submissions
							</p>
						</div>
					</div>

					<Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); if (!v) resetForm(); }}>
						<DialogTrigger asChild>
							<Button><Plus className="mr-2 h-4 w-4" />New Payment</Button>
						</DialogTrigger>
						<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Record Payment</DialogTitle>
								<DialogDescription>
									Record a client payment or submit an expense for reimbursement.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								{/* Type selector */}
								<div>
									<Label>Payment Type</Label>
									<div className="flex gap-2 mt-1">
										<Button
											type="button"
											variant={createType === 'client_payment' ? 'default' : 'outline'}
											size="sm"
											className="flex-1"
											onClick={() => setCreateType('client_payment')}
										>
											<CreditCard className="mr-2 h-4 w-4" />
											Client Payment
										</Button>
										<Button
											type="button"
											variant={createType === 'expense' ? 'default' : 'outline'}
											size="sm"
											className="flex-1"
											onClick={() => setCreateType('expense')}
										>
											<Wallet className="mr-2 h-4 w-4" />
											My Expense
										</Button>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										{createType === 'client_payment'
											? 'Record a payment received from a client.'
											: 'Submit an out-of-pocket expense for reimbursement.'}
									</p>
								</div>

								<FloatingLabelInput
									label="Title *"
									value={form.title}
									onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
								/>
								<FloatingLabelTextarea
									label="Description"
									value={form.description}
									onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
									rows={2}
								/>
								<div className="grid grid-cols-2 gap-4">
									<FloatingLabelInput
										label="Amount *"
										type="number"
										step="0.01"
										value={form.amount}
										onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
									/>
									<FloatingLabelInput
										label="Currency"
										value={form.currency}
										onChange={e => setForm(f => ({ ...f, currency: e.target.value.toUpperCase() }))}
										maxLength={3}
									/>
								</div>
								<FloatingLabelInput
									label="Date *"
									type="date"
									value={form.payment_date}
									onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
								/>
								{/* Expense-only fields */}
								{createType === 'expense' && (
									<>
										<FloatingLabelInput
											label="Vendor / Merchant"
											value={form.vendor_name}
											onChange={e => setForm(f => ({ ...f, vendor_name: e.target.value }))}
										/>
										<FloatingLabelInput
											label="Receipt / Invoice Number"
											value={form.receipt_number}
											onChange={e => setForm(f => ({ ...f, receipt_number: e.target.value }))}
										/>
									</>
								)}
								<div>
									<FloatingLabelInput
										label="Attach Receipt"
										type="file"
										accept="image/jpeg,image/png,image/webp,application/pdf"
										onChange={e => setReceiptFile(e.target.files?.[0] ?? null)}
										className="cursor-pointer"
									/>
									<p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP or PDF · max 10 MB</p>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
								<Button
									onClick={handleCreate}
									disabled={creating || !form.title || !form.amount || !form.payment_date}
								>
									{creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
									{createType === 'expense' ? 'Submit Expense' : 'Record Payment'}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{/* Type tabs */}
				<div className="flex gap-1 border-b">
					{TYPE_TABS.map(tab => {
						const Icon = tab.icon;
						return (
							<button
								key={tab.key}
								onClick={() => setTypeTab(tab.key)}
								className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${typeTab === tab.key
									? 'border-primary text-primary'
									: 'border-transparent text-muted-foreground hover:text-foreground'
									}`}
							>
								<Icon className="h-4 w-4" />
								{tab.label}
							</button>
						);
					})}
				</div>

				{/* Status filter */}
				<div className="flex items-center gap-3">
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							{STATUS_CHOICES.map(s => (
								<SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
							))}
						</SelectContent>
					</Select>
					{loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
				</div>

				{/* Table */}
				{payments.length === 0 ? (
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-12 text-center">
							<Receipt className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="font-semibold text-lg">No payments found</h3>
							<p className="text-sm text-muted-foreground mt-1">
								{typeTab === 'client_payment'
									? 'No client payments recorded yet.'
									: typeTab === 'expense'
										? 'No expenses submitted yet.'
										: 'No payment records yet.'}
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
											{typeTab === 'all' && <TableHead>Type</TableHead>}
											<TableHead>Amount</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Submitted By</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{payments.map(payment => {
											const sb = STATUS_BADGE[payment.status] || STATUS_BADGE.pending;
											return (
												<TableRow key={payment.id}>
													<TableCell>
														<div>
															<p className="font-medium">{payment.title}</p>
															{payment.vendor_name && (
																<p className="text-xs text-muted-foreground">{payment.vendor_name}</p>
															)}
															{payment.description && (
																<p className="text-xs text-muted-foreground truncate max-w-xs">{payment.description}</p>
															)}
														</div>
													</TableCell>
													{typeTab === 'all' && (
														<TableCell>
															<Badge variant="outline" className="text-xs whitespace-nowrap">
																{payment.payment_type === 'client_payment' ? 'Client' : 'Expense'}
															</Badge>
														</TableCell>
													)}
													<TableCell className="font-mono whitespace-nowrap">
														{payment.currency} {parseFloat(payment.amount as unknown as string).toLocaleString()}
													</TableCell>
													<TableCell className="text-sm whitespace-nowrap">{payment.payment_date}</TableCell>
													<TableCell className="text-sm">{payment.created_by_name}</TableCell>
													<TableCell>
														<Badge className={sb.color} variant="secondary">{sb.label}</Badge>
													</TableCell>
													<TableCell>
														<div className="flex gap-1">
															{payment.status === 'pending' && (
																<Button
																	variant="ghost" size="sm"
																	onClick={() => { setReviewPayment(payment); setReviewOpen(true); }}
																>
																	Review
																</Button>
															)}
															{payment.status === 'approved' && (
																<Button
																	variant="ghost" size="sm"
																	onClick={() => handleStatusChange(payment, 'paid')}
																>
																	<DollarSign className="mr-1 h-3 w-3" />Mark Paid
																</Button>
															)}
															{payment.status === 'pending' && (
																<Button
																	variant="ghost" size="sm"
																	onClick={() => handleDelete(payment)}
																	className="text-destructive hover:text-destructive"
																>
																	Delete
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

				{/* Review / approve-reject dialog */}
				<Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Review Payment</DialogTitle>
							<DialogDescription>
								{reviewPayment && `${reviewPayment.title} — ${reviewPayment.currency} ${parseFloat(reviewPayment.amount as unknown as string).toLocaleString()}`}
							</DialogDescription>
						</DialogHeader>
						{reviewPayment?.description && (
							<p className="text-sm text-muted-foreground py-2">{reviewPayment.description}</p>
						)}
						<DialogFooter className="gap-2">
							<Button
								variant="destructive"
								onClick={() => reviewPayment && handleStatusChange(reviewPayment, 'rejected')}
								disabled={reviewing}
							>
								<XCircle className="mr-2 h-4 w-4" />Reject
							</Button>
							<Button
								onClick={() => reviewPayment && handleStatusChange(reviewPayment, 'approved')}
								disabled={reviewing}
							>
								{reviewing
									? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
									: <CheckCircle className="mr-2 h-4 w-4" />
								}
								Approve
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
