// ─── Permission helpers ──────────────────────────────────────────────
// Chat access is governed by channel membership, not role-based permissions.
// These categories must be excluded from every permission UI across the app.
export const CHAT_PERMISSION_CATEGORIES = new Set(['room', 'chat', 'slash_command']);

export interface Permission {
	id: string;
	key: string;
	description: string;
}

/** Filter a flat list of permissions, removing chat-related ones. */
export function filterDisplayPermissions(permissions: Permission[]): Permission[] {
	return permissions.filter(p => !CHAT_PERMISSION_CATEGORIES.has(p.key.split('.')[0]));
}

/** Group a filtered permission list by category prefix (e.g. "org", "member"). */
export function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
	return filterDisplayPermissions(permissions).reduce<Record<string, Permission[]>>((acc, p) => {
		const cat = p.key.split('.')[0];
		if (!acc[cat]) acc[cat] = [];
		acc[cat].push(p);
		return acc;
	}, {});
}

// ─── User & Auth ────────────────────────────────────────────────────

export interface UserData {
	id: string;
	email: string;
	name: string;
	avatar_url?: string | null;
}

// ─── Organization ───────────────────────────────────────────────────

export interface Organization {
	id: string;
	name: string;
	slug: string;
	invite_code?: string;
	avatar_url?: string | null;
	industry?: string;
	company_size?: string;
	website?: string;
	phone?: string;
	address_line1?: string;
	city?: string;
	state?: string;
	country?: string;
	default_currency?: string;
}

// ─── Role ───────────────────────────────────────────────────────────

export type AccessLevel = 'admin' | 'write' | 'read' | 'hide';

export interface ModuleAccess {
	level: AccessLevel;
	label: string;
}

export interface Role {
	id: string;
	name: string;
	priority: number;
	is_system?: boolean;
	access: Record<string, ModuleAccess>;
}

// ─── Employee / Organization Member ─────────────────────────────────

export interface Employee {
	id: string;
	user: string;
	user_email: string;
	user_name: string;
	user_avatar_url?: string | null;
	role?: string;
	role_name?: string;
	reporting_manager?: string;
	reporting_manager_name?: string;
	phone?: string;
	date_of_birth?: string;
	gender?: string;
	address_line1?: string;
	address_line2?: string;
	city?: string;
	state?: string;
	country?: string;
	postal_code?: string;
	emergency_contact_name?: string;
	emergency_contact_phone?: string;
	emergency_contact_relation?: string;
	employment_type: string;
	joining_date?: string;
	confirmation_date?: string;
	termination_date?: string;
	notice_period_days?: number;
	base_salary?: string;
	salary_type?: string;
	salary_currency?: string;
	bank_name?: string;
	bank_account_number?: string;
	bank_ifsc_code?: string;
	bank_branch?: string;
	pan_number?: string;
	uan_number?: string;
	status: string;
	joined_at: string;
	updated_at: string;
}

// ─── Payment (client payments + employee expenses) ──────────────────

export interface Payment {
	id: string;
	payment_type: 'client_payment' | 'expense';
	title: string;
	description?: string;
	amount: string;
	currency: string;
	category?: string;
	category_name?: string;
	status: 'pending' | 'approved' | 'rejected' | 'paid';
	payment_date: string;
	vendor_name?: string;
	receipt_number?: string;
	receipt_url?: string;
	created_by: string;
	created_by_name: string;
	approved_by?: string;
	approved_by_name?: string;
	created_at: string;
	updated_at: string;
}

// ─── Member (lightweight for listing) ───────────────────────────────

export interface MemberListItem {
	id: string;
	user: string;
	user_email: string;
	user_name: string;
	user_avatar_url?: string | null;
	role?: string;
	role_name?: string;
	employment_type: string;
	status: string;
	joining_date?: string;
	joined_at: string;
}

// ─── Attendance ─────────────────────────────────────────────────────

export interface Attendance {
	id: string;
	user: string;
	user_name: string;
	date: string;
	status: string;
	check_in_time?: string;
	check_out_time?: string;
	check_in_method?: string;
	check_in_latitude?: number;
	check_in_longitude?: number;
	notes?: string;
	created_at: string;
	updated_at: string;
}

export interface RemoteCheckInRequest {
	id: string;
	user: string;
	user_name: string;
	date: string;
	reason: string;
	location_description?: string;
	status: string;
	reviewed_by?: string;
	reviewer_name?: string;
	review_note?: string;
	created_at: string;
}
