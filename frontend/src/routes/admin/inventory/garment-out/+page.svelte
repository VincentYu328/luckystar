<script>
    import { enhance } from "$app/forms";

    export let data;
    export let form; // 接收 action 返回的错误信息

    // 类型防御，保证永远是数组
    const garments = Array.isArray(data.garments) ? data.garments : [];

    // 用于保留表单数据（可选）
    let initialData = form?.data || {}; 
</script>

<div class="max-w-xl space-y-8">
    <h1 class="text-2xl font-semibold tracking-tight">
        Garment Sale / Stock Out（成衣销售/出库）
    </h1>

    {#if form?.error}
        <div
            class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
        >
            <p class="font-medium">Error（错误）</p>
            <p class="text-sm">{form.error}</p>
        </div>
    {/if}

    <form method="POST" action="?/create" class="space-y-6" use:enhance>
        <div>
            <label for="garment_id" class="block text-sm font-medium mb-1">
                Garment（成衣） <span class="text-red-500">*</span>
            </label>
            <select
                id="garment_id"
                name="garment_id"
                required
                class="border rounded p-2 w-full focus:ring-2 focus:ring-fuchsia-500"
            >
                <option value="">Select garment…（选择成衣…）</option>

                {#each garments as g}
                    <option value={g.product_id}>
                        {g.sku} — {g.product_name} ({g.quantity_on_hand} in stock)
                    </option>
                {/each}
            </select>
        </div>

        <div>
            <label for="quantity" class="block text-sm font-medium mb-1">
                Quantity（数量） <span class="text-red-500">*</span>
            </label>

            <input
                id="quantity"
                name="quantity"
                type="number"
                step="1"
                min="1"
                required
                placeholder="例如：5"
                value={initialData.quantity || ''}
                class="border rounded p-2 w-full focus:ring-2 focus:ring-fuchsia-500"
            />
            <p class="text-xs text-gray-500 mt-1">单位：件（pieces）。注意：销售操作将直接影响库存。</p>
        </div>
        
        <div>
            <label for="sale_type" class="block text-sm font-medium mb-1">
                Sale Type（销售/出库类型） <span class="text-red-500">*</span>
            </label>
            <select
                id="sale_type"
                name="sale_type"
                required
                class="border rounded p-2 w-full focus:ring-2 focus:ring-fuchsia-500"
            >
                <option value="retail_sale">Retail Sale（零售）</option>
                <option value="wholesale">Wholesale（批发）</option>
                <option value="damage_out">Damage/Waste（损坏/报废）</option>
            </select>
        </div>

        <div>
            <label for="reference" class="block text-sm font-medium mb-1">
                Sales / Order Reference（销售/订单参考号，可选）
            </label>

            <input
                id="reference"
                name="reference"
                type="text"
                maxlength="50"
                placeholder="例如：RO-2025-010 (零售订单号) 或 客户名"
                value={initialData.reference || ''}
                class="border rounded p-2 w-full focus:ring-2 focus:ring-fuchsia-500"
            />
        </div>
        
        <div>
            <label for="notes" class="block text-sm font-medium mb-1">
                Notes（备注）
            </label>
            <textarea
                id="notes"
                name="notes"
                rows="3"
                maxlength="500"
                class="border rounded p-2 w-full focus:ring-2 focus:ring-fuchsia-500"
                placeholder="Optional notes（可选备注）"
            >{initialData.notes || ''}</textarea>
        </div>

        <div class="flex gap-3 mt-4">
            <button
                type="submit"
                class="bg-fuchsia-600 text-white px-5 py-3 rounded-lg hover:bg-fuchsia-700 transition"
            >
                Record Garment Sale（记录成衣销售）
            </button>

            <a
                href="/admin/inventory"
                class="bg-gray-200 text-gray-800 px-5 py-3 rounded-lg hover:bg-gray-300 transition inline-block text-center"
            >
                Cancel（取消）
            </a>
        </div>
    </form>
</div>