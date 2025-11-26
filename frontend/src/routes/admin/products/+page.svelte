<script>
    export let data;
    const products = data.products;
</script>

<div class="space-y-8">

    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-semibold tracking-tight">
            Products（产品列表）
        </h1>

        <a
            href="/admin/products/create"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            + Create Product（新增产品）
        </a>
    </div>

    <div class="bg-white border rounded-lg">
        <table class="w-full text-left">
            <thead class="border-b bg-gray-50">
                <tr>
                    <th class="p-3">SKU（货号）</th>
                    <th class="p-3">Name（名称）</th>
                    <th class="p-3">Type（类型）</th>
                    <th class="p-3">Category（分类）</th>
                    <th class="p-3">Price（价格）</th>
                    <th class="p-3"></th>
                </tr>
            </thead>

            <tbody>
                {#each products as p}
                    <tr class="border-b hover:bg-gray-50">

                        <td class="p-3">{p.sku}</td>

                        <td class="p-3">{p.name}</td>

                        <td class="p-3 capitalize">
                            {p.product_type}
                            <!-- 中文类型补充显示 -->
                            {#if p.product_type === 'fabric'}
                                （布料）
                            {:else if p.product_type === 'garment'}
                                （成衣）
                            {:else}
                                （其它）
                            {/if}
                        </td>

                        <td class="p-3">{p.category_name}</td>

                        <td class="p-3">${p.price?.toFixed(2)}</td>

                        <td class="p-3 text-right space-x-4">

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

                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

</div>
