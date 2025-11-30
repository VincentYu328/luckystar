<script>
    export let data;

    // =============================
    // 类型防御（防止 SSR 崩溃）
    // =============================
    const fabric = Array.isArray(data.fabricStock) ? data.fabricStock : [];
    const garments = Array.isArray(data.garmentStock) ? data.garmentStock : [];

    // 用户对象（用于 Head/Admin 权限判断）
    const user = data.user ?? null;
</script>

<div class="space-y-10">
    <h1 class="text-3xl font-semibold tracking-tight">
        Inventory Overview（库存总览）
    </h1>

    <div class="flex flex-wrap gap-4 mb-6">
        <a
            href="/admin/inventory/garment-in"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
            + Garment Incoming（成衣入库）
        </a>

        <a
            href="/admin/inventory/garment-out"
            class="px-4 py-2 bg-fuchsia-600 text-white rounded-lg hover:bg-fuchsia-700"
        >
            + Garment Sales（成衣销售）
        </a>

        <a
            href="/admin/inventory/fabric-in"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            + Fabric Incoming（布料入库）
        </a>

        <a
            href="/admin/inventory/fabric-out"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
            + Fabric Usage（布料使用）
        </a>

        <a
            href="/admin/inventory/transactions"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
        >
            Inventory Transactions（库存流水）
        </a>

        {#if user?.role_name === "admin"}
            <a
                href="/admin/inventory/adjust"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
                Inventory Adjustment（库存盘点）
            </a>
        {/if}
    </div>

    <section>
        <h2 class="text-xl font-semibold mb-4">Fabric Stock（布料库存）</h2>

        {#if fabric.length === 0}
            <p class="text-gray-500">No fabric records.（暂无布料记录）</p>
        {:else}
            <div class="overflow-x-auto border rounded-lg bg-white">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="p-3">SKU</th>
                            <th class="p-3">Name（名称）</th>
                            <th class="p-3">In（入库）</th>
                            <th class="p-3">Used（使用）</th>
                            <th class="p-3">Balance（结余）</th>
                            <th class="p-3">Last Updated（更新时间）</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each fabric as f}
                            <tr class="border-b hover:bg-gray-50">
                                <td class="p-3">{f.sku}</td>
                                <td class="p-3">{f.fabric_name}</td>
                                <td class="p-3">{f.total_in}</td>
                                <td class="p-3">{f.total_used}</td>
                                <td class="p-3 font-semibold"
                                    >{f.stock_balance}</td
                                >
                                <td class="p-3">{f.last_updated}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </section>


    <section>
        <h2 class="text-xl font-semibold mb-4">Garment Stock（成衣库存）</h2>

        {#if garments.length === 0}
            <p class="text-gray-500">No garment inventory.（暂无成衣库存）</p>
        {:else}
            <div class="overflow-x-auto border rounded-lg bg-white">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="p-3">SKU</th>
                            <th class="p-3">Name（名称）</th>
                            <th class="p-3">In（入库）</th>
                            <th class="p-3">Used（使用）</th>
                            <th class="p-3">Balance（结余）</th>
                            <th class="p-3">Last Updated（更新时间）</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each garments as g}
                            <tr class="border-b hover:bg-gray-50">
                                <td class="p-3">{g.sku}</td>
                                <td class="p-3">{g.product_name}</td>
                                <td class="p-3">{g.total_in}</td>
                                <td class="p-3">{g.total_used}</td>
                                <td class="p-3 font-semibold"
                                    >{g.stock_balance}</td
                                > <td class="p-3">{g.last_updated}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </section>
</div>
