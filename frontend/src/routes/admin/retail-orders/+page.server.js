// frontend/src/routes/admin/retail-orders/+page.server.js
import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ locals, url }) {
    const user = locals.authUser;

    // 权限检查：所有 staff 均可查看订单
    if (!user || user.type !== 'staff') {
        throw redirect(302, '/auth/login?redirect=/admin/retail-orders');
    }

    try {
        // 🔥 修复：使用统一的 api 对象调用方式
        // 如果您的 api.js 中有 retailOrders.list，使用它
        // 如果没有，需要先在 api.js 中添加
        const res = await api.retailOrders.list();
        
        console.log("[LOAD /admin/retail-orders] fetched orders:", res.orders ? res.orders.length : 0);

        // 从 URL 中获取操作结果（为未来的删除/更新功能准备）
        const deleteSuccess = url.searchParams.get('deleteSuccess') === 'true';
        const deleteError = url.searchParams.get('deleteError') || null;
        const updateSuccess = url.searchParams.get('updateSuccess') === 'true';
        const updateError = url.searchParams.get('updateError') || null;

        return {
            orders: res.orders ?? [],
            deleteSuccess,
            deleteError,
            updateSuccess,
            updateError
        };

    } catch (err) {
        console.error("[LOAD /admin/retail-orders] Error fetching orders:", err);
        
        return {
            orders: [],
            deleteSuccess: false,
            deleteError: null,
            updateSuccess: false,
            updateError: err.message || 'Failed to load orders'
        };
    }
}

// 🔥 为未来添加 actions（删除、更新状态等）
export const actions = {
    updateStatus: async ({ locals, request }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw redirect(302, '/auth/login?redirect=/admin/retail-orders');
        }

        const formData = await request.formData();
        const orderId = Number(formData.get('order_id'));
        const newStatus = formData.get('status');

        if (!orderId || !newStatus) {
            throw redirect(303, `/admin/retail-orders?updateError=${encodeURIComponent('Missing order id or status')}`);
        }

        try {
            const res = await api.retailOrders.updateStatus(orderId, newStatus);
            
            if (res.success) {
                throw redirect(303, '/admin/retail-orders?updateSuccess=true');
            } else {
                throw redirect(303, `/admin/retail-orders?updateError=${encodeURIComponent(res.error || 'Update failed')}`);
            }
        } catch (err) {
            console.error("[ACTION /admin/retail-orders?/updateStatus] Error:", err);
            throw redirect(303, `/admin/retail-orders?updateError=${encodeURIComponent(err.message || 'Update failed')}`);
        }
    },

    delete: async ({ locals, request }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw redirect(302, '/auth/login?redirect=/admin/retail-orders');
        }

        const formData = await request.formData();
        const orderId = Number(formData.get('order_id'));

        if (!orderId) {
            throw redirect(303, `/admin/retail-orders?deleteError=${encodeURIComponent('Missing order id')}`);
        }

        try {
            const res = await api.retailOrders.delete(orderId);
            
            if (res.success) {
                throw redirect(303, '/admin/retail-orders?deleteSuccess=true');
            } else {
                throw redirect(303, `/admin/retail-orders?deleteError=${encodeURIComponent(res.error || 'Delete failed')}`);
            }
        } catch (err) {
            console.error("[ACTION /admin/retail-orders?/delete] Error:", err);
            throw redirect(303, `/admin/retail-orders?deleteError=${encodeURIComponent(err.message || 'Delete failed')}`);
        }
    }
};