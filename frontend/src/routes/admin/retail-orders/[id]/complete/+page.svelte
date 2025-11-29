// frontend/src/routes/admin/retail-orders/[id]/complete/+page.svelte

<script>
    import { enhance } from '$app/forms'; // Required for form action enhancement
    
    export let data;

    // Rule 4: Defensive check
    const order = data.order ?? {};
    const items = data.items ?? [];
    
    // Status Labels unified to English
    const STATUS_LABEL = {
        pending: "Pending",
        confirmed: "Confirmed",
        completed: "Completed",
        cancelled: "Cancelled"
    };
    
    // Helper to calculate total
    function getItemSubtotal(item) {
        // Use backend field names: quantity, unit_price
        return item.subtotal || (item.quantity * item.unit_price) || 0;
    }

    // Capture the form result for displaying errors
    let form = {}; 
</script>

<div class="space-y-10 max-w-3xl p-4">

    <h1 class="text-3xl font-semibold tracking-tight">
        Complete Order #{order.order_number || order.id}
    </h1>

    <!-- Action Error Message -->
    {#if form.error}
        <div class="p-3 bg-red-100 text-red-700 rounded border border-red-300">
            ❌ Error: {form.error}
        </div>
    {/if}

    <!-- ======= Order Info Order Summary ======= -->
    <section class="bg-white border rounded-lg p-6 space-y-3 shadow">
        <h2 class="text-xl font-semibold mb-2">
            Order Summary
        </h2>

        <div class="space-y-1 text-gray-700">

            <p><strong>Status:</strong>
                <span class="font-medium text-blue-700">
                    {STATUS_LABEL[order.status] || order.status}
                </span>
            </p>

            <p><strong>Created At:</strong>
                {new Date(order.created_at || Date.now()).toLocaleString()}
            </p>

            {#if order.customer_name}
                <p><strong>Customer:</strong>
                    {order.customer_name}
                </p>
            {/if}

            {#if order.notes}
                <p><strong>Notes:</strong>
                    {order.notes}
                </p>
            {/if}
        </div>
    </section>

    <!-- ======= Items Product List ======= -->
    <section class="bg-white border rounded-lg p-6 space-y-3 shadow">
        <h2 class="text-xl font-semibold mb-2">
            Order Items
        </h2>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="p-3">SKU</th>
                        <th class="p-3">Product</th>
                        <th class="p-3">Qty</th>
                        <th class="p-3">Unit Price</th>
                        <th class="p-3">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {#each items as item}
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-3">{item.product_sku || 'N/A'}</td>
                            <td class="p-3">{item.product_name || 'N/A'}</td>
                            <!-- ⭐ FIX: Use item.quantity -->
                            <td class="p-3">{item.quantity}</td>
                            <!-- ⭐ FIX: Use item.unit_price -->
                            <td class="p-3">${item.unit_price?.toFixed(2)}</td>
                            <td class="p-3 font-semibold">
                                ${ getItemSubtotal(item).toFixed(2) }
                            </td>
                        </tr>
                    {/each}
                    <tr class="bg-gray-100 font-bold border-t-2 border-gray-300">
                        <td colspan="4" class="p-3 text-right">Total Order Amount:</td>
                        <td class="p-3">${order.total_amount?.toFixed(2) || '0.00'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </section>

    <!-- ======= Complete Order Action ======= -->
    <section class="bg-white border rounded-lg p-6 space-y-6 shadow">
        <h2 class="text-xl font-semibold">
            Complete Order
        </h2>

        <p class="text-gray-700 leading-relaxed">
            Completing this order will:
        </p>

        <ul class="list-disc ml-6 text-gray-700 space-y-1">
            <li>Automatically deduct stock based on quantities</li>
            <li>Record an inventory OUT transaction</li>
            <li>Mark the order as <strong class="text-green-600">Completed</strong></li>
            <li>Write an audit log entry</li>
        </ul>

        <p class="text-red-600 font-medium">
            This action cannot be undone.
        </p>

        <form method="POST" action="?/complete" use:enhance on:submit|preventDefault={e => form = {}}>
            <button
                type="submit"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={order.status === 'completed' || order.status === 'cancelled'}
            >
                Complete Order
            </button>
             {#if order.status === 'completed' || order.status === 'cancelled'}
                <span class="text-sm text-gray-500 ml-4">
                    (Order is already finalized)
                </span>
            {/if}
        </form>
    </section>

</div>