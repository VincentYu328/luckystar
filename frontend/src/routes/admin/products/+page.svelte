
<!-- frontend\src\routes\admin\products\+page.svelte -->

<script>
  export let data;
  const products = data.products;
  const deleteSuccess = data.deleteSuccess;
  const deleteError = data.deleteError;
</script>

<div class="space-y-8">
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3d tracking-tight text-3xl">
        Products（产品列表）
      </h1>

      {#if deleteSuccess}
        <p class="text-sm text-green-600 mt-2">✅ 删除成功</p>
      {/if}

      {#if deleteError}
        <p class="text-sm text-red-600 mt-2">❌ {deleteError}</p>
      {/if}
    </div>

    <a
      href="/admin/products/create"
      class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
    >
      + Create Product（新增产品）
    </a>
  </div>

  <div class="bg-white border rounded-lg shadow-sm overflow-hidden">
    <table class="w-full text-left">
      <thead class="border-b bg-gray-50 text-sm uppercase text-gray-500">
        <tr>
          <th class="p-3">SKU（货号）</th>
          <th class="p-3">Name（名称）</th>
          <th class="p-3">Type（类型）</th>
          <th class="p-3">Category（分类）</th>
          <th class="p-3 text-right">Price（价格）</th>
          <th class="p-3 text-right">Actions</th>
        </tr>
      </thead>

      <tbody>
        {#if products.length === 0}
          <tr>
            <td colspan="6" class="p-6 text-center text-gray-500">
              暂无产品，请点击上方按钮添加新的产品。
            </td>
          </tr>

        {:else}

          {#each products as p}
            <tr class="border-b hover:bg-gray-50">
              <td class="p-3 font-medium text-gray-800">{p.sku}</td>

              <td class="p-3">
                <div class="text-gray-900">{p.name}</div>
                {#if p.description}
                  <div class="text-sm text-gray-500">{p.description}</div>
                {/if}
              </td>

              <td class="p-3 capitalize text-gray-700">
                {p.product_type}
                {#if p.product_type === 'fabric'}
                  （布料）
                {:else if p.product_type === 'garment'}
                  （成衣）
                {/if}
              </td>

              <td class="p-3 text-gray-700">
                {p.category_name ?? '—'}
              </td>

              <td class="p-3 text-right text-gray-900">
                ¥ {(p.base_price ?? 0).toFixed(2)}
              </td>

              <td class="p-3 text-right space-x-3">
                <a
                  href={`/admin/products/${p.id}/edit`}
                  class="text-blue-600 hover:underline"
                >
                  Edit（编辑）
                </a>

                <a
                  href={`/admin/products/${p.id}/images`}
                  class="text-gray-600 hover:underline"
                >
                  Images（图片）
                </a>

                <form
                  method="POST"
                  action="?/delete"
                  class="inline"
                  on:submit|preventDefault={(e) => {
                    if (confirm('确定要删除该产品吗？')) {
                      e.currentTarget.submit();
                    }
                  }}
                >
                  <input type="hidden" name="product_id" value={p.id} />
                  <button type="submit" class="text-red-600 hover:underline">
                    Delete（删除）
                  </button>
                </form>
              </td>
            </tr>
          {/each}

        {/if}
      </tbody>
    </table>
  </div>
</div>
