import { apiGet, apiPost } from '$lib/server/api.js';
import { redirect, error } from '@sveltejs/kit';

export async function load({ params }) {
	const id = params.id;

	const p = await apiGet(`/products/${id}`);
	const c = await apiGet('/product-categories/all');

	if (!p || !p.product) {
		throw error(404, 'Product not found');
	}

	return {
		product: p.product,
		categories: c.categories ?? []
	};
}

export const actions = {
	save: async ({ request, params }) => {
		const id = params.id;
		const form = await request.formData();
		const payload = Object.fromEntries(form);

		const res = await apiPost(`/products/${id}/update`, payload);

		return {
			success: res.success ?? false,
			error: res.error ?? null
		};
	}
};
