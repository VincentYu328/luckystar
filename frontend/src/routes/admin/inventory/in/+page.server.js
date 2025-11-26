// frontend/src/routes/admin/inventory/in/+page.server.js
import { apiGet, apiPost } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 取得所有 fabric（product_type = fabric）
    const res = await apiGet('/products/all-fabrics');

    return {
        fabrics: res.fabrics ?? []
    };
}

export const actions = {
    create: async ({ request, locals }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const form = await request.formData();
        const payload = Object.fromEntries(form);

        // 必填字段验证
        if (!payload.fabric_id || !payload.quantity) {
            return {
                success: false,
                message: 'Fabric and quantity are required.'
            };
        }

        await apiPost('/inventory/in', payload);

        // 成功后跳回 inventory 首页
        throw redirect(303, '/admin/inventory');
    }
};
