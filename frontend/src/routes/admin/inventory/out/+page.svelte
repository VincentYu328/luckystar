<!-- frontend/src/routes/admin/inventory/out/+page.svelte -->

<script>
    import { enhance } from "$app/forms";

    export let data;
    export let form; // ⭐ 接收 action 返回的错误信息

    // ⭐ 类型防御，保证永远是数组
    const fabrics = Array.isArray(data.fabrics) ? data.fabrics : [];
    const garments = Array.isArray(data.garments) ? data.garments : [];
</script>

<div class="max-w-xl space-y-8">
    <h1 class="text-2xl font-semibold tracking-tight">
        Fabric Usage（布料使用记录）
    </h1>

    <!-- ⭐ 修正 1：显示错误信息 -->
    {#if form?.error}
        <div
            class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
        >
            <p class="font-medium">Error（错误）</p>
            <p class="text-sm">{form.error}</p>
        </div>
    {/if}

    <!-- ⭐ 修正 2：添加 action="?/create" 和 use:enhance -->
    <form method="POST" action="?/create" class="space-y-5" use:enhance>
        <!-- 布料 -->
        <div>
            <label for="fabric_id" class="block text-sm font-medium mb-1">
                Fabric（布料） <span class="text-red-500">*</span>
            </label>
            <select
                id="fabric_id"
                name="fabric_id"
                required
                class="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select fabric…（选择布料…）</option>

                {#each fabrics as f}
                    <!-- ⭐ 修正 3：使用正确的字段名 -->
                    <option value={f.fabric_id}>
                        {f.sku} — {f.fabric_name} ({f.material})
                    </option>
                {/each}
            </select>
        </div>

        <!-- 成衣（可选） -->
        <div>
            <label for="garment_id" class="block text-sm font-medium mb-1">
                Garment（成衣，可选）
            </label>
            <select
                id="garment_id"
                name="garment_id"
                class="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
            >
                <option value="">— None（无） —</option>

                {#each garments as g}
                    <!-- ⭐ 修正 4：garments 来自 v_stock_levels，字段名可能不同 -->
                    <option value={g.product_id}>
                        {g.sku} — {g.product_name}
                    </option>
                {/each}
            </select>
        </div>

        <!-- 使用数量 -->
        <div>
            <label for="used_quantity" class="block text-sm font-medium mb-1">
                Used Quantity（使用数量） <span class="text-red-500">*</span>
            </label>
            <input
                id="used_quantity"
                name="used_quantity"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="例如：2.5"
                class="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">单位：米（meters）</p>
        </div>

        <!-- 使用类型 -->
        <div>
            <label for="usage_type" class="block text-sm font-medium mb-1">
                Usage Type（使用类型）
            </label>
            <select
                id="usage_type"
                name="usage_type"
                class="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
            >
                <option value="cut">Cut（裁剪）</option>
                <option value="sample">Sample（样品）</option>
                <option value="waste">Waste（损耗/废料）</option>
            </select>
        </div>

        <!-- 备注 -->
        <div>
            <label for="notes" class="block text-sm font-medium mb-1">
                Notes（备注）
            </label>
            <textarea
                id="notes"
                name="notes"
                class="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
                rows="3"
                maxlength="500"
                placeholder="Optional notes（可选备注）"
            ></textarea>
        </div>

        <!-- 按钮组 -->
        <div class="flex gap-3">
            <!-- ⭐ 修正 5：移除 name="action" value="create" -->
            <button
                type="submit"
                class="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Save Usage Record（保存布料使用记录）
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
