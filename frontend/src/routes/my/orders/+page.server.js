import { redirect, fail } from '@sveltejs/kit';
import { api } from '$lib/server/api.js'; 
import { enhance } from '$app/forms';

// ===================================
// LOAD FUNCTION (Handles Data Fetching)
// ===================================

export async function load({ locals, url }) {
    console.log("[LOAD my/orders] Attempting to load customer orders.");

    const authUser = locals.authUser;

    if (!authUser || authUser.type !== 'customer') {
        const redirectTo = encodeURIComponent(url.pathname + url.search);
        throw redirect(302, `/auth/login?redirect=${redirectTo}`);
    }

    let orders = [];
    try {
        // Fetch historical orders for the customer
        const res = await api.my.orders(); 
        orders = Array.isArray(res.items) ? res.items : [];
    } catch (error) {
        // This likely means the backend API /customers/me/orders is not yet implemented
        console.error("[LOAD my/orders] Failed to fetch historical orders (API missing or error):", error.message);
    }
    
    return {
        user: authUser,
        orders: orders  
    };
}


// ===================================
// ACTIONS (Handles Order Submission)
// ===================================

export const actions = {
    default: async ({ request, locals }) => {
        const authUser = locals.authUser;
        
        if (!authUser || authUser.type !== 'customer') {
            return fail(401, { error: 'Authentication required.' });
        }

        let orderPayload;
        try {
            const formData = await request.formData();
            const rawPayloadString = formData.get('payload'); 
            
            if (!rawPayloadString) {
                return fail(400, { error: 'Missing order data payload.' });
            }

            const rawPayload = JSON.parse(rawPayloadString); 
            
            orderPayload = {
                items: rawPayload.items,
                total: rawPayload.total,
            };

            // Rule 13: Debug log MUST appear if the Action is triggered
            console.log("[ACTION my/orders] FINAL PAYLOAD for API:", orderPayload);

            // ⭐ 1. CALL BACKEND API TO WRITE TO DB (POST /customers/me/orders)
            // The success of this call is crucial for the frontend to receive success status.
            const result = await api.customerOrders.create(orderPayload);
            const newOrderId = result.id || 'N/A';
            
            // ⭐ 2. RETURN SUCCESS DATA TO CLIENT (Rule 14 relaxed for feedback)
            return { 
                success: true,
                orderId: newOrderId,
                orderData: rawPayload // Send payload back to the client for the confirmation block
            }; 

        } catch (error) {
            // Handle API errors thrown by api.js
            console.error("[ACTION my/orders] Submission failed (API Error):", error.message);
            return fail(500, { error: error.message || 'Server error during submission.' });
        }
    }
};