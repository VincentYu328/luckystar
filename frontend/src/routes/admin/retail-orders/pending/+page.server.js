// frontend/src/routes/admin/retail-orders/pending/+page.server.js

import { redirect, error } from '@sveltejs/kit';
import { api } from '$lib/server/api.js'; 
import { cleanForm } from '$lib/server/form-utils.js'; // Assuming form utility exists

// =====================================================
// LOAD FUNCTION (Data Fetching)
// =====================================================
export async function load({ locals, url }) {
    const user = locals.authUser;

    if (!user || user.role !== 'staff') {
        throw redirect(302, '/auth/login?redirect=/admin/retail-orders/pending');
    }

    try {
        // ⭐ Call the correct API method: GET /api/retail-orders/pending
        const res = await api.get('/retail-orders/pending');
        
        console.log("[LOAD /admin/retail-orders/pending] fetched pending orders:", res.orders ? res.orders.length : 0);

        // Pass operation results from URL search params
        const actionSuccess = url.searchParams.get('success') === 'true';
        const actionError = url.searchParams.get('error') || null;

        return {
            orders: res.orders ?? [],
            actionSuccess,
            actionError,
        };

    } catch (err) {
        console.error("[LOAD /admin/retail-orders/pending] Error fetching pending orders:", err);
        throw error(500, err.message || 'Failed to load pending orders from API');
    }
}

// =====================================================
// ACTIONS (Confirm/Cancel/Delete)
// =====================================================
export const actions = {
    // Action to Confirm or Cancel the order status
    updateStatus: async ({ locals, request }) => {
        const user = locals.authUser;
        if (!user || user.role !== 'staff') {
            throw redirect(303, '/auth/login?redirect=/admin/retail-orders/pending');
        }

        const formData = await request.formData();
        // ⭐ Rule 12: Clean form data (assuming cleanForm maps to your required logic)
        const cleanedData = cleanForm(Object.fromEntries(formData)); 
        
        const orderId = Number(cleanedData.order_id);
        const newStatus = cleanedData.status;

        if (!orderId || !newStatus) {
            throw redirect(303, `/admin/retail-orders/pending?error=${encodeURIComponent('Missing order id or status')}`);
        }
        
        try {
            // ⭐ Call the backend API: PATCH /api/retail-orders/:id/status
            await api.patch(`/retail-orders/${orderId}/status`, { status: newStatus });
            
            // Rule 14: Redirect on success
            throw redirect(303, '/admin/retail-orders/pending?success=true');
            
        } catch (err) {
            console.error("[ACTION /updateStatus] Error:", err.message);
            // Rule 14: Redirect with error message
            throw redirect(303, `/admin/retail-orders/pending?error=${encodeURIComponent(err.message || 'Update failed')}`);
        }
    },
    
    // Delete action (Placeholder, can be implemented later based on the existing API structure)
    delete: async ({ locals, request }) => {
        const user = locals.authUser;
        if (!user || user.role !== 'staff') {
            throw redirect(303, '/auth/login?redirect=/admin/retail-orders/pending');
        }
        
        const formData = await request.formData();
        const cleanedData = cleanForm(Object.fromEntries(formData));
        const orderId = Number(cleanedData.order_id);

        try {
            await api.retailOrders.delete(orderId);
            
            throw redirect(303, '/admin/retail-orders/pending?success=true');
        } catch (err) {
             console.error("[ACTION /delete] Error:", err.message);
            throw redirect(303, `/admin/retail-orders/pending?error=${encodeURIComponent(err.message || 'Delete failed')}`);
        }
    }
};