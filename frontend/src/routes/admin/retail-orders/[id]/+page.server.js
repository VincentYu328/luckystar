// frontend/src/routes/admin/retail-orders/create/+page.server.js

import { api } from '$lib/server/api.js';
import { redirect } from '@sveltejs/kit'; // 移除 error 导入，避免抛出 500
// import { cleanForm } from '$lib/server/form-utils.js'; // 不需要 cleanForm

// =====================================================
// LOAD FUNCTION: Fetch Products
// =====================================================
export async function load({ locals }) {
    const user = locals.authUser;

    // 权限检查：使用 'role' (来自 JWT)
    if (!user || user.role !== 'admin') { // ⚠️ 假设 staff 必须是 'admin' 或您项目中定义的角色
        throw redirect(302, '/auth/login?redirect=/admin/retail-orders/create');
    }

    let products = [];
    try {
        // 遵守规则 11：API 模式 A
        const res = await api.products.list(); 
        
        console.log("[LOAD /admin/retail-orders/create] fetched products count:", res.products ? res.products.length : 0);

        // 遵守规则 3/4/6：确保返回结构稳定
        products = Array.isArray(res.products) ? res.products : [];
        
    } catch (err) {
         console.error("[LOAD /admin/retail-orders/create] API Error fetching products:", err.message);
         // ⚠️ 关键修复：API 错误不抛出 SvelteKit error(500)，只返回空数据
         // 这样即使 API 离线，页面也能加载（显示空列表/错误提示），不会进入循环。
    }
    
    return {
        products: products,
        // 返回一个通用的错误提示，供前端显示
        loadError: products.length === 0 ? 'Failed to load products. API might be offline.' : null 
    };
}

// =====================================================
// ACTIONS: Create Order
// =====================================================
export const actions = {
    create: async ({ locals, request }) => {
        const user = locals.authUser;
        if (!user || user.role !== 'admin') { // ⚠️ 统一权限字段
            // Rule 14: Action redirects must use 303
            throw redirect(303, '/auth/login?redirect=/admin/retail-orders/create');
        }
        // ... (其余 Action 逻辑保持不变)
        // ... (确保 action 成功时 throw redirect(303, ...) )
        
        const formData = await request.formData();
        const rawPayloadString = formData.get('payload'); 
        
        if (!rawPayloadString) {
            return { success: false, message: 'Invalid payload submitted (Missing JSON payload).' };
        }
        
        try {
            const payload = JSON.parse(rawPayloadString);
            
            console.log("[ACTION /admin/retail-orders/create] Received JSON payload:", payload);

            const res = await api.retailOrders.create(user.id, payload);

            if (!res.id) { 
                return { success: false, message: res.error || 'Failed to receive new order ID.' };
            }

            // ⭐ Rule 14: Redirect on success using 303
            throw redirect(303, `/admin/retail-orders/${res.id}`);

        } catch (err) {
            console.error("[ACTION /admin/retail-orders/create] Creation failed:", err.message);

            if (err.status === 303 || err.status === 302) throw err;
            
            return {
                success: false,
                message: err.message || 'Failed to create order due to server error.'
            };
        }
    }
};