import { beforeEach, describe, expect, it, vi } from 'vitest';

const { deleteMany } = vi.hoisted(() => ({
    deleteMany: vi.fn().mockResolvedValue({ count: 0 })
}));

vi.mock('./prisma', () => ({
    prisma: {
        adminSession: {
            deleteMany
        }
    }
}));

import { invalidateOtherAdminSessions } from './adminSession';

describe('invalidateOtherAdminSessions', () => {
    beforeEach(() => {
        deleteMany.mockClear();
    });

    it('deletes other sessions for the admin user but keeps the current session id', async () => {
        await invalidateOtherAdminSessions('user-a', 'sess-current');
        expect(deleteMany).toHaveBeenCalledTimes(1);
        expect(deleteMany).toHaveBeenCalledWith({
            where: {
                adminUserId: 'user-a',
                id: { not: 'sess-current' }
            }
        });
    });
});
