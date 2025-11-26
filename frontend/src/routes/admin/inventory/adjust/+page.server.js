// frontend/src/routes/admin/inventory/adjust/+page.server.js
import { apiGet, apiPost } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    // ⭐ 只有 Head（Admin）才可以进入
    if (!user || user.type !== 'staff' || user.role !== 'Head') {
        throw error(403, 'Forbidden');
    }

    // 获取布料库存（from v_fabric_stock）
    const fabrics = await apiGet('/inventory/fabric');

    return {
        fabrics: fabrics.items ?? []
    };
}

export const actions = {
    adjust: async ({ locals, request }) => {
        const user = locals.authUser;

        // ⭐ 只有 Head（Admin）才可以操作
        if (!user || user.type !== 'staff' || user.role !== 'Head') {
            throw error(403, 'Forbidden');
        }

        const form = await request.formData();

        const payload = {
            product_id: form.get('product_id'),
            new_quantity: Number(form.get('new_quantity')),
            note: form.get('note') ?? ''
        };

        const res = await apiPost('/inventory/adjust', payload);

        if (!res.success) {
            return { error: res.error || 'Adjustment failed' };
        }

        throw redirect(303, '/admin/inventory');
    }
};
