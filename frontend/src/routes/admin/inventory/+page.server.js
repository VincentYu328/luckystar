// frontend/src/routes/admin/inventory/+page.server.js
import { apiGet } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

/**
 * Inventory Overview
 * - Fabric stock: v_fabric_stock
 * - Garment stock: v_stock_levels
 */
export async function load({ locals }) {
    const user = locals.authUser;

    // SSR 保护（再保险）
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // === 获取布料库存 ===
    const fabricStock = await apiGet('/inventory/fabrics');

    // === 获取成衣库存 ===
    const garmentStock = await apiGet('/inventory/garments');

    return {
        fabricStock: fabricStock.items ?? [],
        garmentStock: garmentStock.items ?? []
    };
}
