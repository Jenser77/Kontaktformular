import { prisma } from '$lib/server/prisma';
import { CONTACTS_PER_PAGE } from '$lib/constants';
import { isDisabledDisplayName, recipientLabel } from '$lib/server/admin/helpers';

interface ContactRecord {
	id: string;
	firstName: string;
	lastName: string;
	organization: string | null;
	email: string;
	phone: string | null;
	subject: string;
	message: string;
	privacyAccepted: boolean;
	targetRecipient: string | null;
	targetRecipientLabel: string | null;
	createdAt: Date;
}

export async function buildAdminDashboardData(url: URL) {
	const pageRaw = Number(url.searchParams.get('page') ?? '1');
	const currentPage = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

	const q = (url.searchParams.get('q') ?? '').trim();
	const sortRaw = url.searchParams.get('sort') ?? 'newest';
	const sort = sortRaw === 'oldest' || sortRaw === 'name' ? sortRaw : 'newest';

	const searchFilter =
		q.length > 0
			? {
					OR: [
						{ firstName: { contains: q, mode: 'insensitive' as const } },
						{ lastName: { contains: q, mode: 'insensitive' as const } },
						{ email: { contains: q, mode: 'insensitive' as const } },
						{ subject: { contains: q, mode: 'insensitive' as const } }
					]
				}
			: {};

	const where = { deletedAt: null as null, ...searchFilter };

	const orderBy =
		sort === 'oldest'
			? { createdAt: 'asc' as const }
			: sort === 'name'
				? [{ lastName: 'asc' as const }, { firstName: 'asc' as const }]
				: { createdAt: 'desc' as const };

	const totalContacts = await prisma.contact.count({ where });
	const totalPages = Math.max(1, Math.ceil(totalContacts / CONTACTS_PER_PAGE));
	const safePage = Math.min(currentPage, totalPages);

	const rows: ContactRecord[] = await prisma.contact.findMany({
		where,
		orderBy,
		skip: (safePage - 1) * CONTACTS_PER_PAGE,
		take: CONTACTS_PER_PAGE
	});

	const recipientIds = [...new Set(rows.map((c) => c.targetRecipient).filter(Boolean))] as string[];

	const depts =
		recipientIds.length > 0
			? await prisma.fachabteilung.findMany({
					where: { id: { in: recipientIds } },
					include: { einrichtung: { include: { mandant: true } } }
				})
			: [];

	const deptById = new Map(depts.map((d) => [d.id, d]));

	const contacts = rows.map((c) => ({
		...c,
		createdAt: c.createdAt.toISOString(),
		recipientLabel:
			c.targetRecipientLabel ??
			recipientLabel(c.targetRecipient ? deptById.get(c.targetRecipient) : undefined, c.targetRecipient)
	}));

	const mandanten = await prisma.mandant.findMany({
		orderBy: { createdAt: 'asc' },
		include: {
			einrichtungen: {
				orderBy: { createdAt: 'asc' },
				include: {
					abteilungen: {
						orderBy: { createdAt: 'asc' }
					}
				}
			}
		}
	});

	const adminUsers = await prisma.adminUser.findMany({
		orderBy: { createdAt: 'asc' },
		select: {
			id: true,
			username: true,
			displayName: true,
			createdAt: true
		}
	});

	return {
		contacts,
		currentPage: safePage,
		totalPages,
		totalContacts,
		contactQuery: q,
		contactSort: sort,
		adminUsers: adminUsers.map((u) => ({
			id: u.id,
			username: u.username,
			displayName: u.displayName,
			isDisabled: isDisabledDisplayName(u.displayName),
			createdAt: u.createdAt.toISOString()
		})),
		mandanten: mandanten.map((m) => ({
			...m,
			createdAt: m.createdAt.toISOString(),
			einrichtungen: m.einrichtungen.map((e) => ({
				...e,
				createdAt: e.createdAt.toISOString(),
				abteilungen: e.abteilungen.map((a) => ({
					...a,
					createdAt: a.createdAt.toISOString()
				}))
			}))
		}))
	};
}
