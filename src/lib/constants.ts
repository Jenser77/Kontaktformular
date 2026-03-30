export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
export const SESSION_DURATION_S = 8 * 60 * 60;

export const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const DEFAULT_RATE_LIMIT_MAX = 5;

export const CONTACTS_PER_PAGE = 50;

export const CSRF_COOKIE_NAME = 'kf_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

export const HEALTH_DB_LATENCY_WARN_MS = 500;

export const CONSENT_STORAGE_KEY = 'kf_cookie_prefs_v1';
