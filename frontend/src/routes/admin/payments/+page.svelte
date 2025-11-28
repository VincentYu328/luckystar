<!-- frontend/src/routes/admin/payments/+page.svelte -->
<script>
    export let data;
    
    // 🔥 修复：使用响应式解构
    $: payments = data.payments;
</script>

<div class="space-y-8 p-4">

    <h1 class="text-3xl font-semibold tracking-tight">
        Payments（付款记录）
    </h1>

    {#if payments.length === 0}
        <div class="text-center py-12 bg-gray-50 rounded-lg">
            <p class="text-gray-600">No payment records yet（暂无付款记录）</p>
        </div>
    {:else}
        <div class="bg-white border rounded-lg overflow-hidden shadow-sm">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="p-3 font-medium">Order（订单）</th>
                        <th class="p-3 font-medium">Type（类型）</th>
                        <th class="p-3 font-medium">Method（方式）</th>
                        <th class="p-3 font-medium text-right">Amount（金额）</th>
                        <th class="p-3 font-medium">Date（日期）</th>
                        <th class="p-3 font-medium">Verified（验证）</th>
                        <th class="p-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {#each payments as p (p.id)}
                        <tr class="border-b hover:bg-gray-50 transition">

                            <!-- 订单编号 -->
                            <td class="p-3">
                                {p.order_type} #{p.order_id}
                            </td>

                            <!-- 付款类型 deposit / final / full -->
                            <td class="p-3 capitalize">{p.payment_type}</td>

                            <!-- 付款方式 cash / eftpos / transfer -->
                            <td class="p-3 capitalize">{p.payment_method}</td>

                            <!-- 金额 -->
                            <td class="p-3 font-medium text-green-700 text-right">
                                ${(p.amount ?? 0).toFixed(2)}
                            </td>

                            <!-- 日期 -->
                            <td class="p-3 whitespace-nowrap text-gray-600">
                                {new Date(p.payment_date).toLocaleDateString('zh-CN')}
                            </td>

                            <!-- 验证状态 -->
                            <td class="p-3">
                                {#if p.payment_method === 'transfer'}
                                    {#if p.transfer_verified}
                                        <span class="text-green-700 font-semibold">✓ Verified</span>
                                    {:else}
                                        <span class="text-red-600 font-semibold">⏳ Pending</span>
                                    {/if}
                                {:else}
                                    <span class="text-gray-500">—</span>
                                {/if}
                            </td>

                            <!-- 操作 -->
                            <td class="p-3 text-right">
                                
                                    href={`/admin/payments/${p.id}`}
                                    class="text-blue-600 hover:underline"
                                <a>
                                    View（查看）
                                </a>
                            </td>

                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

</div>