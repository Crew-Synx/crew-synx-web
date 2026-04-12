const API = 'https://crewsynx.switchspace.in/api/v1';

export function getToken() {
	return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
}

export function authHeaders(orgId?: string) {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${getToken()}`,
	};
	if (orgId) headers['X-Organization-ID'] = orgId;
	return headers;
}

export function authHeadersMultipart(orgId?: string) {
	const headers: Record<string, string> = {
		Authorization: `Bearer ${getToken()}`,
	};
	if (orgId) headers['X-Organization-ID'] = orgId;
	return headers;
}

export async function apiFetch(path: string, options: RequestInit & { orgId?: string } = {}) {
	const { orgId, ...fetchOptions } = options;
	const isFormData = fetchOptions.body instanceof FormData;
	const headers = isFormData ? authHeadersMultipart(orgId) : authHeaders(orgId);

	const res = await fetch(`${API}${path}`, {
		...fetchOptions,
		headers: { ...headers, ...fetchOptions.headers as Record<string, string> },
	});

	if (res.status === 401) {
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		window.location.href = '/auth/login';
		throw new Error('Unauthorized');
	}

	return res;
}

export { API };
