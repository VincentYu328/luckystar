<script>
    export let data;

    const fabrics = data.fabrics;
    let selected = null;

    let newQty = '';
    let note = '';
</script>

<div class="space-y-8">

    <h1 class="text-3xl font-semibold">
        Inventory Adjustment（库存盘点）
    </h1>

    <p class="text-gray-600">
        Only <span class="font-semibold text-red-600">Store Head（只有店长权限）</span>
        can directly modify inventory（才允许修改库存）。
        Use with caution（请慎用）。
    </p>

    <!-- Fabric selector -->
    <div>
        <label class="block mb-2 font-medium">
            Select Fabric（选择布料）
        </label>

        <select bind:value={selected} class="border rounded p-2 w-full">
            <option value="">— Select（选择） —</option>

            {#each fabrics as f}
                <option value={f.fabric_id}>
                    {f.sku} — {f.fabric_name} (Current 现有库存: {f.stock_balance})
                </option>
            {/each}
        </select>
    </div>

    {#if selected}
        {#each fabrics as f}
            {#if f.fabric_id == selected}
                <form method="POST" class="space-y-6 border rounded p-6 bg-white">

                    <input type="hidden" name="product_id" value={f.fabric_id} />

                    <div>
                        <label class="block mb-1 font-medium">
                            Current Stock（当前库存）
                        </label>
                        <div class="text-lg font-semibold">
                            {f.stock_balance}
                        </div>
                    </div>

                    <div>
                        <label class="block mb-1 font-medium">
                            New Stock Value（更新后库存）
                        </label>
                        <input
                            name="new_quantity"
                            type="number"
                            min="0"
                            bind:value={newQty}
                            class="border rounded p-2 w-full"
                            required
                        />
                    </div>

                    <div>
                        <label class="block mb-1 font-medium">
                            Notes (optional)（备注，可选）
                        </label>
                        <textarea
                            name="note"
                            bind:value={note}
                            class="border rounded p-2 w-full"
                            rows="3"
                            placeholder="Describe the reason for adjustment…（说明调整原因…）"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        name="action"
                        value="adjust"
                        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                        Confirm Adjustment（确认盘点）
                    </button>

                </form>
            {/if}
        {/each}
    {/if}

</div>
