// frontend/src/routes/admin/payments/+page.server.js
import { redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ locals, url }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw redirect(302, '/auth/login?redirect=/admin/payments');
    }

    try {
        // 🔥 修复：获取付款记录
        const res = await api.payments.list();
        
        console.log("[LOAD /admin/payments] fetched payments:", res.payments ? res.payments.length : 0);

        return {
            payments: res.payments ?? []
        };

    } catch (err) {
        console.error("[LOAD /admin/payments] Error:", err);
        
        return {
            payments: []
        };
    }
}