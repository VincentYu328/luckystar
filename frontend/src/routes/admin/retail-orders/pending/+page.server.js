// frontend/src/routes/admin/retail-orders/pending/+page.server.js
import { apiGet } from '$lib/server/api.js';
import { error } from '@sveltejs/kit';

export async function load({ locals }) {
    const user = locals.authUser;

    // 所有 staff 均可查看 pending
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    // 后端提供 /retail-orders/pending
    const res = await apiGet('/retail-orders/pending');

    return {
        orders: res.orders ?? []
    };
}
