// frontend/src/routes/admin/retail-orders/+page.server.js
import { apiGet } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    // 所有 staff 均可查看订单
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 获取所有零售订单（后端 retailOrderRoutes）
    const res = await apiGet('/retail-orders');

    return {
        orders: res.orders ?? []
    };
}
