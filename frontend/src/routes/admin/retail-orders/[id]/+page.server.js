// src/routes/admin/retail-orders/[id]/+page.server.js

import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ params, url, locals }) {
    const user = locals.authUser;
    if (!user || !['admin', 'staff'].includes(user.role)) {
        throw redirect(302, '/auth/login');
    }

    const rawId = params.id;

    // 新建模式
    if (rawId === 'create' || rawId === 'new') {
        const products = await api.products.list().then(r => r.products || []).catch(() => []);
        return { mode: 'create', order: null, items: [], products };
    }

    const orderId = Number(rawId);
    if (isNaN(orderId)) throw redirect(303, '/admin/retail-orders');

    const [orderRes, products] = await Promise.all([
        api.retailOrders.get(orderId).catch(() => null),
        api.products.list().then(r => r.products || []).catch(() => [])
    ]);

    if (!orderRes?.order) throw redirect(303, '/admin/retail-orders');

    return {
        mode: 'view',  // 默认查看模式
        order: orderRes.order,
        items: orderRes.items || [],
        products,
        // 如果 URL 带 ?edit=true 就进入编辑模式
        isEditing: url.searchParams.has('edit')
    };
}