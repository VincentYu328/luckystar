// frontend/src/routes/admin/retail-orders/+page.server.js

import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';
import { cleanForm } from '$lib/server/form-utils.js'; // 规则 12 依赖

// =====================================================
// LOAD FUNCTION (获取订单列表)
// =====================================================
export async function load({ locals, url }) {
    const user = locals.authUser;

    // 权限检查：使用您旧版本中的 'type' 字段（或 'role'，但先以 'type' 为准）
    if (!user || user.type !== 'staff') { // ⚠️ 统一权限字段: user.type
        throw redirect(302, '/auth/login?redirect=/admin/retail-orders');
    }

    let res;
    try {
        // 遵守规则 11：API 模式 A
        res = await api.retailOrders.list();
        
        console.log("[LOAD /admin/retail-orders] fetched orders count:", res.orders ? res.orders.length : 0); // 规则 13

    } catch (err) {
        console.error("[LOAD /admin/retail-orders] Error fetching orders:", err.message);
        // 遵守规则 3/4：API 错误时，返回类型稳定的空数据，防止前端崩溃
        return {
            orders: [], 
            deleteSuccess: false,
            deleteError: null,
            updateSuccess: false,
            updateError: `Loading Failed: ${err.message || 'Failed to fetch orders from API.'}`
        };
    }
    
    const deleteSuccess = url.searchParams.get('deleteSuccess') === 'true';
    const deleteError = url.searchParams.get('deleteError') || null;
    const updateSuccess = url.searchParams.get('updateSuccess') === 'true';
    const updateError = url.searchParams.get('updateError') || null;

    return {
        // 遵守规则 3/4/6
        orders: Array.isArray(res?.orders) ? res.orders : [],
        deleteSuccess,
        deleteError,
        updateSuccess,
        updateError
    };
}


// =====================================================
// ACTIONS (DELETE)
// =====================================================
export const actions = {
    delete: async ({ locals, request }) => {
        const user = locals.authUser;
        
        // 权限检查失败，必须使用 303 重定向 (解决 302 循环风险)
        if (!user || user.type !== 'staff') { // ⚠️ 统一权限字段: user.type
            throw redirect(303, '/auth/login?redirect=/admin/retail-orders');
        }

        const formData = await request.formData();
        // ⭐ 遵守规则 12：使用 cleanForm 处理 FormData
        const cleanedData = cleanForm(Object.fromEntries(formData));
        console.log("[ACTION /retail-orders?/delete] cleaning result:", cleanedData); // 规则 13

        const orderId = cleanedData.order_id; // cleanForm 会确保它是 Number 或 null

        if (!orderId) {
            throw redirect(303, `/admin/retail-orders?deleteError=${encodeURIComponent('Missing order id')}`);
        }

        try {
            const res = await api.retailOrders.delete(orderId);
            
            if (res.success) {
                // 遵守规则 14：POST 成功后必须 redirect(303)
                throw redirect(303, '/admin/retail-orders?deleteSuccess=true');
            } else {
                throw redirect(303, `/admin/retail-orders?deleteError=${encodeURIComponent(res.error || 'Delete failed from API response')}`);
            }
        } catch (err) {
            console.error("[ACTION /retail-orders?/delete] Runtime Error:", err.message); // 规则 13
            throw redirect(303, `/admin/retail-orders?deleteError=${encodeURIComponent(err.message || 'Delete failed')}`);
        }
    }
    // 您可以根据需要添加 updateStatus action，确保它也使用 303
};