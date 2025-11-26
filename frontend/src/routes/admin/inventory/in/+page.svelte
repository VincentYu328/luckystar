<script>
    export let data;

    let fabrics = data.fabrics;
</script>

<div class="max-w-xl space-y-8">

    <h1 class="text-2xl font-semibold tracking-tight">
        Fabric Incoming（布料入库）
    </h1>

    <form method="POST" class="space-y-5">

        <!-- 布料选择 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Fabric（布料）
            </label>
            <select name="fabric_id" class="border rounded p-2 w-full" required>
                <option value="">Select fabric…（选择布料…）</option>

                {#each fabrics as f}
                    <option value={f.id}>
                        {f.sku} — {f.name}
                    </option>
                {/each}
            </select>
        </div>

        <!-- 数量 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Quantity（数量）
            </label>
            <input
                name="quantity"
                type="number"
                step="0.01"
                class="border rounded p-2 w-full"
                required
            />
        </div>

        <!-- 单价（可选） -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Unit Price（单价，可选）
            </label>
            <input
                name="unit_price"
                type="number"
                step="0.01"
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- 供应商 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Supplier（供应商）
            </label>
            <input
                name="supplier_name"
                placeholder="Supplier name（供应商名称）"
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- 发票编号 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Invoice #（发票号）
            </label>
            <input
                name="invoice_number"
                placeholder="Invoice number（发票编号）"
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- Notes -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Notes（备注）
            </label>
            <textarea
                name="notes"
                class="border rounded p-2 w-full"
                rows="3"
                placeholder="Optional notes（可选备注）"
            ></textarea>
        </div>

        <button
            type="submit"
            name="action"
            value="create"
            class="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
            Save Incoming Record（保存入库记录）
        </button>
    </form>

</div>
