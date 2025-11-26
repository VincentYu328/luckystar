// frontend/src/routes/admin/retail-orders/[id]/review/+page.server.js
import { apiGet, apiPost } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
	const user = locals.authUser;
	if (!user || user.type !== 'staff') {
		throw error(403, 'Forbidden');
	}

	const { id } = params;

	const orderRes = await apiGet(`/retail-orders/${id}`);
	if (!orderRes || !orderRes.order) {
		throw error(404, 'Order not found');
	}

	const itemsRes = await apiGet(`/retail-orders/${id}/items`);

	return {
		order: orderRes.order,
		items: itemsRes.items ?? []
	};
}

export const actions = {
	confirm: async ({ params, locals }) => {
		const user = locals.authUser;
		if (!user || user.type !== 'staff') {
			throw error(403, 'Forbidden');
		}

		const orderId = params.id;

		// 后端将执行：更新订单状态 = confirmed
		const res = await apiPost(`/retail-orders/${orderId}/review`, {});

		if (!res.success) {
			return { error: res.error || 'Order review failed.' };
		}

		throw redirect(303, `/admin/retail-orders/${orderId}`);
	}
};
