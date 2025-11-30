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

    // ⭐ 修正：根据后端的路由定义（通常返回 { count, stock: list }）
    const res = await api.inventory.fabricList();

    return {
        // ⭐ 确保使用正确的键名！假设后端返回的列表键是 'stock'
        fabrics: Array.isArray(res.stock) ? res.stock : [],
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