import { apiGet, apiPost } from '$lib/server/api.js';
import { redirect } from '@sveltejs/kit';

export async function load() {
	// 获取可用分类
	const res = await apiGet('/product-categories/all');
	return {
		categories: res.categories ?? []
	};
}

export const actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		const payload = Object.fromEntries(form);

		const res = await apiPost('/products/create', payload);

		if (!res.success) {
			return { error: res.error ?? 'Create failed' };
		}

		throw redirect(303, `/admin/products/${res.product_id}/edit`);
	}
};
