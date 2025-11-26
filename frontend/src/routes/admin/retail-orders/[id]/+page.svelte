<script>
    export let data;

    const order = data.order;
    const items = data.items;
    const payments = data.payments;

    const STATUS_LABEL = {
        pending: "Pending（待处理）",
        confirmed: "Confirmed（已确认）",
        completed: "Completed（已完成）",
        cancelled: "Cancelled（已取消）"
    };
</script>

<div class="space-y-10">

    <h1 class="text-3xl font-semibold tracking-tight">
        Retail Order #{order.id}（零售订单）
    </h1>

    <!-- ========= Order Info 订单信息 ========= -->
    <section class="bg-white border rounded-lg p-6 space-y-3">
        <h2 class="text-xl font-semibold">
            Order Info（订单信息）
        </h2>

        <div class="text-gray-700 space-y-1">
            <p>
                <strong>Status（状态）:</strong>
                {STATUS_LABEL[order.status]}
            </p>

            <p>
                <strong>Created At（创建时间）:</strong>
                {new Date(order.created_at).toLocaleString()}
            </p>

            {#if order.customer_name}
                <p>
                    <strong>Customer（顾客）:</strong> {order.customer_name}
                </p>
            {/if}

            {#if order.customer_phone}
                <p>
                    <strong>Phone（电话）:</strong> {order.customer_phone}
                </p>
            {/if}

            {#if order.notes}
                <p>
                    <strong>Notes（备注）:</strong> {order.notes}
                </p>
            {/if}
        </div>
    </section>

    <!-- ========= Items 商品列表 ========= -->
    <section class="bg-white border rounded-lg p-6 space-y-3">
        <h2 class="text-xl font-semibold">
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

    <!-- ========= Payments 支付信息 ========= -->
    <section class="bg-white border rounded-lg p-6 space-y-3">
        <h2 class="text-xl font-semibold">
            Payments（支付记录）
        </h2>

        {#if payments.length === 0}
            <p class="text-gray-500">
                No payments recorded（尚无支付记录）
            </p>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="p-3">Date（日期）</th>
                            <th class="p-3">Amount（金額）</th>
                            <th class="p-3">Method（方式）</th>
                            <th class="p-3">Reference（参考号）</th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each payments as p}
                            <tr class="border-b hover:bg-gray-50">
                                <td class="p-3">{new Date(p.created_at).toLocaleString()}</td>
                                <td class="p-3">${p.amount}</td>
                                <td class="p-3">{p.method}</td>
                                <td class="p-3">{p.reference || '—'}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </section>

    <!-- ========= Actions 操作 ========= -->
    <section class="space-x-4">

        <a
            href={`/admin/retail-orders/${order.id}/review`}
            class="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            Review Order（审核订单）
        </a>

        {#if order.status !== 'completed'}
            <a
                href={`/admin/retail-orders/${order.id}/complete`}
                class="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
                Mark as Complete（标记为完成）
            </a>
        {/if}

    </section>

</div>
