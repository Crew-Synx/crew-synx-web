import { z } from 'zod';

// ─── API Envelope ───────────────────────────────────────────────────
// All successful Django responses wrap data in { data: T }
// Errors come as { error: string, message?: string, details?: Record<string, string[]> }

export const ApiErrorSchema = z.object({
	error: z.string().optional(),
	message: z.string().optional(),
	detail: z.string().optional(),
	details: z.record(z.unknown()).optional(),
}).passthrough();

export type ApiError = z.infer<typeof ApiErrorSchema>;

function apiListEnvelope<T extends z.ZodType>(itemSchema: T) {
	return z.object({ data: z.array(itemSchema) }).passthrough();
}

function apiItemEnvelope<T extends z.ZodType>(itemSchema: T) {
	return z.object({ data: itemSchema }).passthrough();
}

// ─── Entity Schemas ─────────────────────────────────────────────────
// Validate required fields strictly; .passthrough() for forward-compatibility

export const UserDataSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string(),
	avatar_url: z.string().nullable().optional(),
}).passthrough();

export const OrganizationSchema = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	invite_code: z.string().optional(),
	avatar_url: z.string().nullable().optional(),
}).passthrough();

export const BranchSchema = z.object({
	id: z.string(),
	name: z.string(),
	code: z.string(),
	is_head_office: z.boolean(),
	is_active: z.boolean(),
}).passthrough();

export const DepartmentSchema = z.object({
	id: z.string(),
	name: z.string(),
	is_active: z.boolean(),
}).passthrough();

export const DesignationSchema = z.object({
	id: z.string(),
	title: z.string(),
}).passthrough();

export const RoleSchema = z.object({
	id: z.string(),
	name: z.string(),
	priority: z.number(),
}).passthrough();

export const MemberSchema = z.object({
	id: z.string(),
	user: z.union([
		z.string(),
		z.object({ id: z.string(), email: z.string(), name: z.string() }).passthrough(),
	]),
}).passthrough();

export const EmployeeSchema = z.object({
	id: z.string(),
	employee_id: z.string(),
	employment_type: z.string(),
	status: z.string(),
}).passthrough();

export const AttendanceSchema = z.object({
	id: z.string(),
	date: z.string(),
	status: z.string(),
}).passthrough();

export const RemoteCheckInRequestSchema = z.object({
	id: z.string(),
	date: z.string(),
	reason: z.string(),
	status: z.string(),
}).passthrough();

export const ExpenseClaimSchema = z.object({
	id: z.string(),
	title: z.string(),
	amount: z.string(),
	status: z.string(),
}).passthrough();

export const NotificationSchema = z.object({
	id: z.string(),
	title: z.string().optional(),
	message: z.string().optional(),
}).passthrough();

export const NotificationPrefSchema = z.object({
	id: z.string(),
	notification_type: z.string(),
	is_enabled: z.boolean(),
}).passthrough();

// ─── Envelope Schemas ───────────────────────────────────────────────

export const OrgListResponse = apiListEnvelope(OrganizationSchema);
export const MemberListResponse = apiListEnvelope(MemberSchema);
export const RoleListResponse = apiListEnvelope(RoleSchema);
export const BranchListResponse = apiListEnvelope(BranchSchema);
export const DepartmentListResponse = apiListEnvelope(DepartmentSchema);
export const DesignationListResponse = apiListEnvelope(DesignationSchema);
export const EmployeeListResponse = apiListEnvelope(EmployeeSchema);
export const AttendanceListResponse = apiListEnvelope(AttendanceSchema);
export const RemoteRequestListResponse = apiListEnvelope(RemoteCheckInRequestSchema);
export const ExpenseListResponse = apiListEnvelope(ExpenseClaimSchema);
export const NotificationListResponse = apiListEnvelope(NotificationSchema);
export const NotificationPrefListResponse = apiListEnvelope(NotificationPrefSchema);

export const OrgItemResponse = apiItemEnvelope(OrganizationSchema);
export const EmployeeItemResponse = apiItemEnvelope(EmployeeSchema);

// ─── Parsing Helpers ────────────────────────────────────────────────

/**
 * Parse a JSON response body against a Zod schema.
 * Returns the validated data on success, or the fallback on failure.
 * Logs validation errors in development for debugging.
 */
export function parseResponse<T>(
	schema: z.ZodType<T>,
	data: unknown,
	fallback: T,
): T {
	const result = schema.safeParse(data);
	if (result.success) return result.data;
	if (process.env.NODE_ENV === 'development') {
		console.warn('[API Schema Validation]', result.error.issues);
	}
	return fallback;
}

/**
 * Convenience: parse a list response { data: T[] }, return the array or [].
 */
export function parseListResponse<T>(
	itemSchema: z.ZodType<T>,
	json: unknown,
): T[] {
	const envelope = z.object({ data: z.array(itemSchema) }).passthrough();
	const result = envelope.safeParse(json);
	if (result.success) return result.data.data;
	if (process.env.NODE_ENV === 'development') {
		console.warn('[API List Validation]', result.error?.issues);
	}
	// Fallback: try accessing .data directly (unvalidated)
	const raw = json as Record<string, unknown>;
	return Array.isArray(raw?.data) ? (raw.data as T[]) : [];
}

/**
 * Convenience: parse a single-item response { data: T }, return data or null.
 */
export function parseItemResponse<T>(
	itemSchema: z.ZodType<T>,
	json: unknown,
): T | null {
	const envelope = z.object({ data: itemSchema }).passthrough();
	const result = envelope.safeParse(json);
	if (result.success) return result.data.data;
	if (process.env.NODE_ENV === 'development') {
		console.warn('[API Item Validation]', result.error?.issues);
	}
	const raw = json as Record<string, unknown>;
	return (raw?.data as T) ?? null;
}
