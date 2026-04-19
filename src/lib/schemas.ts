import { z } from 'zod';

// ─── API Envelope ───────────────────────────────────────────────────
// All successful Django responses wrap data in { data: T }
// Errors come as { error: string, message?: string, details?: Record<string, string[]> }

export const ApiErrorSchema = z.object({
	error: z.string().optional(),
	message: z.string().optional(),
	detail: z.string().optional(),
	details: z.record(z.string(), z.unknown()).optional(),
}).passthrough();

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const RequestOtpPayloadSchema = z.object({
	user_id: z.string().min(1),
});

export const RegisterPayloadSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1),
	registration_type: z.literal('organization'),
	organization_name: z.string().min(1),
});

export const VerifyOtpPayloadSchema = z.object({
	user_id: z.string().min(1),
	otp: z.string().regex(/^\d{6}$/),
});

export const VerifyOtpDjangoResponseSchema = z.object({
	data: z.object({
		access_token: z.string().min(1),
		refresh_token: z.string().optional(),
		organizations: z.array(z.unknown()).optional(),
		user: z.unknown().optional(),
	}).passthrough(),
}).passthrough();

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

export const RoleSchema = z.object({
	id: z.string(),
	name: z.string(),
	priority: z.number(),
	is_system: z.boolean().optional(),
	permissions: z.array(z.string()).default([]),
});

export const PermissionSchema = z.object({
	id: z.string(),
	key: z.string(),
	description: z.string(),
});

export const MemberSchema = z.object({
	id: z.string(),
	user: z.object({ id: z.string(), email: z.string(), name: z.string() }).passthrough(),
	role: z.object({ id: z.string(), name: z.string() }).passthrough(),
	joined_at: z.string(),
}).passthrough();

export const EmployeeSchema = z.object({
	id: z.string(),
	user: z.string().optional().default(''),
	user_email: z.string().optional().default(''),
	user_name: z.string().optional().default(''),
	user_avatar_url: z.string().nullish().transform(v => v ?? undefined),
	encrypted_qr_payload: z.string().nullish().transform(v => v ?? undefined),
	role: z.string().nullish().transform(v => v ?? undefined),
	role_name: z.string().nullish().transform(v => v ?? undefined),
	phone: z.string().nullish().transform(v => v ?? undefined),
	employment_type: z.string().optional().default(''),
	status: z.string().optional().default('active'),
	joined_at: z.string().nullish().transform(v => v ?? ''),
}).passthrough();

export const AttendanceSchema = z.object({
	id: z.string(),
	user: z.string(),
	user_name: z.string(),
	date: z.string(),
	status: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
}).passthrough();

export const RemoteCheckInRequestSchema = z.object({
	id: z.string(),
	user: z.string(),
	user_name: z.string(),
	date: z.string(),
	reason: z.string(),
	status: z.string(),
	created_at: z.string(),
}).passthrough();

export const PaymentSchema = z.object({
	id: z.string(),
	payment_type: z.enum(['client_payment', 'expense']),
	title: z.string(),
	description: z.string().optional(),
	amount: z.string(),
	currency: z.string(),
	status: z.string(),
	payment_date: z.string(),
	vendor_name: z.string().optional(),
	receipt_number: z.string().optional(),
	receipt_url: z.string().optional(),
	created_by: z.string(),
	created_by_name: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
}).passthrough();

export const NotificationSchema = z.object({
	id: z.string(),
	notification_type: z.string(),
	title: z.string(),
	message: z.string(),
	read: z.boolean(),
	created_at: z.string(),
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
export const EmployeeListResponse = apiListEnvelope(EmployeeSchema);
export const AttendanceListResponse = apiListEnvelope(AttendanceSchema);
export const RemoteRequestListResponse = apiListEnvelope(RemoteCheckInRequestSchema);
export const PaymentListResponse = apiListEnvelope(PaymentSchema);
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

export function getApiErrorMessage(data: unknown, fallback: string): string {
	const parsed = ApiErrorSchema.safeParse(data);
	if (!parsed.success) return fallback;

	const { message, detail, details } = parsed.data;

	// For validation errors, extract the first field-level message from details
	if (details && typeof details === 'object') {
		for (const value of Object.values(details)) {
			if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
			if (typeof value === 'string') return value;
		}
	}

	return message ?? detail ?? fallback;
}

export function getRetryAfterSeconds(headers: Headers): number | null {
	const retryAfter = headers.get('Retry-After');
	if (!retryAfter) return null;

	const asNumber = Number.parseInt(retryAfter, 10);
	if (Number.isFinite(asNumber) && asNumber > 0) return asNumber;

	const asDateMs = Date.parse(retryAfter);
	if (Number.isNaN(asDateMs)) return null;

	const seconds = Math.ceil((asDateMs - Date.now()) / 1000);
	return seconds > 0 ? seconds : null;
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
