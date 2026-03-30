import 'dotenv/config';
import { redirect } from '@sveltejs/kit';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { displayNameFromSession, getValidAdminSession } from '$lib/server/adminSession';
import { log } from '$lib/server/logger';

export const handle: Handle = async ({ event, resolve }) => {
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

    // --- 2b. Cache static filenames served from /static (hashed Kit assets use their own headers) ---
    const pathname = event.url.pathname;
    if (/\.(css|png|jpe?g|gif|webp|ico|svg|woff2?)$/i.test(pathname)) {
        response.headers.set('Cache-Control', 'public, max-age=86400');
    }

    // --- 3. Security Headers ---
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

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
