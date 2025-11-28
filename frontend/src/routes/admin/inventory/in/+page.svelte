<!-- frontend/src/routes/admin/inventory/in/+page.svelte -->

<script>
    import { enhance } from "$app/forms";

    export let data;
    export let form; // ⭐ 新增：接收 action 返回的错误信息

    // ⭐ SSR 类型保护
    const fabrics = Array.isArray(data.fabrics) ? data.fabrics : [];
</script>

<div class="max-w-xl space-y-8">
    <h1 class="text-2xl font-semibold tracking-tight">
        Fabric Incoming（布料入库）
    </h1>

    <!-- ⭐ 修正 1：添加 use:enhance 提升用户体验 -->
    <!-- ⭐ 修正 2：显示错误信息 -->
    {#if form?.error}
        <div
            class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
        >
            <p class="font-medium">Error（错误）</p>
            <p class="text-sm">{form.error}</p>
        </div>
    {/if}

    <form method="POST" action="?/create" class="space-y-6" use:enhance>
        <!-- ===================== -->
        <!-- 布料选择 -->
        <!-- ===================== -->
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
                    <!-- v_fabric_stock 返回的是 sku, fabric_name -->
                    <option value={f.fabric_id}>
                        {f.sku} — {f.fabric_name} ({f.material})
                    </option>
                {/each}
            </select>
        </div>

        <!-- ===================== -->
        <!-- 数量 -->
        <!-- ===================== -->
        <div>
            <label for="quantity" class="block text-sm font-medium mb-1">
                Quantity（数量） <span class="text-red-500">*</span>
            </label>

            <input
                id="quantity"
                name="quantity"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="例如：100.5"
                class="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">单位：米（meters）</p>
        </div>

        <!-- ===================== -->
        <!-- 单价（可选） -->
        <!-- ===================== -->
        <div>
            <label for="unit_price" class="block text-sm font-medium mb-1">
                Unit Price（单价，可选）
            </label>

            <input
                id="unit_price"
                name="unit_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="例如：25.50"
                class="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">
                单位：元/米（CNY per meter）
            </p>
        </div>

        <!-- ===================== -->
        <!-- 供应商 -->
        <!-- ===================== -->
        <div>
            <label for="supplier_name" class="block text-sm font-medium mb-1">
                Supplier（供应商）
            </label>

            <input
                id="supplier_name"
                name="supplier_name"
                type="text"
                maxlength="100"
                placeholder="例如：上海纺织有限公司"
                class="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <!-- ===================== -->
        <!-- 发票号 -->
        <!-- ===================== -->
        <div>
            <label for="invoice_number" class="block text-sm font-medium mb-1">
                Invoice #（发票号）
            </label>

            <input
                id="invoice_number"
                name="invoice_number"
                type="text"
                maxlength="50"
                placeholder="例如：INV-2025-001"
                class="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <!-- 备注 -->
        <div>
            <label for="notes" class="block text-sm font-medium mb-1">
                Notes（备注）
            </label>

            <textarea
                id="notes"
                name="notes"
                rows="3"
                maxlength="500"
                class="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes（可选备注）"
            ></textarea>
        </div>

        <!-- 按钮组 -->
        <div class="flex gap-3 mt-4">
            <!-- 保存 -->
            <button
                type="submit"
                class="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
            >
                Save Incoming Record（保存入库记录）
            </button>

            <!-- 取消 -->
            <a
                href="/admin/inventory"
                class="bg-gray-200 text-gray-800 px-5 py-3 rounded-lg hover:bg-gray-300 transition inline-block text-center"
            >
                Cancel（取消）
            </a>
        </div>
    </form>
</div>
