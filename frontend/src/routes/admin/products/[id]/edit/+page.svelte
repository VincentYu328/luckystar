<script>
  export let data;
  
  $: product = data.product;
  $: categories = data.categories;
  $: values = data.values ?? {};
  $: errorMessage = data.error;
  $: successMessage = data.success;

  const fieldValue = (field, fallback) => values[field] ?? fallback ?? '';
</script>

<div class="max-w-xl space-y-6">
  <h1 class="text-2xl font-semibold">Edit Product</h1>

  {#if successMessage}
    <div class="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
      Product updated successfully!
    </div>
  {/if}

  {#if errorMessage}
    <div class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
      {errorMessage}
    </div>
  {/if}

  <form method="POST" class="space-y-4">
    <div>
      <label>Name</label>
      <input
        name="name"
        class="border rounded p-2 w-full"
        value={fieldValue('name', product.name)}
      />
    </div>

    <div>
      <label>SKU</label>
      <input
        name="sku"
        class="border rounded p-2 w-full"
        value={fieldValue('sku', product.sku)}
      />
    </div>

    <div>
      <label>Product Type</label>
      <select
        name="product_type"
        class="border rounded p-2 w-full"
      >
        <option
          value="garment"
          selected={fieldValue('product_type', product.product_type) === 'garment'}
        >
          Garment
        </option>

        <option
          value="fabric"
          selected={fieldValue('product_type', product.product_type) === 'fabric'}
        >
          Fabric
        </option>
      </select>
    </div>

    <div>
      <label>Category</label>
      <select
        name="category_id"
        class="border rounded p-2 w-full"
      >
        <option value="">-- Select --</option>

        {#each categories as c}
          <option
            value={c.id}
            selected={Number(fieldValue('category_id', product.category_id)) === c.id}
          >
            {c.name}
          </option>
        {/each}
      </select>
    </div>

    <div>
      <label>Price (NZD)</label>
      <input
        name="base_price"
        type="number"
        step="0.01"
        class="border rounded p-2 w-full"
        value={fieldValue('base_price', product.base_price)}
      />
    </div>

    <div class="flex gap-4">
      <button type="submit" class="bg-blue-600 text-white px-6 py-3 rounded-lg">
        Save Changes
      </button>
      <a href="/admin/products" class="bg-gray-200 px-6 py-3 rounded-lg">
        Cancel
      </a>
    </div>
  </form>

  <div class="border-t pt-6">
    <a
      href={`/admin/products/${product.id}/images`}
      class="text-blue-600 underline"
    >
      Manage Product Images →
    </a>
  </div>
</div>
