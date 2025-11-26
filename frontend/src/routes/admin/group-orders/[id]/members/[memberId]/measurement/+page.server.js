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

    // 获取成员
    const memberRes = await apiGet(`/group-orders/${groupId}/members/${memberId}`);
    if (!memberRes || !memberRes.member) {
        throw error(404, 'Group order member not found');
    }

    // 获取成员量体
    const measurementRes = await apiGet(`/measurements/group-member/${memberId}`);

    return {
        order: orderRes.order,
        member: memberRes.member,
        measurement: measurementRes.measurement ?? {}
    };
}

export const actions = {
    save: async ({ params, locals, request }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const memberId = params.memberId;
        const form = await request.formData();

        // 量体字段全部收集
        const payload = Object.fromEntries(form);

        await apiPost(`/measurements/group-member/${memberId}`, payload);

        throw redirect(303, `/admin/group-orders/${params.id}/members`);
    }
};
