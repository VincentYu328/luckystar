<script>
    export let data;
    let p = data.product;
    let categories = data.categories;
</script>

<div class="max-w-xl space-y-6">

    <h1 class="text-2xl font-semibold">
        Edit Product（编辑产品）
    </h1>

    <form method="POST" class="space-y-4">

        <!-- Name -->
        <div>
            <label class="block text-sm font-medium">
                Name（产品名称）
            </label>
            <input 
                name="name" 
                bind:value={p.name} 
                class="border rounded p-2 w-full" 
            />
        </div>

        <!-- SKU -->
        <div>
            <label class="block text-sm font-medium">
                SKU（货号）
            </label>
            <input 
                name="sku" 
                bind:value={p.sku} 
                class="border rounded p-2 w-full" 
            />
        </div>

        <!-- Product Type -->
        <div>
            <label class="block text-sm font-medium">
                Product Type（产品类型）
            </label>
            <select 
                name="product_type" 
                bind:value={p.product_type} 
                class="border rounded p-2 w-full"
            >
                <option value="garment">Garment（成衣）</option>
                <option value="fabric">Fabric（布料）</option>
            </select>
        </div>

        <!-- Category -->
        <div>
            <label class="block text-sm font-medium">
                Category（分类）
            </label>
            <select 
                name="category_id" 
                bind:value={p.category_id} 
                class="border rounded p-2 w-full"
            >
                {#each categories as c}
                    <option value={c.id}>{c.name}</option>
                {/each}
            </select>
        </div>

        <!-- Price -->
        <div>
            <label class="block text-sm font-medium">
                Price (NZD)（价格）
            </label>
            <input 
                name="price" 
                type="number" 
                bind:value={p.price} 
                step="0.01" 
                class="border rounded p-2 w-full" 
            />
        </div>

        <button
            type="submit"
            name="action"
            value="save"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
            Save Changes（保存修改）
        </button>

    </form>

    <a
        href={`/admin/products/${p.id}/images`}
        class="text-blue-600 underline"
    >
        Manage Product Images（管理产品图片） →
    </a>

</div>
