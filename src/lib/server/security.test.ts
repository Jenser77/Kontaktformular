import { describe, expect, it } from 'vitest';
import {
    createCsrfToken,
    getCsrfTokenFromRequest,
    isAllowedApiOrigin,
    isValidDoubleSubmitCsrf
} from '$lib/server/security';

describe('security helpers', () => {
    it('creates non-empty csrf tokens', () => {
        const token = createCsrfToken();
        expect(token).toBeTruthy();
        expect(token.length).toBeGreaterThan(10);
    });

    it('accepts localhost origins and configured origin', () => {
        const localReq = new Request('http://localhost/api/contact', {
            headers: { origin: 'http://localhost:5173' }
        });
        const allowedReq = new Request('http://localhost/api/contact', {
            headers: { origin: 'https://example.org' }
        });

        expect(isAllowedApiOrigin(localReq, 'https://irrelevant.example')).toBe(true);
        expect(isAllowedApiOrigin(allowedReq, 'https://example.org')).toBe(true);
    });

    it('rejects unknown origin', () => {
        const req = new Request('http://localhost/api/contact', {
            headers: { origin: 'https://evil.example' }
        });
        expect(isAllowedApiOrigin(req, 'https://example.org')).toBe(false);
    });

    it('extracts csrf token from header and validates double submit', () => {
        const req = new Request('http://localhost/api/contact', {
            headers: { 'x-csrf-token': 'abc123' }
        });
        expect(getCsrfTokenFromRequest(req)).toBe('abc123');
        expect(isValidDoubleSubmitCsrf('abc123', 'abc123')).toBe(true);
        expect(isValidDoubleSubmitCsrf('abc123', 'different')).toBe(false);
    });
});
