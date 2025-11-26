// src/routes/checkout/+page.server.js
import { redirect } from '@sveltejs/kit';
import { apiPost } from '$lib/server/api.js';

export async function load({ locals }) {
    const user = locals.user;

    // 必须登录
    if (!user) {
        throw redirect(302, '/auth/login?redirect=/checkout');
    }

    return { user };
}

export const actions = {
    placeOrder: async ({ locals, request }) => {
        const user = locals.user;
        if (!user) throw redirect(302, '/auth/login?redirect=/checkout');

        const form = await request.formData();
        const cart = JSON.parse(form.get('cart'));

        // 调后端 API 创建订单
        const res = await apiPost('/retail-orders/web-create', {
            customer_id: user.id,
            items: cart
        });

        if (!res || !res.order_id) {
            return { error: 'Failed to create order.' };
        }

        // 下单成功 → 跳转成功页
        throw redirect(303, `/checkout/success?order=${res.order_id}`);
    }
};
