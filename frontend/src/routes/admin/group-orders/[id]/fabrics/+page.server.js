import { apiGet, apiPost } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const groupId = params.id;

    // 获取团体订单
    const orderRes = await apiGet(`/group-orders/${groupId}`);
    if (!orderRes?.order) {
        throw error(404, 'Group order not found');
    }

    // 所有布料
    const fabricRes = await apiGet('/products/all-fabrics');

    // 已选布料（来自 group-order-fabrics 表）
    const selectedRes = await apiGet(`/group-orders/${groupId}/fabrics`);

    return {
        order: orderRes.order,
        fabrics: fabricRes.fabrics ?? [],
        selected: selectedRes.items ?? []
    };
}

export const actions = {
    save: async ({ locals, params, request }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const groupId = params.id;
        const form = await request.formData();

        // 后端接收格式：
        // fabrics: JSON.stringify([{fabric_id, qty, note}, ...])
        const payload = {
            fabrics: form.get('fabrics')
        };

        await apiPost(`/group-orders/${groupId}/fabrics/save`, payload);

        throw redirect(303, `/admin/group-orders/${groupId}`);
    }
};
