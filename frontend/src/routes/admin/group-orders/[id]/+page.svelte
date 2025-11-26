import { apiGet, apiPost } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const id = params.id;

    // 获取团体订单信息
    const order = await apiGet(`/group-orders/${id}`);

    if (!order || !order.order) {
        throw error(404, 'Group order not found');
    }

    return {
        order: order.order
    };
}

export const actions = {
    update: async ({ locals, request, params }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const id = params.id;
        const form = await request.formData();

        const payload = {
            group_name: form.get('group_name'),
            contact_name: form.get('contact_name'),
            contact_phone: form.get('contact_phone'),
            notes: form.get('notes') || ''
        };

        const res = await apiPost(`/group-orders/${id}/update`, payload);

        if (!res.success) {
            return {
                error: res.error || 'Failed to update group order.'
            };
        }

        // 刷新详情页
        throw redirect(303, `/admin/group-orders/${id}`);
    }
};
