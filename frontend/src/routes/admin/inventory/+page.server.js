// frontend/src/routes/admin/inventory/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, fetch, cookies }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // ⭐ 获取布料库存
    const fabricRes = await api.inventory.fabricList({}, { fetch, cookies });
    const fabricStock = Array.isArray(fabricRes.items) ? fabricRes.items : [];

    // ⭐ 获取成衣库存
    const garmentRes = await api.inventory.garmentList({}, { fetch, cookies });
    const garmentStock = Array.isArray(garmentRes.items) ? garmentRes.items : [];

    return {
        fabricStock,
        garmentStock,
        user
    };
}
