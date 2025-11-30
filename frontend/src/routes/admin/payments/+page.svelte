<!-- frontend/src/routes/admin/payments/+page.svelte -->
<script>
    export let data;
    export let form;

    // 🔥 修复：使用响应式解构
    $: payments = data.payments;
    $: errorMsg = form?.error || '';
</script>

<div class="space-y-8 p-4">

    <h1 class="text-3xl font-semibold tracking-tight">
        Payments（付款记录）
    </h1>

    {#if errorMsg}
        <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            ❌ {errorMsg}
        </div>
    {/if}

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
                                <div class="flex justify-end gap-3">
                                    {#if p.payment_method === 'transfer' && !p.transfer_verified}
                                        <form method="POST" action="?/verify" class="inline">
                                            <input type="hidden" name="paymentId" value={p.id} />
                                            <button
                                                type="submit"
                                                class="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                            >
                                                Verify（验证）
                                            </button>
                                        </form>
                                    {/if}
                                    <a
                                        href={`/admin/payments/${p.id}`}
                                        class="text-blue-600 hover:underline"
                                    >
                                        View（查看）
                                    </a>
                                </div>
                            </td>

                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

</div>