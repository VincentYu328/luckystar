import { apiGet } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const groupId = params.id;

    // 获取团体订单本体
    const order = await apiGet(`/group-orders/${groupId}`);

    if (!order || !order.order) {
        throw error(404, 'Group order not found');
    }

    // 获取成员列表
    const members = await apiGet(`/group-orders/${groupId}/members`);

    return {
        order: order.order,
        members: members.members ?? []
    };
}
