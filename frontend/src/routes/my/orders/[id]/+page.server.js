// frontend\src\routes\my\orders\[id]\+page.server.js

import { redirect, error } from '@sveltejs/kit';
// Assuming api.js is not used here, only native fetch is used, as per your code:

export async function load({ params, locals, fetch, url }) {
    const user = locals.authUser;
    const orderId = params.id;

    // =============================
    // 未登录 → 去登录页
    // =============================
    if (!user || user.type !== 'customer') {
        const redirectTo = encodeURIComponent(url.pathname + url.search);
        throw redirect(302, `/auth/login?redirect=${redirectTo}`);
    }

    // =============================
    // 调用后端安全版 API: GET /api/customers/me/orders/:id
    // =============================
    const res = await fetch(`/api/customers/me/orders/${orderId}`, {
        credentials: 'include'
    });

    if (!res.ok) {
        // This handles 404 from the backend security check
        throw error(res.status, 'Order not found or access denied.');
    }

    const data = await res.json();

    // 假设后端 (CustomerRoutes) 已经确保了权限，并且返回格式是 { order: {...}, items: [...] }
    // 如果后端直接返回 { order: orderWithItems, items: orderWithItems.items }：
    
    // ⭐ FIX: 权限检查不需要了，因为后端已执行

    // ⭐ FIX: 修正数据解构以确保稳定类型
    const order = data.order ?? {};
    const items = Array.isArray(data.items) ? data.items : [];


    return {
        user,
        order: order,
        items: items
    };
}