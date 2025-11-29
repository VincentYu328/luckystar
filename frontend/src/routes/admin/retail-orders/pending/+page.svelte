<!-- frontend\src\routes\admin\retail-orders\pending\+page.svelte -->

<script>
    import { enhance } from '$app/forms';
    
    export let data;
    
    // Use responsive destructuring for reactivity
    $: ({ orders, actionSuccess, actionError } = data);

    // Labels unified to English
    const STATUS_LABEL = {
        pending: "Pending",
        confirmed: "Confirmed",
        cancelled: "Cancelled"
    };

    const STATUS_COLOR = {
        pending: "bg-yellow-100 text-yellow-800",
        confirmed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800"
    };
    
    // Client-side confirmation dialog
    function confirmAction(message) {
        // NOTE: Using standard JS confirm dialogs for development speed. Replace with custom modal later (Rule: No alert/confirm).
        // Since we are in the Admin Portal, user experience priority is slightly lower than function.
        return window.confirm(message);
    }
</script>

<div class="space-y-8 p-4">

    <!-- Title and result messages -->
    <div class="space-y-4">
        <h1 class="text-3xl font-semibold tracking-tight text-yellow-800">
            Pending Orders
        </h1>
        <p class="text-gray-600">
            This list displays new retail order requests submitted by customers online (`status: pending`).
        </p>

        <!-- Success/Error messages -->
        {#if actionSuccess}
            <div class="p-4 rounded-lg bg-green-100 text-green-800 border border-green-300">
                ✅ Order status updated successfully.
            </div>
        {/if}

        {#if actionError}
            <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
                ❌ Error: {actionError}
            </div>
        {/if}
    </div>

    {#if orders.length === 0}
        <div class="text-center py-12 bg-gray-50 rounded-lg">
            <p class="text-gray-600 text-lg">No pending orders found. ✅ All caught up!</p>
        </div>
    {:else}
        <div class="bg-white border rounded-lg overflow-x-auto shadow-sm">
            <table class="w-full text-left text-sm">

                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="p-3 font-medium">Order #</th>
                        <th class="p-3 font-medium">Customer</th>
                        <th class="p-3 font-medium text-right">Total Amount</th>
                        <th class="p-3 font-medium">Created Date</th>
                        <th class="p-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {#each orders as o (o.id)}
                        <tr class="border-b hover:bg-yellow-50 transition">

                            <!-- Order # -->
                            <td class="p-3 font-semibold text-gray-900">
                                <a href={`/admin/retail-orders/${o.id}`} class="text-blue-600 hover:underline">
                                    #{o.order_number || o.id}
                                </a>
                            </td>

                            <!-- Customer Name -->
                            <td class="p-3">
                                {o.customer_name ?? '(Anonymous)'}
                            </td>

                            <!-- Total Amount -->
                            <td class="p-3 text-right font-medium">
                                ${o.total_amount?.toFixed(2) ?? '0.00'}
                            </td>

                            <!-- Created Date -->
                            <td class="p-3 whitespace-nowrap text-gray-600">
                                {new Date(o.created_at).toLocaleDateString()}
                            </td>

                            <!-- Actions: Confirm/Cancel -->
                            <td class="p-3">
                                <div class="flex justify-end gap-2">
                                    
                                    <!-- Confirm Form (Action: updateStatus) -->
                                    <form method="POST" action="?/updateStatus" use:enhance>
                                        <input type="hidden" name="order_id" value={o.id} />
                                        <input type="hidden" name="status" value="confirmed" />
                                        <button
                                            type="submit"
                                            class="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition"
                                            on:click={(e) => {
                                                if (!confirmAction(`Confirm order #${o.id}? This will set the status to 'Confirmed'.`)) e.preventDefault();
                                            }}
                                        >
                                            Confirm
                                        </button>
                                    </form>

                                    <!-- Cancel Form (Action: updateStatus) -->
                                    <form method="POST" action="?/updateStatus" use:enhance>
                                        <input type="hidden" name="order_id" value={o.id} />
                                        <input type="hidden" name="status" value="cancelled" />
                                        <button
                                            type="submit"
                                            class="border border-red-300 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-50 transition"
                                            on:click={(e) => {
                                                if (!confirmAction(`Cancel order #${o.id}? This will set the status to 'Cancelled'.`)) e.preventDefault();
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    </form>
                                    
                                    <!-- Review Link -->
                                    <a 
                                         href={`/admin/retail-orders/${o.id}`}
                                         class="text-blue-600 hover:underline px-3 py-1 text-sm transition"
                                    >
                                         View
                                     </a>
                                </div>
                            </td>

                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

</div>