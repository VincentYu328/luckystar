// frontend/src/routes/admin/retail-orders/create/+page.server.js
import { apiGet, apiPost } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const user = locals.authUser;

	if (!user || user.type !== 'staff') {
		throw error(403, 'Forbidden');
	}

	// 获取所有产品
	const res = await apiGet('/products');

	return {
		products: res.products ?? []
	};
}

export const actions = {
	create: async ({ locals, request }) => {
		const user = locals.authUser;
		if (!user || user.type !== 'staff') {
			throw error(403, 'Forbidden');
		}

		const form = await request.formData();
		const payload = Object.fromEntries(form);

		// 创建订单
		const res = await apiPost('/retail-orders/create', payload);

		if (!res.success) {
			return {
				success: false,
				message: res.error || 'Create order failed'
			};
		}

		// 跳转到订单详情
		throw redirect(303, `/admin/retail-orders/${res.orderId}`);
	}
};
