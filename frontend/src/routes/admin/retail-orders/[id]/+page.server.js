// src/routes/admin/retail-orders/[id]/+page.server.js

import { redirect, error } from '@sveltejs/kit'; // 确保引入 error
import { api } from '$lib/server/api.js';
import { cleanForm } from '$lib/server/form-utils.js'; // 确保 cleanForm 已引入

// =====================================================
// LOAD FUNCTION (获取订单详情 - 最终修正版)
// =====================================================
export async function load({ params, url, locals }) {
    const user = locals.authUser;

    // 权限检查 (保留不变)
    if (!user || user.type !== 'staff') {
        throw redirect(302, '/auth/login?redirect=/admin/retail-orders');
    }

    const orderId = Number(params.id); 

    if (isNaN(orderId)) {
        console.error("[LOAD ERROR] Invalid order ID format (NaN):", params.id);
        throw redirect(303, '/admin/retail-orders');
    }

    try {
        // 1. 获取订单详情
        const orderRes = await api.retailOrders.get(orderId);
        
        // 调试步骤：打印 API 的原始响应
        console.log("[DEBUG API Response]", JSON.stringify(orderRes)); 
        
        // ⭐ 修正检查逻辑：只需要检查响应对象本身是否存在，并且有 ID 即可
        if (!orderRes || !orderRes.id) { 
            console.error("[LOAD ERROR] Order data missing or API error:", orderId);
            throw redirect(303, '/admin/retail-orders');
        }
        
        // 2. 获取产品列表 (保留不变)
        const productsRes = await api.products.list().catch(err => {
            console.warn("[WARN] Failed to load products list:", err.message);
            return { products: [] };
        });

        return {
            // ⭐ 修正返回结构：orderRes 就是 order 对象
            order: orderRes,
            items: orderRes.items || [], 
            products: productsRes.products || [],
            isEditing: url.searchParams.has('edit')
        };

    } catch (err) {
        // 捕获 API 抛出的实际错误，并重定向 (保留不变)
        console.error("[LOAD /admin/retail-orders/[id]] Error fetching order:", orderId, err.message); 
        throw redirect(303, `/admin/retail-orders?error=${encodeURIComponent('Failed to fetch order detail: ' + err.message)}`);
    }
}

// =====================================================
// ACTIONS (UPDATE ORDER - 原有代码保留)
// =====================================================
export const actions = {
    update: async ({ locals, params, request }) => {
        const user = locals.authUser;

        // 权限检查
        if (!user || user.type !== 'staff') {
            throw redirect(303, '/auth/login?redirect=/admin/retail-orders');
        }

        const orderId = Number(params.id);
        if (isNaN(orderId)) {
            throw redirect(303, '/admin/retail-orders');
        }

        const formData = await request.formData();
        const cleanedData = cleanForm(Object.fromEntries(formData));
        
        console.log("[ACTION /retail-orders/[id]?/update] updating order:", orderId, cleanedData);

        try {
            // 准备更新数据
            const updateData = {
                customer_name: cleanedData.customer_name || null,
                customer_phone: cleanedData.customer_phone || null,
                customer_address: cleanedData.customer_address || null,
                status: cleanedData.status || 'pending',
                notes: cleanedData.notes || null
            };

            const res = await api.retailOrders.update(orderId, updateData);

            if (res.success) {
                // 更新成功，重定向回查看模式
                throw redirect(303, `/admin/retail-orders/${orderId}?updateSuccess=true`);
            } else {
                throw redirect(303, `/admin/retail-orders/${orderId}?edit=true&error=${encodeURIComponent(res.error || 'Update failed')}`);
            }

        } catch (err) {
            console.error("[ACTION /retail-orders/[id]?/update] Error:", err.message);
            throw redirect(303, `/admin/retail-orders/${orderId}?edit=true&error=${encodeURIComponent(err.message || 'Update failed')}`);
        }
    }
};