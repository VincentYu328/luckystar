import { apiGet, apiPost } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const groupId = params.id;

    // 获取团体订单信息
    const order = await apiGet(`/group-orders/${groupId}`);
    if (!order || !order.order) {
        throw error(404, 'Group order not found');
    }

    // 获取所有可供选择的布料
    const fabrics = await apiGet('/products/all-fabrics');

    return {
        order: order.order,
        fabrics: fabrics.fabrics ?? []
    };
}

export const actions = {
    default: async ({ request, params, locals }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const groupId = params.id;
        const form = await request.formData();

        const payload = {
            member_name: form.get('member_name'),
            member_phone: form.get('member_phone'),
            fabric_id: form.get('fabric_id') || null,
            notes: form.get('notes') || ''
        };

        // 简单验证
        if (!payload.member_name) {
            return { error: 'Member name required.' };
        }

        await apiPost(`/group-orders/${groupId}/members/add`, payload);

        // 完成新增 → 返回成员列表
        throw redirect(303, `/admin/group-orders/${groupId}/members`);
    }
};
