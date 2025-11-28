// frontend/src/routes/admin/group-orders/+page.server.js
import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ locals, url }) {
    const user = locals.authUser;

    // 仅 STAFF 可访问
    if (!user || user.type !== 'staff') {
        throw redirect(302, '/auth/login?redirect=/admin/group-orders');
    }

    try {
        // 🔥 修复：使用统一的 api 对象
        const res = await api.groupOrders.list();
        
        console.log("[LOAD /admin/group-orders] fetched orders:", res.orders ? res.orders.length : 0);

        // 从 URL 中获取操作结果
        const deleteSuccess = url.searchParams.get('deleteSuccess') === 'true';
        const deleteError = url.searchParams.get('deleteError') || null;
        const createSuccess = url.searchParams.get('createSuccess') === 'true';
        const updateSuccess = url.searchParams.get('updateSuccess') === 'true';

        return {
            orders: res.orders ?? [],
            deleteSuccess,
            deleteError,
            createSuccess,
            updateSuccess
        };

    } catch (err) {
        console.error("[LOAD /admin/group-orders] Error fetching orders:", err);
        
        return {
            orders: [],
            deleteSuccess: false,
            deleteError: err.message || 'Failed to load group orders',
            createSuccess: false,
            updateSuccess: false
        };
    }
}

// 🔥 添加 actions（删除、更新等）
export const actions = {
    delete: async ({ locals, request }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw redirect(302, '/auth/login?redirect=/admin/group-orders');
        }

        const formData = await request.formData();
        const orderId = Number(formData.get('order_id'));

        if (!orderId) {
            throw redirect(303, `/admin/group-orders?deleteError=${encodeURIComponent('Missing order id')}`);
        }

        try {
            const res = await api.groupOrders.delete(orderId);
            console.log("[ACTION /admin/group-orders?/delete] API response:", res);
            
            if (res.success) {
                throw redirect(303, '/admin/group-orders?deleteSuccess=true');
            } else {
                throw redirect(303, `/admin/group-orders?deleteError=${encodeURIComponent(res.error || 'Delete failed')}`);
            }
        } catch (err) {
            console.error("[ACTION /admin/group-orders?/delete] Error:", err);
            throw redirect(303, `/admin/group-orders?deleteError=${encodeURIComponent(err.message || 'Delete failed')}`);
        }
    },

    updateStatus: async ({ locals, request }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw redirect(302, '/auth/login?redirect=/admin/group-orders');
        }

        const formData = await request.formData();
        const orderId = Number(formData.get('order_id'));
        const newStatus = formData.get('status');

        if (!orderId || !newStatus) {
            throw redirect(303, `/admin/group-orders?updateError=${encodeURIComponent('Missing order id or status')}`);
        }

        try {
            const res = await api.groupOrders.updateStatus(orderId, newStatus);
            
            if (res.success) {
                throw redirect(303, '/admin/group-orders?updateSuccess=true');
            } else {
                throw redirect(303, `/admin/group-orders?updateError=${encodeURIComponent(res.error || 'Update failed')}`);
            }
        } catch (err) {
            console.error("[ACTION /admin/group-orders?/updateStatus] Error:", err);
            throw redirect(303, `/admin/group-orders?updateError=${encodeURIComponent(err.message || 'Update failed')}`);
        }
    }
};