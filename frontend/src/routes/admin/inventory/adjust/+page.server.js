// frontend/src/routes/admin/inventory/adjust/+page.server.js
import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

// --------------------------------------------------
// load()
// --------------------------------------------------
export async function load({ locals }) {
    const user = locals.authUser;

    // ⭐ 只有 Admin/Head
    if (!user || user.type !== 'staff' || user.role_name !== 'admin') {
        throw error(403, 'Forbidden');
    }

    // ⭐ 模式 A：不传 fetch/cookies
    const res = await api.inventory.fabricList();

    return {
        fabrics: Array.isArray(res.items) ? res.items : []
    };
}

// --------------------------------------------------
// actions.adjust
// --------------------------------------------------
export const actions = {
    adjust: async ({ locals, request }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff' || user.role_name !== 'admin') {
            throw error(403, 'Forbidden');
        }

        const form = await request.formData();

        const product_id = Number(form.get('product_id'));
        const new_quantity = Number(form.get('new_quantity'));
        const note = form.get('note') || '';

        if (!product_id || Number.isNaN(new_quantity)) {
            return {
                success: false,
                error: 'product_id and valid new_quantity are required.'
            };
        }

        // ⭐ 模式 A：只传 data，不传 ctx
        const res = await api.inventory.adjust({
            product_id,
            new_quantity,
            reason: note
        });

        if (res?.error) {
            return {
                success: false,
                error: res.error
            };
        }

        throw redirect(303, '/admin/inventory');
    }
};
