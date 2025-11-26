<script>
    export let data;

    const order = data.order;
    const fabrics = data.fabrics;
    let selected = data.selected; // [{ fabric_id, qty, note }...]

    // 操作：增加布料
    function addFabric() {
        selected = [...selected, { fabric_id: '', qty: '', note: '' }];
    }

    // 删除布料
    function removeFabric(i) {
        selected = selected.filter((_, idx) => idx !== i);
    }

    function toJSON() {
        return JSON.stringify(selected);
    }
</script>

<div class="space-y-10 max-w-3xl">

    <h1 class="text-3xl font-semibold tracking-tight">
        Select Fabrics（选择团体订单布料）
    </h1>

    <p class="text-gray-700">
        Group Order #{order.id} — {order.group_name}
    </p>

    <form method="POST" class="space-y-10">
        <input type="hidden" name="fabrics" value={toJSON()} />

        <!-- ========= Fabric List ========= -->
        <div class="space-y-6">

            {#each selected as item, i}
                <div class="border rounded-lg p-5 bg-white space-y-4">

                    <!-- 布料下拉 -->
                    <div>
                        <label class="block text-sm font-medium mb-1">
                            Fabric（布料）
                        </label>
                        <select
                            bind:value={item.fabric_id}
                            class="border rounded p-2 w-full"
                            required
                        >
                            <option value="">— Select Fabric —</option>

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
                            type="number"
                            step="0.01"
                            bind:value={item.qty}
                            class="border rounded p-2 w-full"
                            required
                        />
                    </div>

                    <!-- 备注 -->
                    <div>
                        <label class="block text-sm font-medium mb-1">
                            Notes（备注）
                        </label>
                        <textarea
                            bind:value={item.note}
                            class="border rounded p-2 w-full"
                            rows="2"
                        ></textarea>
                    </div>

                    <button
                        type="button"
                        on:click={() => removeFabric(i)}
                        class="text-red-600 hover:underline text-sm"
                    >
                        Delete（删除）
                    </button>

                </div>
            {/each}

            <!-- Add Fabric -->
            <button
                type="button"
                on:click={addFabric}
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
                + Add Fabric（新增布料）
            </button>
        </div>

        <!-- Submit -->
        <button
            type="submit"
            name="action"
            value="save"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            Save Fabrics（保存布料）
        </button>
    </form>

</div>
