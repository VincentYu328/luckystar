import { apiGet } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
	const id = params.id;

	// 获取产品
	const p = await apiGet(`/products/${id}`, fetch, {
		credentials: 'include'
	});

	// 获取图片
	const imgs = await apiGet(`/products/${id}/images`, fetch, {
		credentials: 'include'
	});

	if (!p || !p.product) {
		throw error(404, 'Product not found');
	}

	return {
		product: p.product,
		images: imgs.images ?? []
	};
}
