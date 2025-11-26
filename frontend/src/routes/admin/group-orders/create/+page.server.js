import { apiGet, apiPost } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 获取全部成衣，用于设定团体订单的“主打产品”
    const res = await apiGet('/products/all-garments');

    return {
        garments: res.garments ?? []
    };
}

export const actions = {
    create: async ({ locals, request }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const form = await request.formData();

        const payload = {
            group_name: form.get('group_name'),
            contact_name: form.get('contact_name'),
            contact_phone: form.get('contact_phone'),
            garment_id: form.get('garment_id'),
            notes: form.get('notes') || ''
        };

        const res = await apiPost('/group-orders/create', payload);

        if (!res.success) {
            return {
                error: res.error || 'Failed to create group order.'
            };
        }

        // 跳转到新订单详情页
        throw redirect(303, `/admin/group-orders/${res.id}`);
    }
};
