<!-- src/routes/admin/retail-orders/[id]/+page.svelte -->
 
<script>
    import { enhance } from "$app/forms";

    export let data;
    export let form;

    $: ({ order, items, products, payments, paidAmount, remainingAmount, isEditing } = data);
    $: errorMsg = form?.error || '';

    let showPaymentForm = false;
    let paymentMethod = 'cash';

    // Status labels and colors (复用主列表的样式)
    const STATUS_LABEL = {
        pending: "Pending / 待处理",
        confirmed: "Confirmed / 已确认",
        completed: "Completed / 已完成",
        cancelled: "Cancelled / 已取消",
    };

    const STATUS_COLOR = {
        pending: "bg-yellow-100 text-yellow-800",
        confirmed: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
    };

    // 编辑模式下的本地状态
    let editForm = {
        customer_name: order?.customer_name || "",
        customer_phone: order?.customer_phone || "",
        customer_address: order?.customer_address || "",
        status: order?.status || "pending",
        notes: order?.notes || "",
    };

    // 当进入编辑模式时，初始化表单数据
    $: if (isEditing && order) {
        editForm = {
            customer_name: order.customer_name || "",
            customer_phone: order.customer_phone || "",
            customer_address: order.customer_address || "",
            status: order.status || "pending",
            notes: order.notes || "",
        };
    }
</script>

<div class="max-w-6xl mx-auto p-6 space-y-6">
    <!-- 返回按钮 -->
    <div>
        <a
            href="/admin/retail-orders"
            class="inline-flex items-center text-blue-600 hover:underline font-medium"
        >
            ← Back to Orders List / 返回订单列表
        </a>
    </div>

    <!-- 标题和状态 -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="flex justify-between items-start mb-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-2">
                    Order #{order?.order_number || order?.id}
                </h1>
                <p class="text-gray-600">
                    Created: {new Date(order?.created_at).toLocaleString("en-NZ")}
                </p>
            </div>

            <div class="flex gap-3 items-center">
                <!-- 状态徽章 -->
                <span
                    class="px-3 py-1 rounded-full text-sm font-medium {STATUS_COLOR[
                        order?.status
                    ] || 'bg-gray-100 text-gray-800'}"
                >
                    {STATUS_LABEL[order?.status] || order?.status}
                </span>

                <!-- 编辑按钮 (仅在查看模式显示) -->
                {#if !isEditing}
                    <a
                        href="?edit=true"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                    >
                        Edit / 编辑
                    </a>
                {/if}
            </div>
        </div>
    </div>

    {#if isEditing}
        <!-- 编辑模式 -->
        <form
            method="POST"
            action="?/update"
            use:enhance
            class="bg-white rounded-lg shadow-sm border p-6 space-y-6"
        >
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">
                Edit Order / 编辑订单
            </h2>

            <!-- 客户信息 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name / 客户姓名
                    </label>
                    <input
                        type="text"
                        name="customer_name"
                        bind:value={editForm.customer_name}
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Phone / 电话
                    </label>
                    <input
                        type="text"
                        name="customer_phone"
                        bind:value={editForm.customer_phone}
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Address / 地址
                </label>
                <input
                    type="text"
                    name="customer_address"
                    bind:value={editForm.customer_address}
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Status / 状态
                </label>
                <select
                    name="status"
                    bind:value={editForm.status}
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                    <option value="pending">Pending / 待处理</option>
                    <option value="confirmed">Confirmed / 已确认</option>
                    <option value="completed">Completed / 已完成</option>
                    <option value="cancelled">Cancelled / 已取消</option>
                </select>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Notes / 备注
                </label>
                <textarea
                    name="notes"
                    bind:value={editForm.notes}
                    rows="3"
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                ></textarea>
            </div>

            <div class="flex gap-3 pt-4">
                <button
                    type="submit"
                    class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
                >
                    Save Changes / 保存更改
                </button>
                <a
                    href="/admin/retail-orders/{order?.id}"
                    class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition"
                >
                    Cancel / 取消
                </a>
            </div>
        </form>
    {:else}
        <!-- 查看模式 -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">
                Customer Information / 客户信息
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p class="text-sm text-gray-600">Customer Name / 客户姓名</p>
                    <p class="text-lg font-medium text-gray-800">
                        {order?.customer_name || "(Anonymous / 匿名)"}
                    </p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Phone / 电话</p>
                    <p class="text-lg font-medium text-gray-800">
                        {order?.customer_phone || "N/A"}
                    </p>
                </div>

                <div class="md:col-span-2">
                    <p class="text-sm text-gray-600">Address / 地址</p>
                    <p class="text-lg font-medium text-gray-800">
                        {order?.customer_address || "N/A"}
                    </p>
                </div>

                {#if order?.notes}
                    <div class="md:col-span-2">
                        <p class="text-sm text-gray-600">Notes / 备注</p>
                        <p class="text-gray-700">{order.notes}</p>
                    </div>
                {/if}
            </div>
        </div>

        <!-- 订单项目列表 -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">
                Order Items / 订单项目
            </h2>

            {#if items && items.length > 0}
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 border-b">
                            <tr>
                                <th class="p-3 font-medium">Product / 产品</th>
                                <th class="p-3 font-medium text-right"
                                    >Unit Price / 单价</th
                                >
                                <th class="p-3 font-medium text-center"
                                    >Quantity / 数量</th
                                >
                                <th class="p-3 font-medium text-right"
                                    >Subtotal / 小计</th
                                >
                            </tr>
                        </thead>
                        <tbody>
                            {#each items as item (item.id)}
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="p-3 font-medium">
                                        {item.product_name || "Unknown Product"}
                                    </td>
                                    <td class="p-3 text-right">
                                        ${(item.unit_price ?? 0).toFixed(2)}
                                    </td>
                                    <td class="p-3 text-center">
                                        {item.quantity ?? 0}
                                    </td>
                                    <td class="p-3 text-right font-medium">
                                        ${((item.unit_price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                        <tfoot class="bg-gray-50 font-semibold">
                            <tr>
                                <td colspan="3" class="p-3 text-right"
                                    >Total / 总计:</td
                                >
                                <td class="p-3 text-right text-lg">
                                    ${(order?.total_amount ?? 0).toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            {:else}
                <p class="text-gray-500 text-center py-8">
                    No items in this order / 此订单无商品
                </p>
            {/if}
        </div>

        <!-- 付款记录部分 Payment Section -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-semibold text-gray-800">
                    Payments（付款记录）
                </h2>
                <button
                    type="button"
                    on:click={() => showPaymentForm = !showPaymentForm}
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
                >
                    {showPaymentForm ? 'Cancel（取消）' : '+ Add Payment（添加付款）'}
                </button>
            </div>

            <!-- Error Message -->
            {#if errorMsg}
                <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300 mb-4">
                    ❌ {errorMsg}
                </div>
            {/if}

            <!-- Payment Summary -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                    <p class="text-sm text-gray-600">Total Amount（订单总额）</p>
                    <p class="text-2xl font-bold text-gray-800">
                        ${(order?.total_amount ?? 0).toFixed(2)}
                    </p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Paid（已付）</p>
                    <p class="text-2xl font-bold text-green-600">
                        ${(paidAmount ?? 0).toFixed(2)}
                    </p>
                </div>
                <div>
                    <p class="text-sm text-gray-600">Remaining（欠款）</p>
                    <p class="text-2xl font-bold {(remainingAmount ?? 0) > 0 ? 'text-red-600' : 'text-gray-800'}">
                        ${(remainingAmount ?? 0).toFixed(2)}
                    </p>
                </div>
            </div>

            <!-- Add Payment Form -->
            {#if showPaymentForm}
                <form
                    method="POST"
                    action="?/addPayment"
                    use:enhance
                    class="mb-6 p-4 border rounded-lg bg-blue-50"
                >
                    <h3 class="text-lg font-semibold mb-4">Record New Payment（记录新付款）</h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Payment Type（付款类型）
                            </label>
                            <select
                                name="payment_type"
                                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="deposit">Deposit（定金）</option>
                                <option value="final">Final Payment（尾款）</option>
                                <option value="full" selected>Full Payment（全款）</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Payment Method（付款方式）
                            </label>
                            <select
                                name="payment_method"
                                bind:value={paymentMethod}
                                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="cash">Cash（现金）</option>
                                <option value="eftpos">EFTPOS（刷卡）</option>
                                <option value="transfer">Bank Transfer（银行转账）</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Amount（金额）<span class="text-red-600">*</span>
                            </label>
                            <input
                                type="number"
                                name="amount"
                                step="0.01"
                                min="0"
                                required
                                value={remainingAmount}
                                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {#if paymentMethod === 'transfer'}
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Transfer Reference（转账参考号）
                                </label>
                                <input
                                    type="text"
                                    name="transfer_reference"
                                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        {/if}

                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Notes（备注）
                            </label>
                            <textarea
                                name="payment_notes"
                                rows="2"
                                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>
                    </div>

                    <div class="flex gap-3 mt-4">
                        <button
                            type="submit"
                            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
                        >
                            Record Payment（记录付款）
                        </button>
                        <button
                            type="button"
                            on:click={() => showPaymentForm = false}
                            class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition"
                        >
                            Cancel（取消）
                        </button>
                    </div>
                </form>
            {/if}

            <!-- Payments List -->
            {#if payments && payments.length > 0}
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm">
                        <thead class="bg-gray-50 border-b">
                            <tr>
                                <th class="p-3 font-medium">Date（日期）</th>
                                <th class="p-3 font-medium">Type（类型）</th>
                                <th class="p-3 font-medium">Method（方式）</th>
                                <th class="p-3 font-medium text-right">Amount（金额）</th>
                                <th class="p-3 font-medium">Status（状态）</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each payments as payment (payment.id)}
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="p-3 whitespace-nowrap">
                                        {new Date(payment.payment_date).toLocaleDateString('zh-CN')}
                                    </td>
                                    <td class="p-3 capitalize">{payment.payment_type}</td>
                                    <td class="p-3 capitalize">{payment.payment_method}</td>
                                    <td class="p-3 text-right font-medium text-green-700">
                                        ${(payment.amount ?? 0).toFixed(2)}
                                    </td>
                                    <td class="p-3">
                                        {#if payment.payment_method === 'transfer'}
                                            {#if payment.transfer_verified}
                                                <span class="text-green-700 font-semibold">✓ Verified</span>
                                            {:else}
                                                <span class="text-orange-600 font-semibold">⏳ Pending Verification</span>
                                            {/if}
                                        {:else}
                                            <span class="text-gray-500">—</span>
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {:else}
                <p class="text-gray-500 text-center py-8">
                    No payments recorded yet（尚无付款记录）
                </p>
            {/if}
        </div>
    {/if}
</div>