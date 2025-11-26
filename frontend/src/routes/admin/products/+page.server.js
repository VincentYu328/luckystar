import { apiGet } from '$lib/server/api.js';

export async function load({ locals }) {
	const user = locals.authUser;

	// 再保险
	if (!user || user.type !== 'staff') {
		return { products: [] };
	}

	const res = await apiGet('/products/all');

	return {
		products: res.products ?? []
	};
}
