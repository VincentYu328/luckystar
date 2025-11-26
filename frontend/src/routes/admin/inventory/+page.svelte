<script>
    export let data;

    const fabric = data.fabricStock;
    const garments = data.garmentStock;
</script>

<div class="space-y-10">

    <h1 class="text-3xl font-semibold tracking-tight">
        Inventory Overview（库存总览）
    </h1>

    <!-- ========================= -->
    <!-- Fabric Stock (布料库存)     -->
    <!-- ========================= -->
    <section>
        <h2 class="text-xl font-semibold mb-4">
            Fabric Stock（布料库存）
        </h2>

        {#if fabric.length === 0}
            <p class="text-gray-500">
                No fabric records.（暂无布料记录）
            </p>
        {:else}
            <div class="overflow-x-auto border rounded-lg bg-white">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="p-3">SKU</th>
                            <th class="p-3">Name（名称）</th>
                            <th class="p-3">Material（材质）</th>
                            <th class="p-3">Pattern（花型）</th>
                            <th class="p-3">Width（幅宽）</th>
                            <th class="p-3">In（入库）</th>
                            <th class="p-3">Used（使用）</th>
                            <th class="p-3">Balance（结余）</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each fabric as f}
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-3">{f.sku}</td>
                            <td class="p-3">{f.fabric_name}</td>
                            <td class="p-3">{f.material}</td>
                            <td class="p-3">{f.pattern}</td>
                            <td class="p-3">{f.width_cm} cm</td>
                            <td class="p-3">{f.total_in}</td>
                            <td class="p-3">{f.total_used}</td>
                            <td class="p-3 font-semibold">{f.stock_balance}</td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </section>

    <!-- ========================= -->
    <!-- Garment Stock (成衣库存)  -->
    <!-- ========================= -->
    <section>
        <h2 class="text-xl font-semibold mb-4">
            Garment Stock（成衣库存）
        </h2>

        {#if garments.length === 0}
            <p class="text-gray-500">
                No garment inventory.（暂无成衣库存）
            </p>
        {:else}
            <div class="overflow-x-auto border rounded-lg bg-white">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="p-3">SKU</th>
                            <th class="p-3">Name（名称）</th>
                            <th class="p-3">Stock（数量）</th>
                            <th class="p-3">Reorder（需补货）</th>
                            <th class="p-3">Last Updated（更新时间）</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each garments as g}
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-3">{g.sku}</td>
                            <td class="p-3">{g.product_name}</td>
                            <td class="p-3">{g.quantity_on_hand}</td>
                            <td class="p-3">
                                {g.needs_reorder ? '⚠️ Yes（是）' : '—'}
                            </td>
                            <td class="p-3">{g.last_updated}</td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </section>

</div>
