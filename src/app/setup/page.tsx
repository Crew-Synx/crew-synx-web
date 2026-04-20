'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { Badge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Loader2, Shield, Plus, Trash2, Check, Rocket, LayoutTemplate,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

/* ─── Types ──────────────────────────────────────────────────────── */

interface Organization {
	id: string;
	name: string;
	slug: string;
}

interface RoleItem {
	id: string;
	name: string;
	priority: number;
	permissions?: string[];
}

interface RoleTemplate {
	name: string;
	description: string;
	priority: number;
	permissions: string[];
	already_applied: boolean;
}

/* ─── Main Page ──────────────────────────────────────────────────── */

export default function SetupPage() {
	const router = useRouter();
	const [org, setOrg] = useState<Organization | null>(null);
	const [loading, setLoading] = useState(true);
	const [initError, setInitError] = useState<string | null>(null);

	const [roles, setRoles] = useState<RoleItem[]>([]);
	const [templates, setTemplates] = useState<RoleTemplate[]>([]);

	const loadAllData = useCallback(async (orgId: string) => {
		const [rolesRes, templatesRes] = await Promise.all([
			apiFetch('/roles/', { orgId }).catch(() => null),
			apiFetch('/roles/templates/', { orgId }).catch(() => null),
		]);
		if (rolesRes?.ok) { const d = await rolesRes.json().catch(() => ({})); setRoles(d.data || []); }
		if (templatesRes?.ok) { const d = await templatesRes.json().catch(() => ({})); setTemplates(d.data || []); }
	}, []);

	useEffect(() => {
		const init = async () => {
			try {
				const res = await apiFetch('/organizations/');
				if (!res.ok) { router.push('/auth/login'); return; }
				const data = await res.json().catch(() => ({}));
				let orgList = data.data || [];

				if (orgList.length === 0) {
					const cached = localStorage.getItem('selected_org');
					if (cached) {
						try { orgList = [JSON.parse(cached)]; } catch { /* ignore */ }
					}
				}

				if (orgList.length === 0) { router.push('/onboarding'); return; }
				const o = orgList[0];
				setOrg(o);
				localStorage.setItem('selected_org', JSON.stringify(o));
				await loadAllData(o.id);
			} catch (err: unknown) {
				setInitError(err instanceof Error ? err.message : 'Failed to load setup data');
				router.push('/auth/login');
			} finally {
				setLoading(false);
			}
		};
		init();
	}, [router, loadAllData]);

	const reloadRoles = useCallback(async () => {
		if (!org) return;
		const orgId = org.id;
		const [r, t] = await Promise.all([
			apiFetch('/roles/', { orgId }),
			apiFetch('/roles/templates/', { orgId }),
		]);
		if (r.ok) { const d = await r.json().catch(() => ({})); setRoles(d.data || []); }
		if (t.ok) { const d = await t.json().catch(() => ({})); setTemplates(d.data || []); }
	}, [org]);

	const finishSetup = () => {
		localStorage.setItem('setup_complete', 'true');
		router.push('/dashboard');
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!org) {
		if (initError) {
			return (
				<div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
					<p className="text-destructive font-semibold">{initError}</p>
					<Button onClick={() => router.push('/auth/login')}>Back to Login</Button>
				</div>
			);
		}
		return null;
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-2xl px-5 py-10 space-y-8">
				{/* Header */}
				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">Set up {org.name}</h1>
					<p className="text-sm text-muted-foreground">Configure your workspace roles — takes about a minute</p>
				</div>

				{/* Roles Step */}
				<Card>
					<CardContent className="p-6">
						<RolesStep
							orgId={org.id}
							roles={roles}
							templates={templates}
							onReload={reloadRoles}
						/>
					</CardContent>
				</Card>

				{/* Navigation */}
				<div className="flex items-center justify-between">
					<Button variant="ghost" onClick={finishSetup} className="text-muted-foreground">
						Skip setup
					</Button>
					<Button onClick={finishSetup}>
						<Rocket className="mr-2 h-4 w-4" />
						Go to Dashboard
					</Button>
				</div>
			</div>
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════════
	 ROLES STEP
	 ═══════════════════════════════════════════════════════════════════ */

function RolesStep({ orgId, roles, templates, onReload }: {
	orgId: string; roles: RoleItem[]; templates: RoleTemplate[]; onReload: () => void;
}) {
	const [creating, setCreating] = useState(false);
	const [newRole, setNewRole] = useState('');
	const [saving, setSaving] = useState(false);
	const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
	const [templateModalOpen, setTemplateModalOpen] = useState(false);

	const handleCreateCustom = async () => {
		if (!newRole.trim()) return;
		setSaving(true);
		try {
			const res = await apiFetch('/roles/', {
				method: 'POST', orgId,
				body: JSON.stringify({ name: newRole.trim() }),
			});
			if (res.ok) {
				setNewRole('');
				setCreating(false);
				onReload();
			}
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (roleId: string) => {
		setDeletingRoleId(roleId);
		try {
			await apiFetch(`/roles/${roleId}/`, { method: 'DELETE', orgId });
			onReload();
		} finally {
			setDeletingRoleId(null);
		}
	};

	return (
		<div className="space-y-6">
			{/* Section header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="text-base font-semibold flex items-center gap-2">
						<Shield className="h-4 w-4 text-primary" />
						Roles
					</h2>
					<p className="text-sm text-muted-foreground mt-0.5">
						Define who can do what in your organization.
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="shrink-0"
					onClick={() => setTemplateModalOpen(true)}
				>
					<LayoutTemplate className="mr-2 h-3.5 w-3.5" />
					Add from template
				</Button>
			</div>

			{/* Roles list */}
			{roles.length === 0 ? (
				<div className="rounded-lg border border-dashed border-border/50 py-8 text-center">
					<p className="text-sm text-muted-foreground">No roles yet. Add one from a template or create your own.</p>
				</div>
			) : (
				<div className="space-y-2">
					{roles.map(role => {
						const isOwner = role.name === 'Owner';
						const perms = role.permissions ?? [];
						return (
							<div
								key={role.id}
								className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/20 px-4 py-3"
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium">{role.name}</span>
										{isOwner && (
											<Badge variant="secondary" className="text-xs">you</Badge>
										)}
									</div>
									{perms.length > 0 && (
										<div className="flex flex-wrap gap-1 mt-2">
											{perms.map(p => (
												<span
													key={p}
													className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground font-mono"
												>
													{p}
												</span>
											))}
										</div>
									)}
								</div>
								{!isOwner && (
									<button
										type="button"
										onClick={() => handleDelete(role.id)}
										disabled={deletingRoleId === role.id}
										className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
									>
										{deletingRoleId === role.id
											? <Loader2 className="h-4 w-4 animate-spin" />
											: <Trash2 className="h-4 w-4" />
										}
									</button>
								)}
							</div>
						);
					})}
				</div>
			)}

			{/* Create custom role */}
			{creating ? (
				<div className="flex items-center gap-2">
					<FloatingLabelInput
						label="Role name"
						value={newRole}
						onChange={e => setNewRole(e.target.value)}
						onKeyDown={e => e.key === 'Enter' && handleCreateCustom()}
						autoFocus
					/>
					<Button onClick={handleCreateCustom} disabled={saving || !newRole.trim()}>
						{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
					</Button>
					<Button variant="ghost" onClick={() => { setCreating(false); setNewRole(''); }}>
						Cancel
					</Button>
				</div>
			) : (
				<Button variant="ghost" size="sm" onClick={() => setCreating(true)} className="text-muted-foreground">
					<Plus className="mr-2 h-3.5 w-3.5" />
					Create custom role
				</Button>
			)}

			{/* Template modal */}
			<TemplateModal
				open={templateModalOpen}
				onClose={() => setTemplateModalOpen(false)}
				templates={templates}
				roles={roles}
				orgId={orgId}
				onReload={onReload}
			/>
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════════
	 TEMPLATE MODAL
	 ═══════════════════════════════════════════════════════════════════ */

function TemplateModal({ open, onClose, templates, roles, orgId, onReload }: {
	open: boolean;
	onClose: () => void;
	templates: RoleTemplate[];
	roles: RoleItem[];
	orgId: string;
	onReload: () => void;
}) {
	const [applying, setApplying] = useState<string | null>(null);

	const handleApply = async (templateName: string) => {
		setApplying(templateName);
		try {
			const res = await apiFetch('/roles/templates/apply/', {
				method: 'POST', orgId,
				body: JSON.stringify({ template: templateName }),
			});
			if (res.ok) onReload();
		} finally {
			setApplying(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
			<DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Role templates</DialogTitle>
					<p className="text-sm text-muted-foreground">
						Templates are copied into your org — you can edit permissions later.
					</p>
				</DialogHeader>

				<div className="space-y-2 mt-2">
					{templates.map(t => {
						const applied = t.already_applied || roles.some(r => r.name === t.name);
						return (
							<div
								key={t.name}
								className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${applied
									? 'bg-primary/5 border-primary/20'
									: 'bg-muted/20 border-border/50'
									}`}
							>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium">{t.name}</p>
									<p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
									{t.permissions.length > 0 && (
										<div className="flex flex-wrap gap-1 mt-2">
											{t.permissions.map(p => (
												<span
													key={p}
													className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground font-mono"
												>
													{p}
												</span>
											))}
										</div>
									)}
								</div>
								<div className="shrink-0 mt-0.5">
									{applied ? (
										<span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
											<Check className="h-3.5 w-3.5" /> Added
										</span>
									) : (
										<Button
											size="sm"
											variant="outline"
											disabled={applying === t.name}
											onClick={() => handleApply(t.name)}
										>
											{applying === t.name
												? <Loader2 className="h-3.5 w-3.5 animate-spin" />
												: 'Add'
											}
										</Button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}
