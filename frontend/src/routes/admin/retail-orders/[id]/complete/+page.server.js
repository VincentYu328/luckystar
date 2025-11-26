// frontend/src/routes/admin/retail-orders/[id]/complete/+page.server.js
import { apiGet, apiPost } from '$lib/server/api.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
    const user = locals.authUser;
    if (!user || user.type !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const { id } = params;

    const orderRes = await apiGet(`/retail-orders/${id}`);
    if (!orderRes || !orderRes.order) {
        throw error(404, 'Order not found');
    }

    const itemsRes = await apiGet(`/retail-orders/${id}/items`);

    return {
        order: orderRes.order,
        items: itemsRes.items ?? []
    };
}

export const actions = {
    complete: async ({ params, locals }) => {
        const user = locals.authUser;
        if (!user || user.type !== 'staff') {
            throw error(403, 'Forbidden');
        }

        const orderId = params.id;

        const res = await apiPost(`/retail-orders/${orderId}/complete`, {});

        if (!res.success) {
            return { error: res.error || 'Failed to complete order.' };
        }

        throw redirect(303, `/admin/retail-orders/${orderId}`);
    }
};
