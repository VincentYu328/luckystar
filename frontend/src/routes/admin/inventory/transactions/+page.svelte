<!-- frontend\src\routes\admin\inventory\transactions\+page.svelte -->

<script>
    export let data;

    // ⭐ SSR 类型防御
    const rows = Array.isArray(data.rows) ? data.rows : [];

    // ⭐ 安全格式化日期（避免 null / invalid）
    function fmt(ts) {
        if (!ts) return '—';
        const d = new Date(ts);
        return isNaN(d.getTime()) ? '—' : d.toLocaleString();
    }
</script>

<div class="space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Inventory Transactions（库存流水）
    </h1>

    <div class="bg-white border rounded-lg overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-3">Date（日期）</th>
                    <th class="p-3">Product（产品）</th>
                    <th class="p-3">Type（类型）</th>
                    <th class="p-3">Amount（数量）</th>
                    <th class="p-3">Reference（来源）</th>
                    <th class="p-3">User（操作人）</th>
                    <th class="p-3">Note（备注）</th>
                </tr>
            </thead>

            <tbody>
                {#each rows as r}
                <tr class="border-b hover:bg-gray-50">

                    <!-- 日期 -->
                    <td class="p-3 whitespace-nowrap">
                        {fmt(r.created_at)}
                    </td>

                    <!-- 产品 -->
                    <td class="p-3 whitespace-nowrap">
                        <div class="font-medium">{r.product_sku}</div>
                        <div class="text-gray-600">{r.product_name}</div>
                    </td>

                    <!-- 类型 -->
                    <td class="p-3 capitalize">
                        {r.transaction_type}
                    </td>

                    <!-- 数量 -->
                    <td class="p-3">
                        {r.quantity_change}
                    </td>

                    <!-- 来源 -->
                    <td class="p-3 text-gray-600">
                        {#if r.reference_type}
                            {r.reference_type} #{r.reference_id}
                        {:else}
                            —
                        {/if}
                    </td>

                    <!-- 操作人 -->
                    <td class="p-3 text-gray-600">
                        {r.operated_by ?? '—'}
                    </td>

                    <!-- 备注 -->
                    <td class="p-3 text-gray-600">
                        {r.reason || r.notes || '—'}
                    </td>

                </tr>
                {/each}
            </tbody>
        </table>
    </div>

</div>
