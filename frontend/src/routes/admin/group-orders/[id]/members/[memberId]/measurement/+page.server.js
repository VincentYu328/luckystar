import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

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

        // 获取成员的量体数据（如果存在）
        let measurement = {};
        try {
            const measurementRes = await api.measurements.getByGroupMember(memberId, { fetch, cookies });
            measurement = measurementRes || {};
        } catch (err) {
            console.log('[measurement] No existing measurement found for member:', memberId);
        }

        return {
            order: order,
            member: member,
            measurement: measurement
        };
    } catch (err) {
        console.error('[measurement] Error loading:', err);
        throw error(404, 'Failed to load measurement data');
    }
}

export const actions = {
    default: async ({ params, locals, request, fetch, cookies }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const groupId = Number(params.id);
        const memberId = Number(params.memberId);
        const form = await request.formData();

        const payload = {};
        for (const [key, value] of form.entries()) {
            payload[key] = value;
        }

        try {
            await api.measurements.saveForGroupMember(memberId, payload, { fetch, cookies });
            throw redirect(303, `/admin/group-orders/${groupId}`);
        } catch (err) {
            if (err.status === 303) throw err;
            console.error('[measurement] Error saving:', err);
            return { error: err.message || 'Failed to save measurement' };
        }
    }
};
