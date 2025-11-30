// frontend/src/routes/admin/payments/+page.server.js
import { redirect, error } from '@sveltejs/kit';
import { api } from '$lib/server/api.js';

export async function load({ locals, fetch, cookies }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw redirect(302, '/auth/login?redirect=/admin/payments');
    }

    try {
        // 🔥 修复：获取付款记录
        const res = await api.payments.list({ fetch, cookies });

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

export const actions = {
    verify: async ({ request, locals, fetch, cookies }) => {
        const user = locals.authUser;

        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const form = await request.formData();
        const paymentId = Number(form.get('paymentId'));

        try {
            await api.payments.verify(paymentId, { fetch, cookies });

            // Refresh page to show updated status
            throw redirect(303, '/admin/payments');
        } catch (err) {
            if (err.status === 303) throw err;
            console.error('[verify] Error:', err);
            return {
                error: err.message || 'Failed to verify payment.'
            };
        }
    }
};