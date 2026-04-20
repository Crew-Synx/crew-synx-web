'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Loader2, ArrowLeft, QrCode, ScanLine, Clock, MapPin,
	CheckCircle, XCircle, Send, Calendar, Video,
} from 'lucide-react';
import type { Organization, Attendance, RemoteCheckInRequest } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { parseListResponse, AttendanceSchema, RemoteCheckInRequestSchema } from '@/lib/schemas';

function getSelectedOrg(): Organization | null {
	if (typeof window === 'undefined') return null;
	const stored = localStorage.getItem('selected_org');
	return stored ? JSON.parse(stored) : null;
}

function statusBadge(status: string) {
	const map: Record<string, string> = {
		present: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
		absent: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
		late: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
		half_day: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
		leave: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
		pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
		approved: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
		rejected: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
	};
	return (
		<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] || 'bg-muted text-muted-foreground'}`}>
			{status.replace('_', ' ')}
		</span>
	);
}

function checkInMethodLabel(method?: string) {
	const map: Record<string, string> = {
		self: 'Self',
		qr_scan: 'QR Scan',
		manager_mark: 'Manager',
		remote_approved: 'Remote',
	};
	return method ? (map[method] || method) : '-';
}

export default function AttendancePage() {
	const router = useRouter();
	const [org, setOrg] = useState<Organization | null>(null);
	const [records, setRecords] = useState<Attendance[]>([]);
	const [remoteRequests, setRemoteRequests] = useState<RemoteCheckInRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [remoteLoading, setRemoteLoading] = useState(true);
	const [selectedMonth, setSelectedMonth] = useState(() => {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
	});

	// QR Scanner
	const [scanOpen, setScanOpen] = useState(false);
	const [scanning, setScanning] = useState(false);
	const [scanResult, setScanResult] = useState<string | null>(null);
	const [scanError, setScanError] = useState<string | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Manual QR token input (fallback)
	const [manualToken, setManualToken] = useState('');
	const [submittingQr, setSubmittingQr] = useState(false);

	// Remote request dialog
	const [remoteCreateOpen, setRemoteCreateOpen] = useState(false);
	const [remoteReason, setRemoteReason] = useState('');
	const [remoteLocation, setRemoteLocation] = useState('');
	const [creatingRemote, setCreatingRemote] = useState(false);

	// Review dialog
	const [reviewOpen, setReviewOpen] = useState(false);
	const [reviewRequest, setReviewRequest] = useState<RemoteCheckInRequest | null>(null);
	const [reviewNote, setReviewNote] = useState('');
	const [reviewing, setReviewing] = useState(false);

	// Check-in/out
	const [checkingIn, setCheckingIn] = useState(false);
	const [checkingOut, setCheckingOut] = useState(false);

	useEffect(() => {
		const o = getSelectedOrg();
		if (!o) { router.push('/dashboard'); return; }
		setOrg(o);
	}, [router]);

	const loadAttendance = useCallback(async () => {
		if (!org) return;
		setLoading(true);
		try {
			const res = await apiFetch(`/attendance/?month=${selectedMonth}`, { orgId: org.id });
			if (res.ok) {
				const data = await res.json().catch(() => ({ data: [] }));
				setRecords(parseListResponse(AttendanceSchema, data));
			}
		} catch { /* silent */ }
		finally { setLoading(false); }
	}, [org, selectedMonth]);

	const loadRemoteRequests = useCallback(async () => {
		if (!org) return;
		setRemoteLoading(true);
		try {
			const res = await apiFetch('/attendance/remote-requests/', { orgId: org.id });
			if (res.ok) {
				const data = await res.json().catch(() => ({ data: [] }));
				setRemoteRequests(parseListResponse(RemoteCheckInRequestSchema, data));
			}
		} catch { /* silent */ }
		finally { setRemoteLoading(false); }
	}, [org]);

	useEffect(() => {
		if (org) { loadAttendance(); loadRemoteRequests(); }
	}, [org, loadAttendance, loadRemoteRequests]);

	// ─── Check In / Out ────────────────────────────────────────────

	async function handleCheckIn() {
		if (!org) return;
		setCheckingIn(true);
		try {
			const body: Record<string, number> = {};
			if ('geolocation' in navigator) {
				try {
					const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
						navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, enableHighAccuracy: true })
					);
					body.latitude = pos.coords.latitude;
					body.longitude = pos.coords.longitude;
				} catch { /* location unavailable, proceed without */ }
			}
			const res = await apiFetch('/attendance/check-in/', {
				method: 'POST', orgId: org.id, body: JSON.stringify(body),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error || 'Check-in failed');
			}
			loadAttendance();
		} catch (e: any) {
			alert(e.message);
		} finally { setCheckingIn(false); }
	}

	async function handleCheckOut() {
		if (!org) return;
		setCheckingOut(true);
		try {
			const res = await apiFetch('/attendance/check-out/', {
				method: 'POST', orgId: org.id, body: JSON.stringify({}),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error || 'Check-out failed');
			}
			loadAttendance();
		} catch (e: any) {
			alert(e.message);
		} finally { setCheckingOut(false); }
	}

	// ─── QR Scanner ────────────────────────────────────────────────

	async function startCamera() {
		setScanResult(null);
		setScanError(null);
		setScanning(true);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play();
			}
			// Start scanning frames using BarcodeDetector if available
			if ('BarcodeDetector' in window) {
				const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
				scanIntervalRef.current = setInterval(async () => {
					if (!videoRef.current || videoRef.current.readyState !== 4) return;
					try {
						const barcodes = await detector.detect(videoRef.current);
						if (barcodes.length > 0) {
							const token = barcodes[0].rawValue;
							stopCamera();
							await submitQrToken(token);
						}
					} catch { /* ignore frame errors */ }
				}, 300);
			} else {
				// Fallback: no BarcodeDetector, user must enter token manually
				setScanError('Camera QR scanning is not supported in this browser. Please enter the QR token manually below.');
				stopCamera();
			}
		} catch {
			setScanError('Could not access camera. Please enter the QR token manually.');
			setScanning(false);
		}
	}

	function stopCamera() {
		if (scanIntervalRef.current) {
			clearInterval(scanIntervalRef.current);
			scanIntervalRef.current = null;
		}
		if (streamRef.current) {
			streamRef.current.getTracks().forEach(t => t.stop());
			streamRef.current = null;
		}
		setScanning(false);
	}

	async function submitQrToken(token: string) {
		if (!org || !token.trim()) return;
		setSubmittingQr(true);
		setScanError(null);
		try {
			const res = await apiFetch('/attendance/qr-check-in/', {
				method: 'POST', orgId: org.id,
				body: JSON.stringify({ qr_code_token: token.trim() }),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error || 'QR check-in failed');
			}
			const data = await res.json().catch(() => ({ data: {} }));
			setScanResult(`Checked in ${data.data?.user_name || 'employee'} successfully!`);
			setManualToken('');
			loadAttendance();
		} catch (e: any) {
			setScanError(e.message);
		} finally { setSubmittingQr(false); }
	}

	// ─── Remote Check-In Requests ──────────────────────────────────

	async function handleCreateRemote(e: React.FormEvent) {
		e.preventDefault();
		if (!org) return;
		setCreatingRemote(true);
		try {
			const body: Record<string, string> = { reason: remoteReason };
			if (remoteLocation) body.location_description = remoteLocation;
			const res = await apiFetch('/attendance/remote-requests/', {
				method: 'POST', orgId: org.id, body: JSON.stringify(body),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error || 'Failed to submit request');
			}
			setRemoteCreateOpen(false);
			setRemoteReason('');
			setRemoteLocation('');
			loadRemoteRequests();
		} catch (e: any) {
			alert(e.message);
		} finally { setCreatingRemote(false); }
	}

	async function handleReview(status: 'approved' | 'rejected') {
		if (!org || !reviewRequest) return;
		setReviewing(true);
		try {
			const body: Record<string, string> = { status };
			if (reviewNote) body.review_note = reviewNote;
			const res = await apiFetch(`/attendance/remote-requests/${reviewRequest.id}/review/`, {
				method: 'POST', orgId: org.id, body: JSON.stringify(body),
			});
			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.error || 'Review failed');
			}
			setReviewOpen(false);
			setReviewRequest(null);
			setReviewNote('');
			loadRemoteRequests();
		} catch (e: any) {
			alert(e.message);
		} finally { setReviewing(false); }
	}

	// ─── Cleanup ───────────────────────────────────────────────────

	useEffect(() => {
		return () => { stopCamera(); };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!org) return null;

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
				<div className="mx-auto max-w-6xl flex items-center gap-4 px-4 py-3">
					<Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<h1 className="text-lg font-semibold">Attendance</h1>
					<div className="flex-1" />
					<Button variant="outline" size="sm" onClick={handleCheckIn} disabled={checkingIn}>
						{checkingIn ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Clock className="h-4 w-4 mr-1" />}
						Check In
					</Button>
					<Button variant="outline" size="sm" onClick={handleCheckOut} disabled={checkingOut}>
						{checkingOut ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Clock className="h-4 w-4 mr-1" />}
						Check Out
					</Button>
				</div>
			</div>

			<div className="mx-auto max-w-6xl p-4 space-y-6">
				<Tabs defaultValue="records">
					<TabsList>
						<TabsTrigger value="records">
							<Calendar className="h-4 w-4 mr-1" /> Records
						</TabsTrigger>
						<TabsTrigger value="qr-scan">
							<QrCode className="h-4 w-4 mr-1" /> QR Scan
						</TabsTrigger>
						<TabsTrigger value="away-tickets">
							<MapPin className="h-4 w-4 mr-1" /> Away Tickets
							{remoteRequests.filter(r => r.status === 'pending').length > 0 && (
								<Badge variant="destructive" className="ml-1.5 h-5 min-w-5 px-1 text-[10px]">
									{remoteRequests.filter(r => r.status === 'pending').length}
								</Badge>
							)}
						</TabsTrigger>
					</TabsList>

					{/* ─── Records Tab ─────────────────────────────────── */}
					<TabsContent value="records" className="space-y-4">
						<div className="flex items-center gap-3">
							<FloatingLabelInput
								label="Month"
								type="month"
								value={selectedMonth}
								onChange={(e) => setSelectedMonth(e.target.value)}
								className="w-48"
							/>
							<Button variant="ghost" size="sm" onClick={loadAttendance}>
								Refresh
							</Button>
						</div>

						{loading ? (
							<div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>
						) : records.length === 0 ? (
							<Card>
								<CardContent className="flex flex-col items-center py-16 text-muted-foreground">
									<Clock className="h-10 w-10 mb-3" />
									<p className="font-medium">No attendance records</p>
									<p className="text-sm">Check in to start tracking</p>
								</CardContent>
							</Card>
						) : (
							<>
								{/* Stats */}
								<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
									{[
										{ label: 'Present', count: records.filter(r => r.status === 'present').length, color: 'text-green-600' },
										{ label: 'Absent', count: records.filter(r => r.status === 'absent').length, color: 'text-red-600' },
										{ label: 'Late', count: records.filter(r => r.status === 'late').length, color: 'text-yellow-600' },
										{ label: 'Leave', count: records.filter(r => r.status === 'leave').length, color: 'text-purple-600' },
										{ label: 'Total', count: records.length, color: 'text-blue-600' },
									].map(s => (
										<Card key={s.label}>
											<CardContent className="p-3 flex items-center gap-2">
												<span className={`text-lg font-bold ${s.color}`}>{s.count}</span>
												<span className="text-sm text-muted-foreground">{s.label}</span>
											</CardContent>
										</Card>
									))}
								</div>

								<Card>
									<div className="overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Date</TableHead>
													<TableHead>Name</TableHead>
													<TableHead>Status</TableHead>
													<TableHead>Method</TableHead>
													<TableHead>Check In</TableHead>
													<TableHead>Check Out</TableHead>
													<TableHead>Notes</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{records.map(r => (
													<TableRow key={r.id}>
														<TableCell className="font-medium">{r.date}</TableCell>
														<TableCell>{r.user_name}</TableCell>
														<TableCell>{statusBadge(r.status)}</TableCell>
														<TableCell className="text-xs text-muted-foreground">{checkInMethodLabel(r.check_in_method)}</TableCell>
														<TableCell>{r.check_in_time || '-'}</TableCell>
														<TableCell>{r.check_out_time || '-'}</TableCell>
														<TableCell className="text-xs text-muted-foreground max-w-32 truncate">{r.notes || ''}</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</Card>
							</>
						)}
					</TabsContent>

					{/* ─── QR Scan Tab ─────────────────────────────────── */}
					<TabsContent value="qr-scan" className="space-y-4">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<ScanLine className="h-5 w-5" />
									QR Attendance Scanner
								</CardTitle>
								<CardDescription>
									Scan an employee&apos;s QR code to mark their attendance. Requires attendance management permission.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Camera scanner */}
								<div className="space-y-3">
									{scanning ? (
										<div className="space-y-3">
											<div className="relative aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-black">
												<video
													ref={videoRef}
													className="w-full h-full object-cover"
													playsInline
													muted
												/>
												<div className="absolute inset-0 flex items-center justify-center">
													<div className="w-48 h-48 border-2 border-primary rounded-lg animate-pulse" />
												</div>
											</div>
											<canvas ref={canvasRef} className="hidden" />
											<Button variant="outline" className="w-full" onClick={stopCamera}>
												Stop Scanner
											</Button>
										</div>
									) : (
										<Button className="w-full" onClick={startCamera}>
											<Video className="h-4 w-4 mr-2" />
											Open Camera Scanner
										</Button>
									)}
								</div>

								{scanResult && (
									<div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900 p-3 text-sm text-green-700 dark:text-green-400">
										<CheckCircle className="h-4 w-4 shrink-0" />
										{scanResult}
									</div>
								)}

								{scanError && (
									<div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-400">
										<XCircle className="h-4 w-4 shrink-0" />
										{scanError}
									</div>
								)}

								{/* Manual token input */}
								<div className="border-t pt-4 space-y-3">
									<p className="text-sm text-muted-foreground">Or enter QR token manually</p>
									<div className="flex gap-2">
										<FloatingLabelInput
											label="Paste employee QR token"
											value={manualToken}
											onChange={(e) => setManualToken(e.target.value)}
											className="flex-1"
										/>
										<Button
											onClick={() => submitQrToken(manualToken)}
											disabled={submittingQr || !manualToken.trim()}
										>
											{submittingQr ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* ─── Away Tickets Tab ────────────────────────────── */}
					<TabsContent value="away-tickets" className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold">Remote Check-In Requests</h2>
								<p className="text-sm text-muted-foreground">Request or review check-in for remote/field work</p>
							</div>
							<Dialog open={remoteCreateOpen} onOpenChange={setRemoteCreateOpen}>
								<DialogTrigger asChild>
									<Button size="sm">
										<Send className="h-4 w-4 mr-1" /> New Request
									</Button>
								</DialogTrigger>
								<DialogContent className="max-h-[90vh] overflow-y-auto">
									<form onSubmit={handleCreateRemote}>
										<DialogHeader>
											<DialogTitle>Request Remote Check-In</DialogTitle>
											<DialogDescription>
												Submit a request to check in from outside the office. A manager will review it.
											</DialogDescription>
										</DialogHeader>
										<div className="space-y-4 py-4">
											<div className="space-y-2">
												<Label htmlFor="reason">Reason *</Label>
												<Textarea
													id="reason"
													value={remoteReason}
													onChange={(e) => setRemoteReason(e.target.value)}
													placeholder="e.g. Client site visit, working from home"
													required
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="location">Location description</Label>
												<Input
													id="location"
													value={remoteLocation}
													onChange={(e) => setRemoteLocation(e.target.value)}
													placeholder="e.g. Client office, 123 Main St"
												/>
											</div>
										</div>
										<DialogFooter>
											<Button type="button" variant="outline" onClick={() => setRemoteCreateOpen(false)}>
												Cancel
											</Button>
											<Button type="submit" disabled={creatingRemote || !remoteReason.trim()}>
												{creatingRemote ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
												Submit Request
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						</div>

						{remoteLoading ? (
							<div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>
						) : remoteRequests.length === 0 ? (
							<Card>
								<CardContent className="flex flex-col items-center py-16 text-muted-foreground">
									<MapPin className="h-10 w-10 mb-3" />
									<p className="font-medium">No away tickets</p>
									<p className="text-sm">Remote check-in requests will appear here</p>
								</CardContent>
							</Card>
						) : (
							<Card>
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Date</TableHead>
												<TableHead>Employee</TableHead>
												<TableHead>Reason</TableHead>
												<TableHead>Location</TableHead>
												<TableHead>Status</TableHead>
												<TableHead>Reviewed By</TableHead>
												<TableHead>Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{remoteRequests.map(req => (
												<TableRow key={req.id}>
													<TableCell className="font-medium">{req.date}</TableCell>
													<TableCell>{req.user_name}</TableCell>
													<TableCell className="max-w-48 truncate">{req.reason}</TableCell>
													<TableCell className="text-xs text-muted-foreground max-w-32 truncate">{req.location_description || '-'}</TableCell>
													<TableCell>{statusBadge(req.status)}</TableCell>
													<TableCell className="text-xs text-muted-foreground">{req.reviewer_name || '-'}</TableCell>
													<TableCell>
														{req.status === 'pending' && (
															<Button
																variant="outline"
																size="sm"
																onClick={() => {
																	setReviewRequest(req);
																	setReviewNote('');
																	setReviewOpen(true);
																}}
															>
																Review
															</Button>
														)}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</Card>
						)}

						{/* Review Dialog */}
						<Dialog open={reviewOpen} onOpenChange={(open) => { if (!open) { setReviewOpen(false); setReviewRequest(null); } }}>
							<DialogContent className="max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>Review Away Ticket</DialogTitle>
									<DialogDescription>
										{reviewRequest && (
											<>
												<strong>{reviewRequest.user_name}</strong> requested remote check-in for <strong>{reviewRequest.date}</strong>.
												<br />Reason: {reviewRequest.reason}
												{reviewRequest.location_description && (
													<><br />Location: {reviewRequest.location_description}</>
												)}
											</>
										)}
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4 py-4">
									<FloatingLabelTextarea
										id="reviewNote"
										label="Review note (optional)"
										value={reviewNote}
										onChange={(e) => setReviewNote(e.target.value)}
									/>
								</div>
								<DialogFooter className="gap-2">
									<Button
										variant="destructive"
										onClick={() => handleReview('rejected')}
										disabled={reviewing}
									>
										{reviewing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
										Reject
									</Button>
									<Button
										onClick={() => handleReview('approved')}
										disabled={reviewing}
									>
										{reviewing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
										Approve
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
