<script>
    export let data;

    const payments = data.payments;
</script>

<div class="space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Payments（付款记录）
    </h1>

    <div class="bg-white border rounded-lg overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-3">Order（订单）</th>
                    <th class="p-3">Type（类型）</th>
                    <th class="p-3">Method（方式）</th>
                    <th class="p-3">Amount（金额）</th>
                    <th class="p-3">Date（日期）</th>
                    <th class="p-3">Verified（验证）</th>
                    <th class="p-3"></th>
                </tr>
            </thead>

            <tbody>
                {#each payments as p}
                    <tr class="border-b hover:bg-gray-50">

                        <!-- 订单编号 -->
                        <td class="p-3">
                            {p.order_type} #{p.order_id}
                        </td>

                        <!-- 付款类型 deposit / final / full -->
                        <td class="p-3 capitalize">{p.payment_type}</td>

                        <!-- 付款方式 cash / eftpos / transfer -->
                        <td class="p-3">{p.payment_method}</td>

                        <!-- 金额 -->
                        <td class="p-3 font-medium text-green-700">
                            ${p.amount.toFixed(2)}
                        </td>

                        <!-- 日期 -->
                        <td class="p-3 whitespace-nowrap">
                            {new Date(p.payment_date).toLocaleString()}
                        </td>

                        <!-- 验证状态 -->
                        <td class="p-3">
                            {#if p.payment_method === 'transfer'}
                                {#if p.transfer_verified}
                                    <span class="text-green-700 font-semibold">Verified</span>
                                {:else}
                                    <span class="text-red-600 font-semibold">Pending</span>
                                {/if}
                            {:else}
                                <span class="text-gray-500">—</span>
                            {/if}
                        </td>

                        <td class="p-3 text-right">
                            <a
                                href={`/admin/payments/${p.id}`}
                                class="text-blue-600 hover:underline"
                            >
                                View（查看）
                            </a>
                        </td>

                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

</div>
