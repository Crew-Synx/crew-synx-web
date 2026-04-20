'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	Loader2, ArrowLeft, Pencil, Save, X,
	Phone, Briefcase, CreditCard, Shield, QrCode,
} from 'lucide-react';
import type { Employee, Organization } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseItemResponse, EmployeeSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

export default function EmployeeDetailPage() {
	const router = useRouter();
	const params = useParams();
	const memberId = params.id as string;
	const qrCanvasRef = useRef<HTMLCanvasElement>(null);

	const [org, setOrg] = useState<Organization | null>(null);
	const [employee, setEmployee] = useState<Employee | null>(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [editForm, setEditForm] = useState<Record<string, string>>({});

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
						<Button variant="outline" onClick={startEdit}>
							<Pencil className="mr-2 h-4 w-4" />Edit Profile
						</Button>
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
									<div>
										<Label className="text-xs">Phone</Label>
										<Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
									</div>
									<div>
										<Label className="text-xs">Address Line 1</Label>
										<Input value={editForm.address_line1} onChange={e => setEditForm(f => ({ ...f, address_line1: e.target.value }))} />
									</div>
									<div>
										<Label className="text-xs">Address Line 2</Label>
										<Input value={editForm.address_line2} onChange={e => setEditForm(f => ({ ...f, address_line2: e.target.value }))} />
									</div>
									<div className="grid grid-cols-2 gap-2">
										<div>
											<Label className="text-xs">City</Label>
											<Input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))} />
										</div>
										<div>
											<Label className="text-xs">State</Label>
											<Input value={editForm.state} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))} />
										</div>
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
