'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Loader2, Shield,
	Plus, Trash2, Check, Rocket, Copy,
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

	// Data
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
	const [applying, setApplying] = useState<string | null>(null);
	const [creating, setCreating] = useState(false);
	const [newRole, setNewRole] = useState('');
	const [saving, setSaving] = useState(false);
	const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

	const handleApplyTemplate = async (templateName: string) => {
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

	const nonOwnerRoles = roles.filter(r => r.name !== 'Owner');

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold flex items-center gap-2">
					<Shield className="h-5 w-5 text-primary" />
					Roles
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Pick from templates below or create your own. Templates are copied into your org — you can rename or edit them later.
				</p>
			</div>

			{/* Role Templates */}
			<div>
				<p className="text-sm font-medium mb-3">Templates</p>
				{templates.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-6 rounded-lg border border-dashed border-border/50 text-center gap-3">
						<p className="text-sm text-muted-foreground">Templates could not be loaded.</p>
						<Button variant="outline" size="sm" onClick={onReload}>
							<Loader2 className="mr-2 h-3.5 w-3.5" /> Retry
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{templates.map(t => {
							const applied = t.already_applied || nonOwnerRoles.some(r => r.name === t.name);
							return (
								<div
									key={t.name}
									className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${applied
										? 'bg-primary/5 border-primary/20'
										: 'bg-muted/30 border-border/50 hover:border-border'
										}`}
								>
									<div className="flex-1 min-w-0 mr-3">
										<p className="font-medium text-sm">{t.name}</p>
										<p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
									</div>
									{applied ? (
										<Badge variant="secondary" className="shrink-0 text-xs gap-1">
											<Check className="h-3 w-3" /> Added
										</Badge>
									) : (
										<Button
											size="sm"
											variant="outline"
											className="shrink-0"
											disabled={applying === t.name}
											onClick={() => handleApplyTemplate(t.name)}
										>
											{applying === t.name ? (
												<Loader2 className="h-3.5 w-3.5 animate-spin" />
											) : (
												<>
													<Copy className="mr-1.5 h-3.5 w-3.5" />
													Use
												</>
											)}
										</Button>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Applied roles list */}
			{nonOwnerRoles.length > 0 && (
				<div>
					<p className="text-sm font-medium mb-3">Your Roles</p>
					<div className="flex flex-wrap gap-2">
						{roles.map(role => {
							const isOwner = role.name === 'Owner';
							return (
								<div key={role.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${isOwner ? 'bg-primary/5 border-primary/20 text-primary' : 'border-border'
									}`}>
									<span className="font-medium">{role.name}</span>
									{isOwner && <span className="text-xs opacity-60">you</span>}
									{!isOwner && (
										<button
											type="button"
											onClick={() => handleDelete(role.id)}
											disabled={deletingRoleId === role.id}
											className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
										>
											{deletingRoleId === role.id
												? <Loader2 className="h-3 w-3 animate-spin" />
												: <span className="text-xs leading-none">&times;</span>
											}
										</button>
									)}
								</div>
							);
						})}
					</div>
					<p className="text-xs text-muted-foreground mt-2">You can edit role permissions from Settings after setup.</p>
				</div>
			)}

			{/* Add custom role */}
			{creating ? (
				<div className="flex items-center gap-2">
					<Input
						placeholder="Custom role name"
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
				<Button variant="outline" onClick={() => setCreating(true)}>
					<Plus className="mr-2 h-4 w-4" />
					Create Custom Role
				</Button>
			)}
		</div>
	);
}
