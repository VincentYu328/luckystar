import { api } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, params }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const id = params.id;

    // 获取付款记录
    const payment = await api.payments.get(id);

    if (!payment || payment.error) {
        throw error(404, 'Payment not found');
    }

    // 必须是银行转账
    if (payment.payment_method !== 'transfer') {
        throw error(400, 'Only transfer payments require verification');
    }

    return { payment };
}

export const actions = {
    verify: async ({ locals, params }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const id = params.id;

        try {
            await api.payments.verify(id);

            throw redirect(303, `/admin/payments/${id}`);
        } catch (err) {
            return {
                error: err.message || 'Failed to verify payment'
            };
        }
    }
};
