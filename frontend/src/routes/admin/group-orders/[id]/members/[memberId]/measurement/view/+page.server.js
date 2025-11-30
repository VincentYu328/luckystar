import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, params, fetch, cookies }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const groupId = Number(params.id);
    const memberId = Number(params.memberId);

    try {
        // 获取团体订单和成员信息
        const order = await api.groupOrders.get(groupId, { fetch, cookies });

        if (!order) {
            throw error(404, 'Group order not found');
        }

        // 获取该成员的信息
        const membersRes = await api.groupOrders.members(groupId, { fetch, cookies });
        const member = (membersRes.members ?? []).find(m => m.id === memberId);

        if (!member) {
            throw error(404, 'Group member not found');
        }

        // 获取成员的量体数据
        let measurement = null;
        try {
            measurement = await api.measurements.getByGroupMember(memberId, { fetch, cookies });
        } catch (err) {
            console.log('[measurement/view] No measurement found for member:', memberId);
            throw error(404, 'No measurement data found for this member');
        }

        if (!measurement || Object.keys(measurement).length === 0) {
            throw error(404, 'No measurement data found for this member');
        }

        return {
            order: order,
            member: member,
            measurement: measurement
        };
    } catch (err) {
        if (err.status === 404) throw err;
        console.error('[measurement/view] Error loading:', err);
        throw error(404, 'Failed to load measurement data');
    }
}
