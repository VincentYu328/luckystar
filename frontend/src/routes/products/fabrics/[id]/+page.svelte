<script>
  import { addToCart, cart } from "$lib/stores/cart.js";
  export let data;

  const product = data.product;
  const images = data.images ?? [];
  const stock = data.stock;

  const primary = images.find((img) => img.is_primary) || images[0];

  function handleAddToCart() {
    // 统一用封装函数（你那边签名是 addToCart(product, qty)）
    addToCart(product, 1);

    // 如果以后你想用 cart.add 也可以在 addToCart 里改，不用动这里
    // cart.add(product, 1);

    alert(`Added "${product.name}" to cart.`);
  }
</script>

{#if !product}
  <div class="max-w-5xl mx-auto py-10">
    <h1 class="text-2xl font-semibold">Item not found</h1>
    <p class="text-gray-500 mt-2">This product does not exist.</p>
  </div>
{:else}

<div class="max-w-5xl mx-auto py-10 space-y-10">
  <!-- Title -->
  <h1 class="text-3xl font-semibold tracking-tight">
    {product.name}
  </h1>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
    <!-- Images -->
    <div class="space-y-4">
      {#if primary}
        <img
          src={primary.url}
          alt={product.name}
          class="w-full rounded-lg border"
        />
      {/if}

      {#if images.length > 1}
        <div class="flex gap-3 flex-wrap">
          {#each images as img}
            <img
              src={img.url}
              alt="thumb"
              class="w-20 h-20 object-cover rounded border hover:ring-2 hover:ring-blue-400 cursor-pointer"
            />
          {/each}
        </div>
      {/if}
    </div>

    <!-- Product Info -->
    <div class="space-y-6">
      <!-- Price -->
      <div class="text-2xl font-semibold text-gray-900">
        ${product.base_price}
      </div>

      <!-- Add To Cart -->
      <button
        class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg"
        on:click={handleAddToCart}
      >
        Add to Cart
      </button>

      <!-- Attributes -->
      <table class="text-sm w-full">
        <tbody class="divide-y">
          <tr>
            <td class="py-2 text-gray-600 w-32">SKU</td>
            <td>{product.sku}</td>
          </tr>

          {#if product.color}
            <tr>
              <td class="py-2 text-gray-600">Color</td>
              <td>{product.color}</td>
            </tr>
          {/if}

          {#if product.material}
            <tr>
              <td class="py-2 text-gray-600">Material</td>
              <td>{product.material}</td>
            </tr>
          {/if}

          {#if product.width_cm}
            <tr>
              <td class="py-2 text-gray-600">Width</td>
              <td>{product.width_cm} cm</td>
            </tr>
          {/if}

          {#if product.pattern}
            <tr>
              <td class="py-2 text-gray-600">Pattern</td>
              <td>{product.pattern}</td>
            </tr>
          {/if}

          {#if product.description}
            <tr>
              <td class="py-2 text-gray-600">Description</td>
              <td class="whitespace-pre-wrap">
                {product.description}
              </td>
            </tr>
          {/if}
        </tbody>
      </table>

      <!-- Stock -->
      {#if stock}
        <div class="pt-2 space-y-1">
          <div class="text-lg font-semibold">Stock</div>
          <div class="text-gray-700">Total In: {stock.total_in}</div>
          <div class="text-gray-700">Used: {stock.total_used}</div>
          <div class="font-semibold text-gray-900">
            Available: {stock.stock}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

{/if}
