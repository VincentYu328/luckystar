<script>
    export let data;
    const orders = data.orders;

    const STATUS_LABEL = {
        pending:    "Pending / 待处理",
        confirmed:  "Confirmed / 已确认",
        completed:  "Completed / 已完成",
        cancelled:  "Cancelled / 已取消"
    };
</script>

<div class="space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Retail Orders（零售订单）
    </h1>

    {#if orders.length === 0}
        <p class="text-gray-600">No retail orders yet（暂无零售订单）</p>
    {:else}
        <div class="bg-white border rounded-lg overflow-x-auto">
            <table class="w-full text-left text-sm">

                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="p-3">Order #（订单号）</th>
                        <th class="p-3">Customer（客户）</th>
                        <th class="p-3">Total（总金额）</th>
                        <th class="p-3">Status（状态）</th>
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

                            <!-- 客户姓名 -->
                            <td class="p-3">
                                {o.customer_name ?? '(anonymous / 匿名)'}
                            </td>

                            <!-- 总金额 -->
                            <td class="p-3">
                                ${o.total_amount}
                            </td>

                            <!-- 状态（双语） -->
                            <td class="p-3 whitespace-nowrap">
                                {STATUS_LABEL[o.status] ?? o.status}
                            </td>

                            <!-- 创建时间 -->
                            <td class="p-3 whitespace-nowrap">
                                {new Date(o.created_at).toLocaleString()}
                            </td>

                            <!-- 查看 -->
                            <td class="p-3">
                                <a 
                                    href={`/admin/retail-orders/${o.id}`}
                                    class="text-blue-600 hover:underline"
                                >
                                    View / 查看
                                </a>
                            </td>

                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

</div>
