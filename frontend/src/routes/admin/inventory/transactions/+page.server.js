// frontend/src/routes/admin/inventory/transactions/+page.server.js
import { apiGet } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 所有库存流水
    const tx = await apiGet('/inventory/transactions');

    // 产品（用于显示 SKU / 名称）
    const products = await apiGet('/products/all');

    // 转换为 Map 方便查
    const productMap = new Map();
    (products.products ?? []).forEach(p => productMap.set(p.id, p));

    // 为每条流水加 SKU / 名称
    const rows = (tx.transactions ?? []).map(t => {
        const p = productMap.get(t.product_id);
        return {
            ...t,
            product_sku: p?.sku ?? '(deleted)',
            product_name: p?.name ?? '(deleted)'
        };
    });

    return { rows };
}
