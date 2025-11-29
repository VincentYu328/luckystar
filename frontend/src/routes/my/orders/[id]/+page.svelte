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
            <span class="text-blue-700 font-semibold">{order.status || 'N/A'}</span>
        </div>

        {#if order.status === 'pending'}
            <div class="text-yellow-700 font-medium">
                Your order request has been received. We will contact you soon.
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
                        {item.product_name || item.name_snapshot}
                    </div>
                    <div class="text-gray-600 text-sm">
                        <!-- ⭐ FIX: Use backend field names: quantity and unit_price -->
                        Qty: {item.quantity} × ${item.unit_price}
                    </div>
                </div>

                <div class="text-right font-semibold">
                    <!-- ⭐ FIX: Use backend field names: subtotal -->
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