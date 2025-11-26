import { apiGet, apiPost } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const groupId = params.id;
    const memberId = params.memberId;

    // 获取团体订单
    const orderRes = await apiGet(`/group-orders/${groupId}`);
    if (!orderRes || !orderRes.order) {
        throw error(404, 'Group order not found');
    }

    // 获取成员信息
    const memberRes = await apiGet(`/group-orders/${groupId}/members/${memberId}`);
    if (!memberRes || !memberRes.member) {
        throw error(404, 'Group order member not found');
    }

    // 布料列表
    const fabrics = await apiGet('/products/all-fabrics');

    return {
        order: orderRes.order,
        member: memberRes.member,
        fabrics: fabrics.fabrics ?? []
    };
}

export const actions = {
    default: async ({ params, locals, request }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const groupId = params.id;
        const memberId = params.memberId;

        const form = await request.formData();

        const payload = {
            member_name: form.get('member_name'),
            member_phone: form.get('member_phone'),
            fabric_id: form.get('fabric_id') || null,
            notes: form.get('notes') || ''
        };

        if (!payload.member_name) {
            return { error: 'Member name cannot be empty.' };
        }

        await apiPost(`/group-orders/${groupId}/members/${memberId}/edit`, payload);

        throw redirect(303, `/admin/group-orders/${groupId}/members`);
    }
};
