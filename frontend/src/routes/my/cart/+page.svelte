<script>
  import { cart, cartTotal, updateQty, removeFromCart } from '$lib/stores/cart.js';

  let items = [];
  let amount = 0;

  cart.subscribe(v => items = v);
  cartTotal.subscribe(v => amount = v);
</script>

<div class="max-w-3xl mx-auto py-10 space-y-6">

  <h1 class="text-3xl font-semibold tracking-tight">My Cart</h1>

  {#if items.length === 0}
    <p class="text-gray-500">Your cart is empty.</p>
  {:else}

    <div class="space-y-4">

      {#each items as item}
        <div class="flex justify-between border-b pb-4">

          <!-- 左侧 商品信息 -->
          <div>
            <div class="font-medium">{item.name}</div>
            <div class="text-gray-600">${item.price} each</div>
          </div>

          <!-- 右侧 数量与删除 -->
          <div class="flex items-center gap-3">
            <input
              type="number"
              min="1"
              value={item.qty}
              class="w-16 border rounded p-1"
              on:change={(e) => updateQty(item.product_id, Number(e.target.value))}
            />

            <button
              class="text-red-600"
              on:click={() => removeFromCart(item.product_id)}
            >
              Remove
            </button>
          </div>

        </div>
      {/each}
    </div>

    <div class="pt-6 text-xl font-semibold">
      Total: ${amount.toFixed(2)}
    </div>

    <a
      href="/my/orders/new"
      class="block mt-6 bg-blue-600 text-white py-3 rounded-lg text-center hover:bg-blue-700"
    >
      Proceed to Checkout
    </a>

  {/if}
</div>
