<!-- frontend/src/routes/admin/payments/[id]/+page.svelte -->

<script>
    export let data;

    $: ({ payment, order } = data);

    const PAYMENT_TYPE_LABELS = {
        deposit: 'Deposit / 定金',
        final: 'Final Payment / 尾款',
        full: 'Full Payment / 全款'
    };

    const PAYMENT_METHOD_LABELS = {
        cash: 'Cash / 现金',
        eftpos: 'EFTPOS / 刷卡',
        transfer: 'Bank Transfer / 银行转账'
    };
</script>

<div class="max-w-4xl mx-auto p-6 space-y-6">
    <!-- 返回按钮 -->
    <div>
        <a
            href="/admin/payments"
            class="inline-flex items-center text-blue-600 hover:underline font-medium"
        >
            ← Back to Payments List / 返回付款列表
        </a>
    </div>

    <!-- 标题 -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
            Payment #{payment?.id}
        </h1>
        <p class="text-gray-600">
            Payment Date: {new Date(payment?.payment_date).toLocaleString('en-NZ')}
        </p>
    </div>

    <!-- 付款详情 -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            Payment Details / 付款详情
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <p class="text-sm text-gray-600">Payment Type / 付款类型</p>
                <p class="text-lg font-medium text-gray-800">
                    {PAYMENT_TYPE_LABELS[payment?.payment_type] || payment?.payment_type}
                </p>
            </div>

            <div>
                <p class="text-sm text-gray-600">Payment Method / 付款方式</p>
                <p class="text-lg font-medium text-gray-800">
                    {PAYMENT_METHOD_LABELS[payment?.payment_method] || payment?.payment_method}
                </p>
            </div>

            <div>
                <p class="text-sm text-gray-600">Amount / 金额</p>
                <p class="text-2xl font-bold text-green-600">
                    ${(payment?.amount ?? 0).toFixed(2)}
                </p>
            </div>

            <div>
                <p class="text-sm text-gray-600">Order / 订单</p>
                <p class="text-lg font-medium text-gray-800">
                    {#if payment?.order_type === 'retail'}
                        <a href="/admin/retail-orders/{payment.order_id}" class="text-blue-600 hover:underline">
                            Retail Order #{payment.order_id}
                        </a>
                    {:else}
                        {payment?.order_type} #{payment?.order_id}
                    {/if}
                </p>
            </div>

            {#if payment?.payment_method === 'transfer'}
                <div class="md:col-span-2">
                    <p class="text-sm text-gray-600">Transfer Reference / 转账参考号</p>
                    <p class="text-lg font-medium text-gray-800">
                        {payment?.transfer_reference || 'N/A'}
                    </p>
                </div>

                <div class="md:col-span-2">
                    <p class="text-sm text-gray-600">Verification Status / 验证状态</p>
                    {#if payment?.transfer_verified}
                        <p class="text-lg font-semibold text-green-700">
                            ✓ Verified on {new Date(payment.verified_date).toLocaleString('en-NZ')}
                        </p>
                        <p class="text-sm text-gray-600 mt-1">
                            Verified by: {payment.verified_by_name || `User #${payment.verified_by}`}
                        </p>
                    {:else}
                        <p class="text-lg font-semibold text-orange-600">
                            ⏳ Pending Verification
                        </p>
                    {/if}
                </div>
            {/if}

            {#if payment?.notes}
                <div class="md:col-span-2">
                    <p class="text-sm text-gray-600">Notes / 备注</p>
                    <p class="text-gray-700">{payment.notes}</p>
                </div>
            {/if}

            <div>
                <p class="text-sm text-gray-600">Received By / 收款人</p>
                <p class="text-lg font-medium text-gray-800">
                    {payment?.received_by_name || `User #${payment?.received_by}`}
                </p>
            </div>
        </div>
    </div>

    <!-- 关联订单信息（如果有） -->
    {#if order}
        <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">
                Related Order / 关联订单
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p class="text-sm text-gray-600">Order Number / 订单号</p>
                    <p class="text-lg font-medium text-gray-800">
                        #{order.order_number || order.id}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Customer / 客户</p>
                    <p class="text-lg font-medium text-gray-800">
                        {order.customer_name || '(Anonymous / 匿名)'}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Order Total / 订单总额</p>
                    <p class="text-lg font-medium text-gray-800">
                        ${(order.total_amount ?? 0).toFixed(2)}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Order Status / 订单状态</p>
                    <p class="text-lg font-medium text-gray-800 capitalize">
                        {order.status}
                    </p>
                </div>

                <div class="md:col-span-2">
                    <a
                        href="/admin/retail-orders/{order.id}"
                        class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                    >
                        View Full Order / 查看完整订单
                    </a>
                </div>
            </div>
        </div>
    {/if}
</div>
