import 'dotenv/config';
import { dev } from '$app/environment';
import { redirect } from '@sveltejs/kit';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { displayNameFromSession, getValidAdminSession } from '$lib/server/adminSession';
import { log } from '$lib/server/logger';
import { CSRF_COOKIE_NAME } from '$lib/constants';
import { createCsrfToken } from '$lib/server/security';

export const handle: Handle = async ({ event, resolve }) => {
    const accept = event.request.headers.get('accept') ?? '';
    const isBrowserDocumentRequest = event.request.method === 'GET' && accept.includes('text/html');
    if (isBrowserDocumentRequest && !event.cookies.get(CSRF_COOKIE_NAME)) {
        event.cookies.set(CSRF_COOKIE_NAME, createCsrfToken(), {
            path: '/',
            httpOnly: false,
            sameSite: 'lax',
            secure: !dev,
            maxAge: 60 * 60 * 24
        });
    }

    // --- 1. Session Auth for /admin routes (except /admin/login) ---
    if (event.url.pathname.startsWith('/admin') && !event.url.pathname.startsWith('/admin/login')) {
        const token = event.cookies.get('admin_session');
        const session = await getValidAdminSession(token);
        if (!session) {
            redirect(303, '/admin/login');
        }
        event.locals.adminDisplayName = displayNameFromSession(session);
    }

    // --- 2. Resolve the request ---
    const response = await resolve(event);

    // HTML-Dokumente nicht länger cachen: verhindert, dass nach Deploy noch alte Chunk-Referenzen im Browser hängen
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('text/html')) {
        response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        response.headers.set('Pragma', 'no-cache');
    }

    // --- 2b. Cache: immutable for Vite-hashed assets; short TTL for unhashed /static files ---
    const pathname = event.url.pathname;
    if (pathname.startsWith('/_app/immutable/')) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(css|png|jpe?g|gif|webp|ico|svg|woff2?)$/i.test(pathname)) {
        response.headers.set('Cache-Control', 'public, max-age=3600');
    }

    // --- 3. Security Headers ---
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    if (!dev) {
        response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    }

    // --- 4. CORS for API routes ---
    if (event.url.pathname.startsWith('/api')) {
        const origin = event.request.headers.get('origin');
        const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim() ?? '';
        const isLocalhost = origin?.startsWith('http://localhost') || origin?.startsWith('http://127.0.0.1');

        if (origin && (origin === allowedOrigin || isLocalhost)) {
            response.headers.set('Vary', 'Origin');
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        }
    }

    return response;
};

export const handleError: HandleServerError = ({ error, status }) => {
    log.error({ err: error, status }, 'handleError');

    return {
        message: status === 500
            ? 'Ein interner Serverfehler ist aufgetreten. Bitte versuchen Sie es später noch einmal.'
            : 'Ein Fehler ist aufgetreten.',
        code: String(status)
    };
};
