<script>
    export let data;
    const orders = data.orders;
</script>

<div class="space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Pending Retail Orders（待处理订单）
    </h1>

    {#if orders.length === 0}
        <p class="text-gray-600">
            No pending orders（暂无待处理订单）
        </p>
    {:else}
        <div class="bg-white border rounded-lg overflow-x-auto">
            <table class="w-full text-left text-sm">

                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="p-3">Order #（订单号）</th>
                        <th class="p-3">Customer（客户）</th>
                        <th class="p-3">Total（总金额）</th>
                        <th class="p-3">Created（创建时间）</th>
                        <th class="p-3">Actions（操作）</th>
                    </tr>
                </thead>

                <tbody>
                    {#each orders as o}
                        <tr class="border-b hover:bg-gray-50">

                            <!-- 订单号 -->
                            <td class="p-3 font-semibold">
                                #{o.id}
                            </td>

                            <!-- 客户 -->
                            <td class="p-3">
                                {o.customer_name ?? '(anonymous / 匿名)'}
                            </td>

                            <!-- 总金额 -->
                            <td class="p-3">
                                ${o.total_amount}
                            </td>

                            <!-- 创建时间 -->
                            <td class="p-3 whitespace-nowrap">
                                {new Date(o.created_at).toLocaleString()}
                            </td>

                            <!-- 操作：Review -->
                            <td class="p-3">
                                <a 
                                    href={`/admin/retail-orders/${o.id}`}
                                    class="text-blue-600 hover:underline"
                                >
                                    Review / 审核
                                </a>
                            </td>

                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

</div>
