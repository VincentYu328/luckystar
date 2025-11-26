<script>
    import { cart, cartTotal } from '$lib/stores/cart.js';

    let items = [];
    let total = 0;

    cart.subscribe(v => items = v);
    cartTotal.subscribe(v => total = v);
</script>

<div class="max-w-3xl mx-auto py-10 space-y-8">

  <h1 class="text-3xl font-semibold">Checkout</h1>

  {#if items.length === 0}
    <p class="text-gray-600">Your cart is empty.</p>
  {:else}

    <form method="POST" use:enhance>

      <input type="hidden" name="cart" value={JSON.stringify(items)} />

      <div class="space-y-4">
        {#each items as item}
          <div class="flex justify-between border-b pb-3">
            <div>
              <div class="font-medium">{item.name}</div>
              <div class="text-sm text-gray-600">${item.price} × {item.qty}</div>
            </div>
            <div class="font-semibold">${(item.price * item.qty).toFixed(2)}</div>
          </div>
        {/each}
      </div>

      <div class="pt-6 text-xl font-semibold">
        Total: ${total.toFixed(2)}
      </div>

      <button
        type="submit"
        name="action"
        value="placeOrder"
        class="mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
      >
        Submit Order
      </button>

    </form>

  {/if}
</div>
