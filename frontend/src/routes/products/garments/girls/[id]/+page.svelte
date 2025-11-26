<script>
  export let data;
  import { addToCart } from '$lib/stores/cart.js';

  const product = data.product;
  const images = data.images ?? [];
  const invalid = data.invalid;

  const primary = images.find(i => i.is_primary) || images[0];

  function handleAddToCart() {
    addToCart(product); 
    alert(`Added "${product.name}" to cart.`);
  }
</script>

{#if invalid}
  <div class="max-w-3xl mx-auto py-20 text-center">
    <h1 class="text-2xl font-semibold">Item not found</h1>
    <p class="text-gray-500 mt-2">This garment is not available.</p>
  </div>
{:else}

<div class="max-w-5xl mx-auto py-10 space-y-10">

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

      <div class="text-xl font-semibold">
        ${product.base_price}
      </div>

      <!-- ⭐ Add to Cart 按钮（新增） -->
      <button
        class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg"
        on:click={addToCart}
      >
        Add to Cart
      </button>

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

          {#if product.size_label}
          <tr>
            <td class="py-2 text-gray-600">Size</td>
            <td>{product.size_label}</td>
          </tr>
          {/if}

          {#if product.style}
          <tr>
            <td class="py-2 text-gray-600">Style</td>
            <td>{product.style}</td>
          </tr>
          {/if}

          {#if product.gender}
          <tr>
            <td class="py-2 text-gray-600">Gender</td>
            <td>{product.gender}</td>
          </tr>
          {/if}

          {#if product.description}
          <tr>
            <td class="py-2 text-gray-600">Description</td>
            <td class="whitespace-pre-wrap">{product.description}</td>
          </tr>
          {/if}

        </tbody>
      </table>

    </div>
  </div>

</div>

{/if}
