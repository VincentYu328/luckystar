<script>
  export let data;

  const user = data.user;
  const orders = data.orders;
</script>

<div class="max-w-4xl mx-auto py-10 space-y-8">

  <h1 class="text-3xl font-semibold tracking-tight">My Orders</h1>

  {#if orders.length === 0}
    <p class="text-gray-500">
      You have not submitted any order requests yet.
    </p>
  {:else}

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
                Created: {new Date(o.created_at).toLocaleDateString()}
              </div>
              <div class="text-gray-600 text-sm">
                Status: 
                <span class="font-medium text-blue-700">
                  {o.status}
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
