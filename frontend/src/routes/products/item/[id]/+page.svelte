<script>
  export let data;

  import { addToCart } from '$lib/stores/cart.js';

  const product = data.product;
  const images = data.images ?? [];
  const stock = data.stock;
  const invalid = data.invalid;

  const primary = images.find(i => i.is_primary) || images[0];

  function handleAddToCart() {
    addToCart(product, 1);
    alert(`Added "${product.name}" to cart.`);
  }
</script>

{#if invalid}
  <div class="max-w-4xl mx-auto py-16 text-center">
    <h1 class="text-2xl font-semibold">Item not found</h1>
    <p class="text-gray-500 mt-2">This product does not exist.</p>
  </div>

{:else}

<div class="max-w-6xl mx-auto py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">

  <!-- Left: Images -->
  <div class="space-y-4">
    {#if primary}
      <img
        src={primary.url}
        alt={product.name}
        class="w-full rounded-lg border"
      />
    {/if}

    <!-- Thumbnail strip -->
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

  <!-- Right: Product Info -->
  <div class="space-y-6">

    <h1 class="text-3xl font-semibold tracking-tight">{product.name}</h1>

    <div class="text-gray-700 space-y-1">
      {#if product.color}
        <div><strong>Color:</strong> {product.color}</div>
      {/if}

      {#if product.material}
        <div><strong>Material:</strong> {product.material}</div>
      {/if}

      {#if product.style}
        <div><strong>Style:</strong> {product.style}</div>
      {/if}

      {#if product.gender}
        <div><strong>Gender:</strong> {product.gender}</div>
      {/if}

      {#if product.size_label}
        <div><strong>Size:</strong> {product.size_label}</div>
      {/if}

      {#if product.width_cm}
        <div><strong>Width:</strong> {product.width_cm} cm</div>
      {/if}

      {#if product.pattern}
        <div><strong>Pattern:</strong> {product.pattern}</div>
      {/if}

      {#if product.description}
        <div class="pt-2 whitespace-pre-wrap">
          <strong>Description:</strong><br />{product.description}
        </div>
      {/if}
    </div>

    <div class="text-2xl font-bold text-gray-900 pt-2">
      ${product.base_price}
    </div>

    <!-- ⭐ 正确绑定购物车函数 -->
    <button
      class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
      on:click={handleAddToCart}
    >
      Add to Cart
    </button>

    <!-- Fabric stock (only for fabric) -->
    {#if stock}
      <div class="pt-6 space-y-1 border-t">
        <div class="text-lg font-semibold">Fabric Stock</div>
        <div>Total In: {stock.total_in}</div>
        <div>Used: {stock.total_used}</div>
        <div class="font-semibold text-gray-900">
          Available: {stock.stock}
        </div>
      </div>
    {/if}

  </div>

</div>

{/if}
