import { writable } from 'svelte/store';

// -----------------------------------------------------------
// Store Persistence to SessionStorage
// -----------------------------------------------------------

function loadPendingOrder() {
    if (typeof sessionStorage === "undefined") return null;
    try {
        const data = sessionStorage.getItem("pending_checkout");
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function loadLastSubmittedOrder() {
    if (typeof sessionStorage === "undefined") return null;
    try {
        const data = sessionStorage.getItem("last_submitted_order");
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

// (1) Create writable stores
export const pendingCheckout = writable(loadPendingOrder());
export const lastSubmittedOrder = writable(loadLastSubmittedOrder()); // ⭐ NEW

// (2) Persist stores to SessionStorage whenever they change
pendingCheckout.subscribe(value => {
    if (typeof sessionStorage !== "undefined") {
        if (value) {
            sessionStorage.setItem("pending_checkout", JSON.stringify(value));
        } else {
            sessionStorage.removeItem("pending_checkout");
        }
    }
});

lastSubmittedOrder.subscribe(value => { // ⭐ NEW subscription
    if (typeof sessionStorage !== "undefined") {
        if (value) {
            sessionStorage.setItem("last_submitted_order", JSON.stringify(value));
        } else {
            sessionStorage.removeItem("last_submitted_order");
        }
    }
});


// -----------------------------------------------------------
// Store Operations
// -----------------------------------------------------------

export function transferCartToPending(cartItems, totalPrice) {
    if (cartItems.length === 0) {
        pendingCheckout.set(null);
        return;
    }
    
    // Clear last submission status when new cart checkout starts
    lastSubmittedOrder.set(null); // ⭐ NEW: Clean up previous state

    const newPendingOrder = {
        items: JSON.parse(JSON.stringify(cartItems)), 
        total_price: totalPrice,
        temp_id: Date.now(),
    };
    
    pendingCheckout.set(newPendingOrder);
}

export function clearPendingCheckout() {
    pendingCheckout.set(null);
}

// ⭐ NEW: Saves the pending order data and clears the pending state
export function markOrderAsSubmitted(orderData, newOrderId) {
    // 1. Save data to the submission state for display
    lastSubmittedOrder.set({
        ...orderData,
        submitted_at: Date.now(),
        final_id: newOrderId 
    });
    
    // 2. Clear the pending state, triggering display change
    pendingCheckout.set(null);
}

export function clearLastSubmittedOrder() {
    lastSubmittedOrder.set(null);
}