<script>
    export let data;

    // Rule 4: Defensive check
    const order = data.order ?? {};
    const items = Array.isArray(data.items) ? data.items : [];
</script>

<div class="max-w-4xl mx-auto py-10 space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Order #{order.id}
    </h1>

    <!-- Order Summary -->
    <div class="border rounded-lg p-6 space-y-2 bg-gray-50">
        <div class="text-gray-700">
            <span class="font-medium">Date:</span>
            <!-- Defensive check for date field -->
            {new Date(order.order_date || order.created_at || Date.now()).toLocaleDateString()}
        </div>

        <div class="text-gray-700">
            <span class="font-medium">Status:</span>
            <!-- Display status with dynamic styling -->
            <span class="font-semibold" class:text-yellow-700={order.status === 'pending'} 
                                        class:text-green-700={order.status === 'confirmed' || order.status === 'completed'}
                                        class:text-red-700={order.status === 'cancelled'}>
                {order.status || 'N/A'}
            </span>
        </div>

        <!-- Dynamic Status Message based on current order state -->
        {#if order.status === 'pending'}
            <div class="text-yellow-700 font-medium pt-2">
                Your order request has been received. We will review and confirm the status soon.
            </div>
        {:else if order.status === 'confirmed'}
            <div class="text-green-700 font-medium pt-2">
                This order has been **CONFIRMED** by our staff and is now being processed. Please proceed with payment if a deposit is due.
            </div>
        {:else if order.status === 'completed'}
            <div class="text-green-700 font-medium pt-2">
                This order is **COMPLETED**. Thank you for your business!
            </div>
        {:else if order.status === 'cancelled'}
            <div class="text-red-700 font-medium pt-2">
                This order has been **CANCELLED**.
            </div>
        {/if}
    </div>

    <!-- Order Items -->
    <div class="space-y-4">
        <h2 class="text-xl font-semibold">Items</h2>

        {#each items as item}
            <div class="flex justify-between border-b pb-4">

                <div>
                    <div class="font-medium text-lg">
                        <!-- Use product_name or name_snapshot from the item table -->
                        {item.product_name || item.name_snapshot}
                    </div>
                    <div class="text-gray-600 text-sm">
                        Qty: {item.quantity} × ${item.unit_price?.toFixed(2) || '0.00'}
                    </div>
                </div>

                <div class="text-right font-semibold">
                    <!-- Calculate or use subtotal from item table -->
                    ${(item.subtotal || item.quantity * item.unit_price).toFixed(2)}
                </div>
            </div>
        {/each}
    </div>

    <!-- Total -->
    <div class="pt-6 text-xl font-semibold text-right">
        Total: ${order.total_amount?.toFixed(2) || '0.00'}
    </div>

</div>