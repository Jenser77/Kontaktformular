import { dev } from '$app/environment';
import { SESSION_DURATION_S } from '$lib/constants';

/** `Secure` nur außerhalb des Vite-Devservers — sonst schlägt Admin-Login auf http://localhost fehl. */
export const adminSessionSecure = !dev;

export const adminSessionSetOptions = {
	path: '/',
	httpOnly: true,
	sameSite: 'strict' as const,
	secure: adminSessionSecure,
	maxAge: SESSION_DURATION_S
};

/** Optionen für `cookies.delete` — `secure` muss zum Setzen passen. */
export const adminSessionDeleteOptions = {
	path: '/',
	secure: adminSessionSecure
};
