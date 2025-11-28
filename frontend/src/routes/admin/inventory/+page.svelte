<!-- frontend/src/routes/admin/inventory/+page.svelte -->

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

    <!-- 页面标题 -->
    <h1 class="text-3xl font-semibold tracking-tight">
        Inventory Overview（库存总览）
    </h1>

    <!-- ======================================
         操作入口区：入库 / 使用 / 流水 / 盘点
    ======================================= -->
    <div class="flex flex-wrap gap-4 mb-6">

        <!-- 入库 -->
        <a
            href="/admin/inventory/in"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            + Fabric Incoming（布料入库）
        </a>

        <!-- 使用 -->
        <a
            href="/admin/inventory/out"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
            + Fabric Usage（布料使用）
        </a>

        <!-- 流水 -->
        <a
            href="/admin/inventory/transactions"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
        >
            Inventory Transactions（库存流水）
        </a>

        <!-- 盘点（仅 Admin / Head） -->
        {#if user?.role_name === 'admin'}
            <a
                href="/admin/inventory/adjust"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
                Inventory Adjustment（库存盘点）
            </a>
        {/if}

    </div>

    <!-- ============================
         布料库存（Fabric Stock）
    ============================= -->
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

    <!-- ============================
         成衣库存（Garment Stock）
    ============================= -->
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
                            <td class="p-3">{g.needs_reorder ? '⚠️ Yes（是）' : '—'}</td>
                            <td class="p-3">{g.last_updated}</td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </section>

</div>
