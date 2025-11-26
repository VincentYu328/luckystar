<script>
    export let data;

    let fabrics = data.fabrics;
    let garments = data.garments;
</script>

<div class="max-w-xl space-y-8">

    <h1 class="text-2xl font-semibold tracking-tight">
        Fabric Usage（布料使用记录）
    </h1>

    <form method="POST" class="space-y-5">

        <!-- 布料 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Fabric（布料）
            </label>
            <select name="fabric_id" required class="border rounded p-2 w-full">
                <option value="">Select fabric…（选择布料…）</option>
                {#each fabrics as f}
                    <option value={f.id}>
                        {f.sku} — {f.name}
                    </option>
                {/each}
            </select>
        </div>

        <!-- 成衣（可选） -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Garment（成衣，可选）
            </label>
            <select name="garment_id" class="border rounded p-2 w-full">
                <option value="">— None（无） —</option>
                {#each garments as g}
                    <option value={g.id}>
                        {g.sku} — {g.name}
                    </option>
                {/each}
            </select>
        </div>

        <!-- 使用数量 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Used Quantity（使用数量）
            </label>
            <input
                name="used_quantity"
                type="number"
                step="0.01"
                required
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- 使用类型 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Usage Type（使用类型）
            </label>
            <select name="usage_type" class="border rounded p-2 w-full">
                <option value="cut">Cut（裁剪）</option>
                <option value="sample">Sample（样品）</option>
                <option value="waste">Waste（损耗/废料）</option>
            </select>
        </div>

        <!-- 备注 -->
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

        <!-- 完成按钮 -->
        <button
            type="submit"
            name="action"
            value="create"
            class="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
            Save Usage Record（保存布料使用记录）
        </button>

    </form>

</div>
