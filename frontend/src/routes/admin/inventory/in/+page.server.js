// frontend/src/routes/admin/inventory/in/+page.server.js
import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

// =============================
// LOAD — 加载布料列表
// =============================
export async function load({ locals }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403);
    }

    const res = await api.inventory.fabricList();

    return {
        fabrics: Array.isArray(res.items) ? res.items : [],
        user: user
    };
}

// =============================
// ACTIONS — 创建入库记录
// =============================
export const actions = {
    create: async ({ request, locals }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403);
        }

        const form = Object.fromEntries(await request.formData());

        const { fabric_id, quantity } = form;
        if (!fabric_id || !quantity) {
            return { success: false, error: "fabric_id and quantity required" };
        }

        const res = await api.inventory.fabricIn(form);

        if (res?.error) {
            return { success: false, error: res.error };
        }

        throw redirect(303, '/admin/inventory');
    }
};