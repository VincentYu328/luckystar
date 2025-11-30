<script>
    import { enhance } from "$app/forms";
    export let data;
    export let form;
    const garments = Array.isArray(data.garments) ? data.garments : [];
    let initialData = form?.data || {};
</script>

<div class="max-w-xl space-y-8">
    <h1 class="text-2xl font-semibold tracking-tight">
        Garment Incoming（成衣入库）
    </h1>

    {#if form?.error}
        <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <p class="font-medium">Error（错误）</p>
            <p class="text-sm">{form.error}</p>
        </div>
    {/if}

    <form
        method="POST"
        action="?/create"
        class="space-y-6"
        use:enhance
    >
        <div>
            <label for="garment_id" class="block text-sm font-medium mb-1">
                Garment（成衣） <span class="text-red-500">*</span>
            </label>
            <select
                id="garment_id"
                name="garment_id"
                required
                class="border rounded p-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
                <option value="">Select garment…（选择成衣…）</option>
                {#each garments as g}
                    <option value={g.id} selected={initialData.garment_id == g.id}>
                        {g.sku} — {g.name} ({g.style} / {g.size_label})
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
                placeholder="例如：50"
                value={initialData.quantity ?? ""}
                class="border rounded p-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <p class="text-xs text-gray-500 mt-1">单位：件（pieces）</p>
        </div>

        <div>
            <label for="unit_cost" class="block text-sm font-medium mb-1">
                Unit Cost（单位成本价，可选）
            </label>
            <input
                id="unit_cost"
                name="unit_cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="例如：15.00"
                value={initialData.unit_cost ?? ""}
                class="border rounded p-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <p class="text-xs text-gray-500 mt-1">
                用于利润核算。单位：元/件（CNY per piece）
            </p>
        </div>

        <div>
            <label for="source_type" class="block text-sm font-medium mb-1">
                Source Type（来源类型） <span class="text-red-500">*</span>
            </label>
            <select
                id="source_type"
                name="source_type"
                required
                class="border rounded p-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
                <option value="production" selected={initialData.source_type === "production"}>
                    Production（自产）
                </option>
                <option value="purchase" selected={initialData.source_type === "purchase"}>
                    Purchase（采购）
                </option>
            </select>
        </div>

        <div>
            <label for="source_reference" class="block text-sm font-medium mb-1">
                Reference / Batch ID（参考/批次号，可选）
            </label>
            <input
                id="source_reference"
                name="source_reference"
                type="text"
                maxlength="50"
                placeholder="例如：WO-2025-001 (工单号) 或 INV-P-2025-005 (采购发票)"
                value={initialData.source_reference ?? ""}
                class="border rounded p-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
                placeholder="Optional notes（可选备注）"
                class="border rounded p-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y"
            >{initialData.notes ?? ""}</textarea>
        </div>

        <div class="flex gap-3 mt-6">
            <button
                type="submit"
                class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
            >
                Save Garment Incoming（保存成衣入库记录）
            </button>

            <a
                href="/admin/inventory"
                class="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium text-center inline-block"
            >
                Cancel（取消）
            </a>
        </div>
    </form>
</div>