// frontend/src/routes/admin/inventory/out/+page.server.js
import { apiGet, apiPost } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 获取所有 fabric
    const fabrics = await apiGet('/products/all-fabrics');

    // 获取所有成衣（可选：可能为 null）
    const garments = await apiGet('/products/all-garments');

    return {
        fabrics: fabrics.fabrics ?? [],
        garments: garments.garments ?? []
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

        const { fabric_id, used_quantity } = payload;

        if (!fabric_id || !used_quantity) {
            return {
                success: false,
                message: 'Fabric and used quantity are required.'
            };
        }

        // 写入后端 fabric usage
        await apiPost('/inventory/out', payload);

        throw redirect(303, '/admin/inventory');
    }
};
