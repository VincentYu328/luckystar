// frontend/src/routes/admin/retail-orders/create/+page.server.js

import { api } from '$lib/server/api.js';
import { redirect, fail } from '@sveltejs/kit'; 

// =====================================================
// LOAD FUNCTION
// =====================================================
export async function load({ locals }) {
    console.log('[LOAD] Starting load function');
    console.log('[LOAD] locals.authUser:', locals.authUser);
    
    const user = locals.authUser;

    if (!user || user.role !== 'admin') { 
        console.log('[LOAD] Auth check failed, redirecting');
        throw redirect(302, '/auth/login?redirect=/admin/retail-orders/create');
    }

    let products = [];
    let customers = [];
    let loadError = null;

    try {
        const [productsRes, customersRes] = await Promise.all([
            api.products.list(), 
            api.customers.list()
        ]); 
        
        products = Array.isArray(productsRes.products) ? productsRes.products : [];
        const rawCustomers = customersRes.customers || customersRes.data || customersRes;
        customers = Array.isArray(rawCustomers) ? rawCustomers : [];

        console.log("[LOAD /admin/retail-orders/create] fetched products count:", products.length);
        console.log("[LOAD /admin/retail-orders/create] fetched customers count:", customers.length);
        
        if (products.length === 0 || customers.length === 0) {
            loadError = 'Product list or Customer list is empty.';
        }
        
    } catch (err) {
        console.error("[LOAD /admin/retail-orders/create] API Error:", err.message);
        loadError = err.message || 'Failed to load products/customers.';
    }
    
    return {
        products: products,
        customers: customers, 
        loadError: loadError
    };
}

// =====================================================
// ACTIONS
// =====================================================
export const actions = {
    create: async ({ locals, request }) => {
        console.log("--- ACTION START --- 1. Action Invoked");
        console.log("--- ACTION --- 1.1 locals.authUser:", locals.authUser);
        
        const user = locals.authUser;
        
        // 权限检查
        if (!user || user.role !== 'admin') {
            console.log("--- ACTION --- 1.2 Auth failed, returning failure");
            return fail(403, { 
                message: 'Authentication required. Please log in as an admin.' 
            });
        }
        
        const formData = await request.formData();
        const rawPayloadString = formData.get('payload'); 
        
        console.log("--- ACTION --- 2. Got payload string, length:", rawPayloadString?.length);
        
        if (!rawPayloadString) {
            console.log("--- ACTION --- 2.1 Missing payload");
            return fail(400, { 
                message: 'Invalid payload submitted (Missing JSON payload).' 
            });
        }
        
        try {
            console.log("--- ACTION --- 3. Parsing payload");
            const payload = JSON.parse(rawPayloadString);
            
            const finalPayload = {
                ...payload,
                staff_id: user.id,
            };
            
            console.log("--- ACTION --- 4. Calling API with payload keys:", Object.keys(finalPayload));
            console.log("--- ACTION --- 4.1 Full finalPayload:", JSON.stringify(finalPayload, null, 2));

            const res = await api.retailOrders.create(finalPayload); 
            
            console.log("--- ACTION --- 5. API Response received. Has ID:", !!res?.id);

            if (!res || !res.id) { 
                console.log("--- ACTION --- 5.1 API response missing ID");
                return fail(500, { 
                    message: res?.error || 'Failed to create order. API did not return order ID.' 
                });
            }

            console.log("--- ACTION --- 6. Success! Redirecting to order ID:", res.id);
            throw redirect(303, `/admin/retail-orders/${res.id}`);

        } catch (err) {
            console.error("--- ACTION --- ERROR. Message:", err.message);
            console.error("--- ACTION --- ERROR. Stack:", err.stack);

            // 重新抛出 redirect 异常
            if (err.status === 303 || err.status === 302) {
                throw err;
            }
            
            // 返回 failure
            return fail(500, {
                message: err.message || 'Failed to create order due to server error.'
            });
        }
    }
};