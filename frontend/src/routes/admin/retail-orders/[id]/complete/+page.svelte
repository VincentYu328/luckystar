<script>
    export let data;

    const order = data.order;
    const items = data.items;

    const STATUS_LABEL = {
        pending: "Pending（待处理）",
        confirmed: "Confirmed（已确认）",
        completed: "Completed（已完成）",
        cancelled: "Cancelled（已取消）"
    };
</script>

<div class="space-y-10 max-w-3xl">

    <h1 class="text-3xl font-semibold tracking-tight">
        Complete Order #{order.id}（完成订单）
    </h1>

    <!-- ======= Order Info 订单信息 ======= -->
    <section class="bg-white border rounded-lg p-6 space-y-3">
        <h2 class="text-xl font-semibold mb-2">
            Order Summary（订单汇总）
        </h2>

        <div class="space-y-1 text-gray-700">

            <p><strong>Status（状态）:</strong>
                {STATUS_LABEL[order.status]}
            </p>

            <p><strong>Created At（创建时间）:</strong>
                {new Date(order.created_at).toLocaleString()}
            </p>

            {#if order.customer_name}
                <p><strong>Customer（顾客）:</strong>
                    {order.customer_name}
                </p>
            {/if}

            {#if order.notes}
                <p><strong>Notes（备注）:</strong>
                    {order.notes}
                </p>
            {/if}
        </div>
    </section>

    <!-- ======= Items 商品列表 ======= -->
    <section class="bg-white border rounded-lg p-6 space-y-3">
        <h2 class="text-xl font-semibold mb-2">
            Items（商品列表）
        </h2>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="p-3">SKU</th>
                        <th class="p-3">Product（商品）</th>
                        <th class="p-3">Qty（数量）</th>
                        <th class="p-3">Unit Price（单价）</th>
                        <th class="p-3">Subtotal（小计）</th>
                    </tr>
                </thead>
                <tbody>
                    {#each items as it}
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-3">{it.sku}</td>
                            <td class="p-3">{it.name}</td>
                            <td class="p-3">{it.qty}</td>
                            <td class="p-3">${it.unit_price}</td>
                            <td class="p-3 font-semibold">
                                ${ (it.qty * it.unit_price).toFixed(2) }
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </section>

    <!-- ======= Complete Order 操作 ======= -->
    <section class="bg-white border rounded-lg p-6 space-y-6">
        <h2 class="text-xl font-semibold">
            Complete Order（完成订单）
        </h2>

        <p class="text-gray-700 leading-relaxed">
            Completing this order will:
            <br />
            完成订单将执行以下操作：
        </p>

        <ul class="list-disc ml-6 text-gray-700 space-y-1">
            <li>Automatically deduct stock based on quantities（自动扣减库存）</li>
            <li>Record an inventory OUT transaction（记录库存“出库”流水）</li>
            <li>Mark the order as <strong class="text-green-700">Completed（已完成）</strong></li>
            <li>Write an audit log entry（写入操作审计日志）</li>
        </ul>

        <p class="text-red-600 font-medium">
            This action cannot be undone.（该操作不可撤销）
        </p>

        <form method="POST">
            <button
                type="submit"
                name="action"
                value="complete"
                class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
                Complete Order（确认完成）
            </button>
        </form>
    </section>

</div>
