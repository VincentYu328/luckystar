// frontend/src/routes/admin/retail-orders/[id]/review/+page.server.js

import { api } from '$lib/server/api.js'; // ⭐ USE UNIFIED API MODULE
import { error, redirect } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit'; // For returning errors from action

export async function load({ params, locals }) {
    const user = locals.authUser;
    if (!user || user.role !== 'staff') {
        throw error(403, 'Forbidden');
    }

    const orderId = Number(params.id);

    // 1. Get Order Details (GET /retail-orders/:id)
    let orderRes;
    try {
        orderRes = await api.retailOrders.get(orderId);
    } catch (err) {
        console.error(`[LOAD /review] Error fetching order ${orderId}:`, err);
        throw error(404, 'Order not found');
    }

    // 2. Get Order Items (GET /retail-orders/:id/items)
    let itemsRes;
    try {
        // This call is redundant if getOrderById returns items, but we use it here 
        // to strictly follow the original flow and fetch from the dedicated items endpoint.
        itemsRes = await api.get(`/retail-orders/${orderId}/items`);
    } catch (err) {
        console.error(`[LOAD /review] Failed to fetch items for order ${orderId}:`, err);
        itemsRes = { items: [] }; // Fail gracefully
    }

    return {
        order: orderRes ?? {},
        items: itemsRes.items ?? []
    };
}

export const actions = {
    confirm: async ({ params, locals }) => {
        const user = locals.authUser;
        if (!user || user.role !== 'staff') {
            throw redirect(303, '/auth/login'); // Rule 14: Redirect on auth fail
        }

        const orderId = Number(params.id);

        try {
            // ⭐ FIX: Use the standard status update API (PATCH /retail-orders/:id/status)
            // This relies on the backend route /retail-orders/:id/status being implemented
            const res = await api.patch(`/retail-orders/${orderId}/status`, { 
                status: 'confirmed' 
            });

            if (res.success) {
                // Rule 14: Redirect back to the order detail page on success
                throw redirect(303, `/admin/retail-orders/${orderId}?updateSuccess=confirmed`);
            } else {
                return fail(400, { error: res.error || 'Order confirmation failed.' });
            }
        } catch (err) {
            console.error(`[ACTION /review/confirm] Error updating status for Order ${orderId}:`, err.message);
            
            if (err.status === 303) throw err; // Re-throw redirect
            
            // Fail and return error message to the form
            return fail(500, { error: err.message || 'Server failed to process confirmation.' });
        }
    }
};