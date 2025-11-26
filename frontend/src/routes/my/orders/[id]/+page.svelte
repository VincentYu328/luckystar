<!-- frontend\src\routes\my\orders\[id]\+page.svelte -->
<script>
  export let data;

  const order = data.order;
  const items = data.items;
</script>

<div class="max-w-4xl mx-auto py-10 space-y-8">

  <h1 class="text-3xl font-semibold tracking-tight">
    Order #{order.id}
  </h1>

  <!-- Order Summary -->
  <div class="border rounded-lg p-6 space-y-2 bg-gray-50">
    <div class="text-gray-700">
      <span class="font-medium">Date:</span>
      {new Date(order.created_at).toLocaleDateString()}
    </div>

    <div class="text-gray-700">
      <span class="font-medium">Status:</span>
      <span class="text-blue-700 font-semibold">{order.status}</span>
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
            {item.name}
          </div>
          <div class="text-gray-600 text-sm">
            Qty: {item.qty} × ${item.price}
          </div>
        </div>

        <div class="text-right font-semibold">
          ${(item.qty * item.price).toFixed(2)}
        </div>
      </div>
    {/each}
  </div>

  <!-- Total -->
  <div class="pt-6 text-xl font-semibold text-right">
    Total: ${order.total_price?.toFixed(2) || '0.00'}
  </div>

</div>
