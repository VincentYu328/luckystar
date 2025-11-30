// frontend/src/routes/admin/inventory/garment-in/+page.server.js
import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Permission denied');
    }

    let allProducts = [];
    try {
        const res = await api.products.list();
        console.log('[DEBUG] Products response:', res); // 添加日志
        allProducts = Array.isArray(res.products) ? res.products : [];
    } catch (err) {
        console.error("[ERROR] Error fetching product list:", err);
        // 返回空数组而不是让页面崩溃
        allProducts = [];
    }

    const garments = allProducts.filter(p => p.product_type === 'garment');
    
    console.log('[DEBUG] Filtered garments:', garments); // 添加日志

    return {
        garments,
        user
    };
}

export const actions = {
    create: async ({ request, locals }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403, 'Permission denied');
        }

        const form = Object.fromEntries(await request.formData());

        const {
            garment_id,
            quantity,
            unit_cost,
            source_type,
            source_reference,
            notes
        } = form;

        if (!garment_id || !quantity) {
            return {
                success: false,
                error: 'garment_id and quantity required',
                data: form // 返回表单数据以便回显
            };
        }

        const payload = {
            garment_id: Number(garment_id),
            quantity: Number(quantity),
            unit_cost: unit_cost ? Number(unit_cost) : null,
            source_type: source_type || null,
            source_reference: source_reference || null,
            notes: notes || null
        };

        try {
            const res = await api.products.recordGarmentIncoming(payload);

            if (res?.error || !res?.success) {
                return {
                    success: false,
                    error: res.error || 'Failed to record garment incoming',
                    data: form
                };
            }

            throw redirect(303, '/admin/inventory');
        } catch (err) {
            // 如果不是 redirect，说明是真正的错误
            if (err.status === 303) {
                throw err; // 重新抛出 redirect
            }
            
            console.error('[ERROR] Failed to record garment incoming:', err);
            return {
                success: false,
                error: 'Server error: ' + (err.message || 'Unknown error'),
                data: form
            };
        }
    }
};