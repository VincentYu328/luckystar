// frontend/src/routes/admin/customers/[id]/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const id = params.id;

    // 获取顾客信息
    const customer = await api.customers.get(id);
    if (!customer || customer.error) {
        throw error(404, 'Customer not found');
    }

    // 获取客户的团体订单（如有）
    const groupOrders = await api.customers.groupOrders(id);

    // ⭐ 获取客户所有量体记录
    const measurements = await api.customers.measurements(id);

    return {
        customer,
        groupOrders: groupOrders.orders ?? [],
        measurements: measurements.items ?? []   // ← 修复后定义
    };
}
