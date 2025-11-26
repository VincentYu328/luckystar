import { api } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 获取所有付款记录
    const payments = await api.payments.list();

    return {
        payments: payments.payments ?? []
    };
}
