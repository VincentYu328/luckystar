<script>
  export let data;

  // ⭐ 正确导入购物车函数
  import { addToCart } from '$lib/stores/cart.js';

  const product = data.product;
  const images = data.images ?? [];

  // ⭐ 正确绑定函数
  function handleAdd() {
    addToCart(product, 1);
    alert(`Added "${product.name}" to cart.`);
  }
</script>

{#if !product}
  <div class="max-w-4xl mx-auto py-16">
    <h1 class="text-2xl font-semibold">Item not found</h1>
    <p class="text-gray-500 mt-2">This product does not exist in the Men's category.</p>
  </div>
{:else}

<div class="max-w-6xl mx-auto py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">

  <!-- Left: Images -->
  <div class="space-y-4">
    {#if images.length > 0}
      <img
        src={images.find(i => i.is_primary)?.url || images[0].url}
        alt={product.name}
        class="w-full rounded-lg border"
      />

      <div class="flex gap-3 overflow-x-auto pt-2">
        {#each images as img}
          <img
            src={img.url}
            alt="thumbnail"
            class="h-20 w-20 object-cover rounded border cursor-pointer hover:ring"
          />
        {/each}
      </div>

    {:else}
      <div class="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
        <span class="text-gray-500">No images</span>
      </div>
    {/if}
  </div>

  <!-- Right: Product Info -->
  <div class="space-y-5">
    <h1 class="text-3xl font-semibold tracking-tight">{product.name}</h1>

    <div class="text-gray-700 space-y-1">
      {#if product.color}
        <div><strong>Color:</strong> {product.color}</div>
      {/if}

      {#if product.style}
        <div><strong>Style:</strong> {product.style}</div>
      {/if}

      {#if product.size_label}
        <div><strong>Size:</strong> {product.size_label}</div>
      {/if}

      {#if product.gender}
        <div><strong>Gender:</strong> {product.gender}</div>
      {/if}

      {#if product.material}
        <div><strong>Material:</strong> {product.material}</div>
      {/if}
    </div>

    <div class="text-2xl font-bold text-gray-900 pt-4">
      ${product.base_price}
    </div>

    <!-- ⭐ Add to Cart -->
    <button
      class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-lg"
      on:click={handleAdd}
    >
      Add to Cart
    </button>

    <div class="pt-2">
      <button
        class="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition w-full"
      >
        Make an Inquiry
      </button>
    </div>
  </div>

</div>

{/if}
