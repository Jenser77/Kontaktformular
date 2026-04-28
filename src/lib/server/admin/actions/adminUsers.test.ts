import { describe, expect, it } from 'vitest';
import {
	isValidAdminUsername,
	normalizeAdminUsername,
	validateDeleteTarget,
	validateDisableTarget
} from './adminUserRules';

describe('admin user action guards', () => {
	it('normalizes usernames to lowercase and trims whitespace', () => {
		expect(normalizeAdminUsername('  Alice.Admin  ')).toBe('alice.admin');
	});

	it('validates allowed username format', () => {
		expect(isValidAdminUsername('admin.user_01')).toBe(true);
		expect(isValidAdminUsername('ab')).toBe(false);
		expect(isValidAdminUsername('bad name')).toBe(false);
		expect(isValidAdminUsername('UPPER')).toBe(false);
	});

	it('blocks self-disable and already-disabled users', () => {
		expect(validateDisableTarget('admin', 'admin', false)).toBe(
			'Sie können Ihren eigenen Account nicht deaktivieren.'
		);
		expect(validateDisableTarget('admin', 'editor', true)).toBe(
			'Admin-Benutzer ist bereits deaktiviert.'
		);
		expect(validateDisableTarget('admin', 'editor', false)).toBeNull();
	});

	it('blocks self-delete and last-admin deletion', () => {
		expect(validateDeleteTarget('admin', 'admin', 2)).toBe(
			'Sie können Ihren eigenen Account nicht löschen.'
		);
		expect(validateDeleteTarget('admin', 'editor', 1)).toBe(
			'Der letzte Admin-Benutzer kann nicht gelöscht werden.'
		);
		expect(validateDeleteTarget('admin', 'editor', 2)).toBeNull();
	});
});
