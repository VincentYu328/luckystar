// frontend/src/routes/admin/payments/[id]/+page.server.js

import { redirect, error } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ params, locals, fetch, cookies }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw redirect(302, '/auth/login?redirect=/admin/payments');
    }

    const paymentId = Number(params.id);

    if (isNaN(paymentId)) {
        throw redirect(303, '/admin/payments');
    }

    try {
        // 获取付款详情
        const paymentRes = await api.payments.get(paymentId, { fetch, cookies });
        const payment = paymentRes.payment || paymentRes;

        if (!payment || !payment.id) {
            throw error(404, 'Payment not found');
        }

        // 获取关联的订单信息（如果需要）
        let order = null;
        if (payment.order_type === 'retail' && payment.order_id) {
            try {
                const orderRes = await api.retailOrders.get(payment.order_id);
                order = orderRes;
            } catch (err) {
                console.warn('[LOAD /admin/payments/[id]] Failed to load order:', err.message);
            }
        }

        return {
            payment,
            order
        };

    } catch (err) {
        console.error('[LOAD /admin/payments/[id]] Error:', err);
        if (err.status) throw err;
        throw redirect(303, '/admin/payments?error=' + encodeURIComponent('Failed to load payment details'));
    }
}
