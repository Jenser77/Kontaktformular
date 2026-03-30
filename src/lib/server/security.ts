import { CSRF_HEADER_NAME } from '$lib/constants';

export function createCsrfToken(): string {
    return crypto.randomUUID();
}

export function isAllowedApiOrigin(request: Request, allowedOriginRaw: string): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return false;

    const allowedOrigin = allowedOriginRaw.trim();
    const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    return origin === allowedOrigin || isLocalhost;
}

export function getCsrfTokenFromRequest(request: Request): string {
    return request.headers.get(CSRF_HEADER_NAME) ?? '';
}

export function isValidDoubleSubmitCsrf(requestToken: string, cookieToken: string): boolean {
    if (!requestToken || !cookieToken) return false;
    return requestToken === cookieToken;
}
