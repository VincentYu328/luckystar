import { apiGet } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    // 仅 STAFF 可访问
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 获取所有团体订单
    const orders = await apiGet('/group-orders');

    return {
        orders: orders.orders ?? []
    };
}
