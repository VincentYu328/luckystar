<!-- src/routes/admin/retail-orders/[id]/+page.svelte -->
<script>
    export let data;

    $: mode = data.mode || 'view';
    $: order = data.order || { id: '??', order_number: '??', status: 'pending', customer_name: 'Loading...', created_at: new Date() };
    $: items = data.items || [];
    $: isEditing = data.isEditing || false;
</script>

<div class="max-w-6xl mx-auto p-8">
    <div class="bg-white rounded-lg shadow-lg border p-8">
        <h1 class="text-4xl font-bold mb-4 text-gray-800">
            {mode === 'create' ? 'Create New Order' : `Order Detail #${order.order_number || order.id}`}
        </h1>

        <div class="text-2xl font-mono text-gray-600 mb-8">
            Mode: {mode} | Editing: {isEditing}
        </div>

        <pre class="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{JSON.stringify({ mode, order, items: items.slice(0,2), isEditing }, null, 2)}
        </pre>

        <div class="mt-8 flex gap-4">
            <a href="/admin/retail-orders" class="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700">
                Back to List
            </a>

            {#if mode !== 'create' && !isEditing}
                <a href="?edit=true" class="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Edit This Order
                </a>
            {/if}
        </div>
    </div>
</div>