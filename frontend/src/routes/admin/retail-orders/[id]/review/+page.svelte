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
        Review Order #{order.id}（审核订单）
    </h1>

    <!-- ======= Order Info 订单信息 ======= -->
    <section class="bg-white border rounded-lg p-6 space-y-3">
        <h2 class="text-xl font-semibold mb-2">
            Order Summary（订单摘要）
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

    <!-- ======= Review Action 确认操作 ======= -->
    <section class="bg-white border rounded-lg p-6 space-y-6">
        <h2 class="text-xl font-semibold mb-1">
            Confirm Order（确认订单）
        </h2>

        <p class="text-gray-700 leading-relaxed">
            Please verify that all items, quantities, and customer details are correct.
            <br />
            请确认所有商品、数量以及顾客信息无误。
            <br />
            Once confirmed, the order will move to 
            <strong class="text-blue-600">Confirmed（已确认）</strong> status.
            <br />
            点击确认后，订单将进入<strong class="text-blue-600">已确认</strong>阶段。
        </p>

        <form method="POST">
            <button
                type="submit"
                name="action"
                value="confirm"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Confirm Order（确认订单）
            </button>
        </form>
    </section>

</div>
