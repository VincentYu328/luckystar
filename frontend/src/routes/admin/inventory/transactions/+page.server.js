// frontend/src/routes/admin/inventory/transactions/+page.server.js
import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 1) 库存流水
    const txRes = await api.inventory.transactions();
    const txRows = Array.isArray(txRes.items) ? txRes.items : [];

    // 2) 产品列表
    const prodRes = await api.products.list();
    
    // ★ 这里必须根据你真实的后端返回字段来改：
    // 假设后端返回 { items: [...] }
    const products = Array.isArray(prodRes.items) ? prodRes.items : [];

    const productMap = new Map();
    products.forEach(p => productMap.set(p.id, p));

    // 3) 追加 SKU
    const rows = txRows.map(t => {
        const p = productMap.get(t.product_id);
        return {
            ...t,
            product_sku: p?.sku ?? '(deleted)',
            product_name: p?.name ?? '(deleted)'
        };
    });

    return { rows };
}
