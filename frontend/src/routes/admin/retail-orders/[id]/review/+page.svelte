// frontend/src/routes/admin/retail-orders/[id]/review/+page.svelte

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
    
    // Helper to calculate total (Subtotal should ideally come from backend)
    function getItemSubtotal(item) {
        return item.subtotal || (item.quantity * item.unit_price) || 0;
    }
</script>

<div class="space-y-10 max-w-3xl p-4">

    <h1 class="text-3xl font-semibold tracking-tight">
        Review Order #{order.order_number || order.id}
    </h1>
    
    <!-- Display action error message if available -->
    {#if $page.form?.error}
        <div class="p-3 bg-red-100 text-red-700 rounded border border-red-300">
            ❌ Error: {$page.form.error}
        </div>
    {/if}

    <!-- ======= Order Info Order Summary ======= -->
    <section class="bg-white border rounded-lg p-6 space-y-3 shadow">
        <h2 class="text-xl font-semibold mb-2">
            Order Summary
        </h2>

        <div class="space-y-1 text-gray-700">

            <p><strong>Status:</strong>
                <span class="font-medium text-yellow-700">
                    {STATUS_LABEL[order.status] || order.status}
                </span>
            </p>

            <p><strong>Created At:</strong>
                {new Date(order.created_at || Date.now()).toLocaleString()}
            </p>

            {#if order.customer_name}
                <p><strong>Customer:</strong>
                    {order.customer_name}
                    <!-- Link to customer detail page -->
                    <a href={`/admin/customers/${order.customer_id}`} class="text-blue-600 hover:underline ml-2 text-xs">
                        (View Profile)
                    </a>
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

    <!-- ======= Review Action Confirmation ======= -->
    <section class="bg-white border rounded-lg p-6 space-y-6 shadow">
        <h2 class="text-xl font-semibold mb-1">
            Confirm Order
        </h2>

        <p class="text-gray-700 leading-relaxed">
            Please verify that all items, quantities, and customer details are correct. 
            Once confirmed, the order will move to 
            <strong class="text-blue-600">Confirmed</strong> status.
        </p>

        <form method="POST" action="?/confirm" use:enhance>
            <button
                type="submit"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={order.status !== 'pending'}
            >
                Confirm Order
            </button>
            
            {#if order.status !== 'pending'}
                <span class="text-sm text-gray-500 ml-4">
                    (Order must be Pending to confirm)
                </span>
            {/if}
        </form>
    </section>

</div>