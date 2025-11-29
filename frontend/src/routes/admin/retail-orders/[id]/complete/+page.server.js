// frontend/src/routes/admin/retail-orders/[id]/complete/+page.server.js

import { api } from '$lib/server/api.js'; // ⭐ USE UNIFIED API MODULE
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
    const user = locals.authUser;
    if (!user || user.role !== 'staff') {
        throw redirect(302, `/auth/login?redirect=/admin/retail-orders/${params.id}/complete`);
    }

    const orderId = Number(params.id);

    // 1. Get Order Details (GET /retail-orders/:id)
    let orderRes;
    try {
        // ⭐ FIX: Use unified API method (retailOrders.get)
        orderRes = await api.retailOrders.get(orderId);
    } catch (err) {
        console.error(`[LOAD /complete] Error fetching order ${orderId}:`, err);
        throw error(404, 'Order not found or API error.');
    }

    // 2. Get Order Items (Items are usually nested in the order object from the Service layer)
    // We explicitly call the separate items endpoint to guarantee data fetching consistency
    let itemsRes;
    try {
        // ⭐ FIX: Use unified API method
        itemsRes = await api.get(`/retail-orders/${orderId}/items`);
    } catch (err) {
        console.error(`[LOAD /complete] Failed to fetch items for order ${orderId}:`, err);
        itemsRes = { items: [] }; // Fail gracefully
    }
    
    // 3. Return consolidated data
    return {
        order: orderRes ?? {},
        items: itemsRes.items ?? []
    };
}

export const actions = {
    complete: async ({ params, locals }) => {
        const user = locals.authUser;
        if (!user || user.role !== 'staff') {
            throw redirect(303, '/auth/login'); // Rule 14: Redirect on auth fail
        }

        const orderId = Number(params.id);

        try {
            // ⭐ FIX: We use the dedicated status update API (PATCH /retail-orders/:id/status)
            // The status should be set to 'completed'
            const res = await api.patch(`/retail-orders/${orderId}/status`, { 
                status: 'completed' 
            });

            if (res.success) {
                // Rule 14: Redirect back to the order detail page on success
                // We add a success message query param
                throw redirect(303, `/admin/retail-orders/${orderId}?updateSuccess=completed`);
            } else {
                // If API returns success=false, return failure message
                return { error: res.error || 'Failed to complete order.' };
            }
        } catch (err) {
            console.error(`[ACTION /complete] Error completing order ${orderId}:`, err.message);
            
            if (err.status === 303) throw err; // Re-throw redirect
            
            // Return failure message to the form
            return { error: err.message || 'Server failed to process completion.' };
        }
    }
};