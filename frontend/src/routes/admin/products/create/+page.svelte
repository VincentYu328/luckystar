<script>
  export let data;
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const values = data.values || {};
  const errorMessage = data.error;
</script>

<div class="max-w-xl space-y-6">
  <h1 class="text-2xl font-semibold">Create Product（创建产品）</h1>

  {#if errorMessage}
    <div class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
      {errorMessage}
    </div>
  {/if}

  <form method="POST" class="space-y-4">
    <div>
      <label class="block text-sm font-medium" for="name">
        Name（产品名称）
      </label>
      <input
        id="name"
        name="name"
        class="border rounded p-2 w-full"
        required
        value={values.name ?? ''}
      />
    </div>

    <div>
      <label class="block text-sm font-medium" for="sku">
        SKU（货号）
      </label>
      <input
        id="sku"
        name="sku"
        class="border rounded p-2 w-full"
        value={values.sku ?? ''}
      />
    </div>

    <div>
      <label class="block text-sm font-medium" for="product_type">
        Product Type（产品类型）
      </label>
      <select
        id="product_type"
        name="product_type"
        class="border rounded p-2 w-full"
        value={values.product_type ?? 'garment'}
      >
        <option value="garment">Garment（成衣）</option>
        <option value="fabric">Fabric（布料）</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium" for="category_id">
        Category（分类）
      </label>
      <select
        id="category_id"
        name="category_id"
        class="border rounded p-2 w-full"
        value={values.category_id ?? ''}
      >
        <option value="">Select a category (Optional)</option>
        {#each categories as c}
          <option value={c.id}>{c.name}</option>
        {/each}
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium" for="base_price">
        Price (NZD)（价格）
      </label>
      <input
        id="base_price"
        name="base_price"
        type="number"
        step="0.01"
        class="border rounded p-2 w-full"
        required
        value={values.base_price ?? ''}
      />
    </div>

    <button
      type="submit"
      class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      Create（创建）
    </button>
  </form>
</div>