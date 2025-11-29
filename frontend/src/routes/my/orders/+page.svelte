<!-- frontend\src\routes\my\orders\+page.svelte -->

<script>
    import { pendingCheckout, clearPendingCheckout, lastSubmittedOrder, clearLastSubmittedOrder, markOrderAsSubmitted } from '$lib/stores/checkout-store.js'; 
    import { invalidateAll } from '$app/navigation'; // Needed for refresh
    
    // Auto-subscribe to both stores
    // $pendingCheckout: Shows the "Pending for Submission" block
    // $lastSubmittedOrder: Shows the "Submitted" feedback block
    
    export let data;

    const user = data.user ?? {}; 
    const orders = Array.isArray(data.orders) ? data.orders : [];

    // ------------------------------------------------------------------
    // ⭐ IMPORTANT: We use the CLIENT-SIDE handleSubmitOrder function here
    // This removes dependency on SvelteKit Action/enhance which was failing
    // ------------------------------------------------------------------
    
    /**
     * Executes the order submission via a direct CLIENT-SIDE fetch request.
     */
    async function handleSubmitOrder() {
        if (!$pendingCheckout) return;

        // 1. Prepare Payload
        const orderPayload = {
            items: $pendingCheckout.items.map(item => ({
                product_id: item.product_id,
                name: item.name,
                price_snapshot: item.price, 
                quantity: item.qty,
            })),
            total: $pendingCheckout.total_price,
        };

        console.log("[Client Submission] Attempting direct API call:", orderPayload);

        try {
            // ⭐ Call the API directly using the path, relying on backend's CORS
            const response = await fetch('/api/customers/me/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // JWT token should be automatically sent via credentials: 'include' 
                    // or handled by your global API wrapper/hooks setup.
                },
                credentials: 'include',
                body: JSON.stringify(orderPayload)
            });

            const result = await response.json();

            if (response.ok) {
                // 2. SUCCESS: Mark order as submitted in the client store
                const newOrderId = result.id || 'N/A';
                markOrderAsSubmitted(orderPayload, newOrderId);
                
                // 3. Optional: Refresh order history in the background
                invalidateAll();
                
            } else {
                // 4. FAILURE
                const errorMessage = result.error || response.statusText;
                alert(`Order submission failed: ${errorMessage}`);
                console.error("[Client Submission Error]", errorMessage);
            }

        } catch (error) {
            alert(`A network error occurred during submission: ${error.message}`);
            console.error("[Network Error during Submission]", error);
        }
    }


    /**
     * Packages $pendingCheckout data into a temporary JSON string. (Not used for submission anymore)
     */
    function getOrderPayload() {
        // This function is now redundant but kept as a placeholder if needed
        if (!$pendingCheckout) return '{}';
        
        const orderPayload = {
            items: $pendingCheckout.items.map(item => ({
                product_id: item.product_id,
                name: item.name,
                price_snapshot: item.price, 
                quantity: item.qty,
            })),
            total: $pendingCheckout.total_price,
        };
        
        return JSON.stringify(orderPayload);
    }
</script>

<div class="max-w-4xl mx-auto py-10 space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">My Orders</h1>

    <!-- 1. Submitted Confirmation Section -->
    {#if $lastSubmittedOrder}
        <!-- Content remains the same as previous step -->
        <section class="border border-gray-400 bg-gray-50 p-6 rounded-lg space-y-4">
            <h2 class="text-2xl font-semibold text-gray-800 flex items-center">
                ✅ You have submitted the following order requests
            </h2>
            
            <p class="text-gray-700">
                We will review your application as soon as possible. Please be reminded that no order will come into effect until we have approved it.
            </p>

            <ul class="list-disc pl-5 space-y-1 text-sm">
                {#each $lastSubmittedOrder.items as item}
                    <li>
                        {item.name} x {item.qty} 
                        <span class="font-medium text-gray-700 ml-2">(${item.price?.toFixed(2) || '0.00'} each)</span>
                    </li>
                {/each}
            </ul>

            <div class="text-lg font-bold text-gray-900 pt-2">
                Total Amount: ${$lastSubmittedOrder.total_price?.toFixed(2) || '0.00'}
            </div>
            
            <div class="flex gap-4 pt-3">
                <a href={`/my/orders/${$lastSubmittedOrder.final_id}`} class="text-blue-600 hover:underline font-medium">
                    View Order #{$lastSubmittedOrder.final_id} Details →
                </a>
                <button
                    type="button" 
                    on:click={clearLastSubmittedOrder}
                    class="text-gray-600 hover:text-gray-900 transition"
                >
                    Dismiss
                </button>
            </div>
        </section>

    <!-- 2. Pending Submission Section (Original) -->
    {:else if $pendingCheckout} 
        <!-- ⭐ Removed <form> and use:enhance -->
        <div 
            class="border border-yellow-400 bg-yellow-50 p-6 rounded-lg space-y-4"
        >
            <h2 class="text-2xl font-semibold text-yellow-800 flex items-center">
                🛒 You have the following orders pending for submission
            </h2>
            
            <p class="text-gray-700">
                Please review the items below and submit your order request. Our staff will process it after submission.
            </p>

            <ul class="list-disc pl-5 space-y-1 text-sm">
                {#each $pendingCheckout.items as item}
                    <li>
                        {item.name} x {item.qty} 
                        <span class="font-medium text-gray-700 ml-2">(${item.price?.toFixed(2) || '0.00'} each)</span>
                    </li>
                {/each}
            </ul>

            <div class="text-lg font-bold text-gray-900 pt-2">
                Total Amount: ${$pendingCheckout.total_price?.toFixed(2) || '0.00'}
            </div>

            <div class="flex gap-4 pt-3">
                <button
                    type="button" 
                    on:click={handleSubmitOrder}
                    class="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 font-medium transition"
                >
                    Confirm & Submit Order
                </button>
                <button
                    type="button" 
                    on:click={clearPendingCheckout}
                    class="text-red-600 py-2 px-6 rounded-lg border border-red-300 hover:bg-red-50 transition"
                >
                    Cancel Order Request
                </button>
            </div>
        </div>
    {/if}

    <!-- 3. Order History Section -->
    <h2 class="text-2xl font-semibold tracking-tight pt-4">Order History</h2>
    
    <!-- Rest of the orders history section remains the same -->
    {#if orders.length === 0 && !$pendingCheckout && !$lastSubmittedOrder}
        <p class="text-gray-500">
            You have not submitted any order requests yet.
        </p>
    {:else if orders.length > 0}
        
        <div class="space-y-4">
            {#each orders as o}
                <a
                    href={`/my/orders/${o.id}`}
                    class="block border rounded-lg p-4 hover:bg-gray-50 transition"
                >
                    <div class="flex justify-between">
                        <div>
                            <div class="font-semibold text-lg">
                                Order #{o.id}
                            </div>
                            <div class="text-gray-600 text-sm">
                                Created: {new Date(o.created_at || Date.now()).toLocaleDateString()}
                            </div>
                            <div class="text-gray-600 text-sm">
                                Status: 
                                <span class="font-medium text-blue-700">
                                    {o.status || 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div class="text-right">
                            <div class="text-gray-800 font-semibold">
                                ${o.total_price?.toFixed(2) || '0.00'}
                            </div>
                            <div class="text-gray-500 text-sm">
                                View Details →
                            </div>
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    {/if}

</div>