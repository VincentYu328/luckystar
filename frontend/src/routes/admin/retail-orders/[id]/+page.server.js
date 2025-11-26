// frontend/src/routes/admin/retail-orders/[id]/+page.server.js
import { apiGet } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	const user = locals.authUser;

	if (!user || user.type !== 'staff') {
		throw error(403, 'Forbidden');
	}

	const { id } = params;

	// 获取订单
	const orderRes = await apiGet(`/retail-orders/${id}`);

	if (!orderRes || !orderRes.order) {
		throw error(404, 'Order not found');
	}

	// 获取订单商品
	const itemRes = await apiGet(`/retail-orders/${id}/items`);

	// 获取支付记录（可选）
	let payments = [];
	try {
		const payRes = await apiGet(`/payments/order/${id}`);
		payments = payRes.payments ?? [];
	} catch (_) {
		// 没支付记录不报错
	}

	return {
		order: orderRes.order,
		items: itemRes.items ?? [],
		payments
	};
}
