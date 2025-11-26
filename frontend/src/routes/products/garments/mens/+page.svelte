<script>
  export let data;

  const products = data.products ?? [];
  const categoryName = data.categoryName;
</script>

<div class="max-w-6xl mx-auto py-10 space-y-10">

  <h1 class="text-3xl font-semibold tracking-tight">
    {categoryName}
  </h1>

  {#if products.length === 0}
    <p class="text-gray-500">No items available in this category.</p>
  {/if}

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

    {#each products as p}
      <a
        href={`/products/item/${p.id}`}
        class="block border rounded-lg p-4 hover:bg-gray-50 transition"
      >
        <div class="font-semibold text-lg mb-1">{p.name}</div>

        <div class="text-gray-600 text-sm space-y-1">
          {#if p.color}
            <div>Color: {p.color}</div>
          {/if}
          {#if p.style}
            <div>Style: {p.style}</div>
          {/if}
          {#if p.gender}
            <div>Gender: {p.gender}</div>
          {/if}
          {#if p.size_label}
            <div>Size: {p.size_label}</div>
          {/if}
        </div>

        <div class="pt-2 font-medium text-gray-900">
          ${p.base_price}
        </div>
      </a>
    {/each}

  </div>

</div>
