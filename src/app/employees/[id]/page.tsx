'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

import {
	Loader2, ArrowLeft, Pencil, Save, X,
	Phone, Briefcase, CreditCard, Shield, QrCode,
	CalendarCheck, DollarSign, LayoutDashboard,
} from 'lucide-react';
import type { Employee, Organization, Attendance, Payment } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseItemResponse, parseListResponse, EmployeeSchema, AttendanceSchema, PaymentSchema } from '@/lib/schemas';
import { useAppContext } from '@/components/app-shell';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

// ── Attendance status badge ──────────────────────────────────────────────────
function attStatusBadge(status: string) {
	const map: Record<string, string> = {
		present: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
		absent: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
		late: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
		half_day: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
		leave: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
	};
	return (
		<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] || 'bg-muted text-muted-foreground'}`}>
			{status.replace('_', ' ')}
		</span>
	);
}

// ── Payment status badge ─────────────────────────────────────────────────────
const PAYMENT_STATUS: Record<string, { color: string; label: string }> = {
	pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Pending' },
	approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Approved' },
	rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Rejected' },
	paid: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Paid' },
};

export default function EmployeeDetailPage() {
	const router = useRouter();
	const params = useParams();
	const memberId = params.id as string;
	const qrCanvasRef = useRef<HTMLCanvasElement>(null);
	const { userRole } = useAppContext();

	const [org, setOrg] = useState<Organization | null>(null);
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editForm, setEditForm] = useState<Record<string, string>>({});

	// Quick-view sheet
	const [quickViewOpen, setQuickViewOpen] = useState(false);
	const [attendance, setAttendance] = useState<Attendance[]>([]);
	const [payments, setPayments] = useState<Payment[]>([]);
	const [quickLoading, setQuickLoading] = useState(false);
	const [attendanceMonth, setAttendanceMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
	});

	// Manager if role priority ≤ 3 (same threshold as backend _can_view_all)
	const isManager = (userRole?.priority ?? 999) <= 3;

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
		loadEmployee(o.id);
	}, [router, memberId]);

	async function loadEmployee(orgId: string) {
		setLoading(true);
		try {
			const res = await apiFetch(`/organizations/${orgId}/employees/${memberId}/`, { orgId });
			if (res.ok) {
				const data = await res.json().catch(() => ({ data: null }));
				const emp = parseItemResponse(EmployeeSchema, data);
				setEmployee(emp as unknown as Employee);
			} else {
				router.push('/employees');
			}
		} finally {
			setLoading(false);
		}
	}

	const loadQuickViewData = useCallback(async (emp: Employee, orgId: string, month: string) => {
		setQuickLoading(true);
		try {
			const [attRes, payRes] = await Promise.all([
				apiFetch(`/attendance/?user_id=${emp.user}&month=${month}`, { orgId }),
				apiFetch(`/payments/?user_id=${emp.user}`, { orgId }),
			]);
			if (attRes.ok) {
				const d = await attRes.json().catch(() => ({ data: [] }));
				setAttendance(parseListResponse(AttendanceSchema, d) as unknown as Attendance[]);
			}
			if (payRes.ok) {
				const d = await payRes.json().catch(() => ({ data: [] }));
				setPayments(parseListResponse(PaymentSchema, d) as unknown as Payment[]);
			}
		} finally {
			setQuickLoading(false);
		}
	}, []);

	// Reload attendance when month changes while sheet is open
	useEffect(() => {
		if (quickViewOpen && employee && org) {
			loadQuickViewData(employee, org.id, attendanceMonth);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [attendanceMonth, quickViewOpen]);

	// Render QR code onto the canvas when employee data loads
	useEffect(() => {
		const qrPayload = (employee as (Employee & { encrypted_qr_payload?: string }) | null)?.encrypted_qr_payload;
		if (!qrCanvasRef.current || !qrPayload) return;
		import('qrcode').then(QRCode => {
			QRCode.toCanvas(qrCanvasRef.current!, qrPayload, {
				width: 180,
				margin: 2,
				color: { dark: '#000000', light: '#ffffff' },
			});
		});
	}, [employee]);

	function startEdit() {
		if (!employee) return;
		setEditForm({
			phone: employee.phone || '',
			address_line1: employee.address_line1 || '',
			address_line2: employee.address_line2 || '',
			city: employee.city || '',
			state: employee.state || '',
			country: employee.country || '',
			postal_code: employee.postal_code || '',
			emergency_contact_name: employee.emergency_contact_name || '',
			emergency_contact_phone: employee.emergency_contact_phone || '',
			emergency_contact_relation: employee.emergency_contact_relation || '',
		});
		setEditing(true);
	}

	async function handleSave() {
		if (!org) return;
		setSaving(true);
		try {
			const res = await apiFetch(`/organizations/${org.id}/employees/${memberId}/`, {
				method: 'PATCH', orgId: org.id,
				body: JSON.stringify(editForm),
			});
			if (res.ok) {
				setEditing(false);
				loadEmployee(org.id);
			}
		} finally {
			setSaving(false);
		}
	}

	if (loading || !employee) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	const statusColor: Record<string, string> = {
		active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		terminated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
		on_notice: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-4xl p-6 space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Button variant="ghost" size="icon" asChild>
							<Link href="/employees"><ArrowLeft className="h-4 w-4" /></Link>
						</Button>
						<div>
							<div className="flex items-center gap-3">
								<h1 className="text-2xl font-bold">{employee.user_name}</h1>
								<Badge className={statusColor[employee.status] || ''} variant="secondary">
									{employee.status}
								</Badge>
							</div>

						</div>
					</div>
					{!editing ? (
						<div className="flex gap-2">
							{isManager && (
								<Button
									variant="outline"
									onClick={() => {
										setQuickViewOpen(true);
										if (employee && org) loadQuickViewData(employee, org.id, attendanceMonth);
									}}
								>
									<LayoutDashboard className="mr-2 h-4 w-4" />Quick View
								</Button>
							)}
							<Button variant="outline" onClick={startEdit}>
								<Pencil className="mr-2 h-4 w-4" />Edit Profile
							</Button>
						</div>
					) : (
						<div className="flex gap-2">
							<Button variant="outline" onClick={() => setEditing(false)}>
								<X className="mr-2 h-4 w-4" />Cancel
							</Button>
							<Button onClick={handleSave} disabled={saving}>
								{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
								Save
							</Button>
						</div>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Employment Info */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Briefcase className="h-4 w-4" />Employment
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<InfoRow label="Email" value={employee.user_email} />
							<InfoRow label="Role" value={employee.role_name} />
							<InfoRow label="Employment Type" value={employee.employment_type} />
							<InfoRow label="Joining Date" value={employee.joining_date} />
						</CardContent>
					</Card>

					{/* Employee QR Code */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<QrCode className="h-4 w-4" />Employee QR Code
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col items-center gap-3">
							<canvas ref={qrCanvasRef} className="rounded-md border" />
							<p className="text-xs text-muted-foreground text-center">
								This QR is encrypted. Only an admin scanner can read the employee data —
								regular QR scanners will see gibberish.
							</p>

						</CardContent>
					</Card>

					{/* Personal Info */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Phone className="h-4 w-4" />Personal Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							{editing ? (
								<>
									<FloatingLabelInput label="Phone" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
									<FloatingLabelInput label="Address Line 1" value={editForm.address_line1} onChange={e => setEditForm(f => ({ ...f, address_line1: e.target.value }))} />
									<FloatingLabelInput label="Address Line 2" value={editForm.address_line2} onChange={e => setEditForm(f => ({ ...f, address_line2: e.target.value }))} />
									<div className="grid grid-cols-2 gap-2">
										<FloatingLabelInput label="City" value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} />
										<FloatingLabelInput label="State" value={editForm.state} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))} />
									</div>
								</>
							) : (
								<>
									<InfoRow label="Phone" value={employee.phone} />
									<InfoRow label="Date of Birth" value={employee.date_of_birth} />
									<InfoRow label="Gender" value={employee.gender} />
									{(employee.address_line1 || employee.city) && (
										<div>
											<p className="text-muted-foreground text-xs">Address</p>
											<p>
												{[employee.address_line1, employee.address_line2, employee.city, employee.state, employee.country, employee.postal_code]
													.filter(Boolean).join(', ')}
											</p>
										</div>
									)}
								</>
							)}
						</CardContent>
					</Card>

					{/* Emergency Contact */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-4 w-4" />Emergency Contact
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							{editing ? (
								<>
									<FloatingLabelInput label="Name" value={editForm.emergency_contact_name} onChange={e => setEditForm(f => ({ ...f, emergency_contact_name: e.target.value }))} />
									<FloatingLabelInput label="Phone" value={editForm.emergency_contact_phone} onChange={e => setEditForm(f => ({ ...f, emergency_contact_phone: e.target.value }))} />
									<FloatingLabelInput label="Relation" value={editForm.emergency_contact_relation} onChange={e => setEditForm(f => ({ ...f, emergency_contact_relation: e.target.value }))} />
								</>
							) : (
								<>
									<InfoRow label="Name" value={employee.emergency_contact_name} />
									<InfoRow label="Phone" value={employee.emergency_contact_phone} />
									<InfoRow label="Relation" value={employee.emergency_contact_relation} />
								</>
							)}
						</CardContent>
					</Card>

					{/* Compensation */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CreditCard className="h-4 w-4" />Compensation
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<InfoRow label="Base Salary" value={employee.base_salary ? `${employee.salary_currency || 'INR'} ${parseFloat(employee.base_salary).toLocaleString()}` : undefined} />
							<InfoRow label="Salary Type" value={employee.salary_type} />
							<Separator />
							<InfoRow label="Bank" value={employee.bank_name} />
							<InfoRow label="Account" value={employee.bank_account_number ? `****${employee.bank_account_number.slice(-4)}` : undefined} />
							<InfoRow label="IFSC" value={employee.bank_ifsc_code} />
							<Separator />
							<InfoRow label="PAN" value={employee.pan_number} />
							<InfoRow label="UAN" value={employee.uan_number} />
						</CardContent>
					</Card>
				</div>
			</div>

			{/* ── Manager Quick View Sheet ─────────────────────────────── */}
			{isManager && (
				<Sheet open={quickViewOpen} onOpenChange={setQuickViewOpen}>
					<SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
						<SheetHeader className="mb-4">
							<SheetTitle className="flex items-center gap-2">
								<LayoutDashboard className="h-4 w-4" />
								{employee.user_name} — Quick View
							</SheetTitle>
						</SheetHeader>

						{quickLoading ? (
							<div className="flex items-center justify-center py-16">
								<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
							</div>
						) : (
							<Tabs defaultValue="attendance">
								<TabsList className="w-full mb-4">
									<TabsTrigger value="attendance" className="flex-1">
										<CalendarCheck className="mr-2 h-4 w-4" />Attendance
									</TabsTrigger>
									<TabsTrigger value="payments" className="flex-1">
										<DollarSign className="mr-2 h-4 w-4" />Payments
									</TabsTrigger>
								</TabsList>

								{/* ── Attendance Tab ── */}
								<TabsContent value="attendance" className="space-y-4">
									<div className="flex items-center gap-2">
										<label className="text-sm font-medium text-muted-foreground">Month</label>
										<input
											type="month"
											className="border rounded-md px-3 py-1.5 text-sm bg-background"
											value={attendanceMonth}
											onChange={e => setAttendanceMonth(e.target.value)}
										/>
									</div>

									{/* Stats row */}
									{attendance.length > 0 && (() => {
										const counts = attendance.reduce<Record<string, number>>((acc, r) => {
											acc[r.status] = (acc[r.status] || 0) + 1;
											return acc;
										}, {});
										return (
											<div className="grid grid-cols-3 gap-3">
												{[
													{ label: 'Present', key: 'present', color: 'text-green-600' },
													{ label: 'Absent', key: 'absent', color: 'text-red-600' },
													{ label: 'Late', key: 'late', color: 'text-yellow-600' },
												].map(s => (
													<div key={s.key} className="rounded-lg border p-3 text-center">
														<div className={`text-2xl font-bold ${s.color}`}>{counts[s.key] || 0}</div>
														<div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
													</div>
												))}
											</div>
										);
									})()}

									{attendance.length === 0 ? (
										<p className="text-sm text-muted-foreground text-center py-8">No attendance records for this month.</p>
									) : (
										<div className="rounded-md border overflow-hidden">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>Date</TableHead>
														<TableHead>Status</TableHead>
														<TableHead>Check In</TableHead>
														<TableHead>Check Out</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{[...attendance].sort((a, b) => b.date.localeCompare(a.date)).map(r => (
														<TableRow key={r.id}>
															<TableCell className="text-sm">{r.date}</TableCell>
															<TableCell>{attStatusBadge(r.status)}</TableCell>
															<TableCell className="text-sm text-muted-foreground">{r.check_in_time?.slice(0, 5) || '—'}</TableCell>
															<TableCell className="text-sm text-muted-foreground">{r.check_out_time?.slice(0, 5) || '—'}</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									)}
								</TabsContent>

								{/* ── Payments Tab ── */}
								<TabsContent value="payments" className="space-y-4">
									{payments.length === 0 ? (
										<p className="text-sm text-muted-foreground text-center py-8">No payments found for this member.</p>
									) : (
										<>
											{/* Summary */}
											<div className="grid grid-cols-2 gap-3">
												{(['pending', 'approved', 'rejected', 'paid'] as const).map(s => {
													const total = payments
														.filter(p => p.status === s)
														.reduce((sum, p) => sum + parseFloat(p.amount), 0);
													const { color, label } = PAYMENT_STATUS[s];
													return total > 0 ? (
														<div key={s} className={`rounded-lg border p-3 ${color}`}>
															<div className="text-xs font-medium">{label}</div>
															<div className="text-lg font-bold">
																{payments.find(p => p.status === s)?.currency || 'INR'}{' '}
																{total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
															</div>
														</div>
													) : null;
												})}
											</div>

											<div className="rounded-md border overflow-hidden">
												<Table>
													<TableHeader>
														<TableRow>
															<TableHead>Title</TableHead>
															<TableHead>Amount</TableHead>
															<TableHead>Status</TableHead>
															<TableHead>Date</TableHead>
														</TableRow>
													</TableHeader>
													<TableBody>
														{[...payments].sort((a, b) => b.payment_date.localeCompare(a.payment_date)).map(p => (
															<TableRow key={p.id}>
																<TableCell className="text-sm font-medium max-w-40 truncate">{p.title}</TableCell>
																<TableCell className="text-sm">{p.currency} {parseFloat(p.amount).toLocaleString()}</TableCell>
																<TableCell>
																	<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS[p.status]?.color || 'bg-muted text-muted-foreground'}`}>
																		{PAYMENT_STATUS[p.status]?.label || p.status}
																	</span>
																</TableCell>
																<TableCell className="text-sm text-muted-foreground">{p.payment_date}</TableCell>
															</TableRow>
														))}
													</TableBody>
												</Table>
											</div>
										</>
									)}
								</TabsContent>
							</Tabs>
						)}
					</SheetContent>
				</Sheet>
			)}
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
	return (
		<div className="flex justify-between">
			<span className="text-muted-foreground">{label}</span>
			<span className="font-medium">{value || '-'}</span>
		</div>
	);
}
