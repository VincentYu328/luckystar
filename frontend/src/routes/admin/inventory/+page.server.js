// frontend/src/routes/admin/inventory/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, fetch, cookies }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    let fabricStock = [];
    let garmentStock = [];

    // 获取布料库存
    try {
        const fabricRes = await api.inventory.fabricList({ fetch, cookies });
        fabricStock = Array.isArray(fabricRes?.stock) ? fabricRes.stock : [];
    } catch (err) {
        console.error("Error loading fabric stock:", err);
        // 可选：设置一个错误标志
        // fabricStock = [];
    }

    // 获取成衣库存
    try {
        const garmentRes = await api.inventory.garmentList({ fetch, cookies });
        garmentStock = Array.isArray(garmentRes?.stock) ? garmentRes.stock : [];
    } catch (err) {
        console.error("Error loading garment stock:", err);
        // 可选：设置一个错误标志
        // garmentStock = [];
    }

    return {
        fabricStock,
        garmentStock,
        user
    };
}