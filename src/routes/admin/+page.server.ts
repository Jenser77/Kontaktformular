import type { Actions, PageServerLoad } from './$types';
import { buildAdminDashboardData } from '$lib/server/admin/load/dashboardLoad';
import { authActions } from '$lib/server/admin/actions/auth';
import { adminUserActions } from '$lib/server/admin/actions/adminUsers';
import { contactActions } from '$lib/server/admin/actions/contacts';
import { recipientActions } from '$lib/server/admin/actions/recipients';

export const load: PageServerLoad = async ({ url }) => {
	return buildAdminDashboardData(url);
};

export const actions: Actions = {
	...authActions,
	...adminUserActions,
	...contactActions,
	...recipientActions
};
