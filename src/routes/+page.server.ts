import type { PageServerLoad } from './$types';
import { log } from '$lib/server/logger';
import { getRecipientTree } from '$lib/server/recipientTree';

export const load: PageServerLoad = async () => {
	try {
		const recipientStructure = await getRecipientTree();
		return {
			recipientStructure,
			recipientsLoadError: false as const
		};
	} catch (e) {
		log.error({ err: e }, 'page load recipient tree');
		return {
			recipientStructure: [],
			recipientsLoadError: true as const
		};
	}
};
