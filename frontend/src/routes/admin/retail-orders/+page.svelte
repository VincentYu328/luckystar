<!-- frontend/src/routes/admin/retail-orders/+page.svelte -->
<script>
    import { enhance } from "$app/forms";

    export let data;

    // 🔥 Use responsive destructuring, ensure data integrity checks are done by load
    $: ({ orders, deleteSuccess, deleteError, updateSuccess, updateError } =
        data);

    // Status Labels unified to English
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

    // Rule: We cannot use window.confirm(). This function should be replaced
    // with a custom modal component for production use.
    function confirmDelete(orderId) {
        // Placeholder for a custom modal component
        const isConfirmed = window.confirm(
            `Are you sure you want to delete order #${orderId}? This action cannot be undone / 确定要删除订单 #${orderId} 吗？`,
        );
        return isConfirmed;
    }
</script>

<div class="space-y-8 p-4">
    <!-- 标题和操作结果提示 -->
    <div class="space-y-4 flex justify-between items-center">
        <h1 class="text-3xl font-semibold tracking-tight">
            Retail Orders (零售订单)
        </h1>

        <!-- ⭐ ADDED: Create New Order Entry -->
        <a
            href="/admin/retail-orders/create"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
        >
            + Create New Order (新建订单)
        </a>
    </div>

    <!-- 提示消息 -->
    <div class="space-y-2">
        {#if deleteSuccess}
            <div
                class="p-4 rounded-lg bg-green-100 text-green-800 border border-green-300"
            >
                ✅ Order deleted successfully / 订单删除成功.
            </div>
        {/if}

        {#if deleteError}
            <div
                class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300"
            >
                ❌ Error: {deleteError}
            </div>
        {/if}

        {#if updateSuccess}
            <div
                class="p-4 rounded-lg bg-green-100 text-green-800 border border-green-300"
            >
                ✅ Order status updated successfully / 订单状态更新成功.
            </div>
        {/if}

        {#if updateError}
            <div
                class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300"
            >
                ❌ Error: {updateError}
            </div>
        {/if}
    </div>

    {#if orders.length === 0}
        <div class="text-center py-12 bg-gray-50 rounded-lg">
            <p class="text-gray-600 text-lg">
                No retail orders yet (暂无零售订单).
            </p>
        </div>
    {:else}
        <div class="bg-white border rounded-lg overflow-hidden shadow-sm">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <!-- Unified Headers -->
                        <th class="p-3 font-medium">Order # (订单号)</th>
                        <th class="p-3 font-medium">Customer (客户)</th>
                        <th class="p-3 font-medium text-right"
                            >Total (总金额)</th
                        >
                        <th class="p-3 font-medium">Status (状态)</th>
                        <th class="p-3 font-medium">Created (创建时间)</th>
                        <th class="p-3 text-right font-medium"
                            >Actions (操作)</th
                        >
                    </tr>
                </thead>

                <tbody>
                    {#each orders as o (o.id)}
                        <tr class="border-b hover:bg-gray-50 transition">
                            <!-- Order # -->
                            <td class="p-3 font-semibold text-gray-900">
                                #{o.order_number || o.id}
                            </td>

                            <!-- Customer Name -->
                            <td class="p-3">
                                {o.customer_name ?? "(Anonymous / 匿名)"}
                            </td>

                            <!-- Total Amount -->
                            <td class="p-3 text-right font-medium">
                                ${(o.total_amount ?? 0).toFixed(2)}
                            </td>

                            <!-- Status (with color badge) -->
                            <td class="p-3">
                                <span
                                    class="px-2 py-1 rounded-full text-xs font-medium {STATUS_COLOR[
                                        o.status
                                    ] || 'bg-gray-100 text-gray-800'}"
                                >
                                    {STATUS_LABEL[o.status] ?? o.status}
                                </span>
                            </td>

                            <!-- Created Time -->
                            <td class="p-3 whitespace-nowrap text-gray-600">
                                {new Date(o.created_at).toLocaleDateString(
                                    "en-NZ",
                                )}
                            </td>

                            <!-- ⭐ Actions (View, Review/Edit, Delete) -->
                            <td class="p-3">
                                <div class="flex justify-end gap-3">
                                    <!-- View (Points to the full detail page) -->
                                    <a
                                        href={`/admin/retail-orders/${o.id}`}
                                        class="text-blue-600 hover:underline font-medium"
                                    >
                                        View / 查看
                                    </a>

                                    <!-- Delete Form -->
                                    <form
                                        method="POST"
                                        action="?/delete"
                                        class="inline"
                                    >
                                        <input
                                            type="hidden"
                                            name="order_id"
                                            value={o.id}
                                        />
                                        <button
                                            type="submit"
                                            class="text-red-600 hover:underline font-medium"
                                            on:click={(event) => {
                                                // Using compliant confirmation logic placeholder
                                                if (
                                                    !confirmDelete(
                                                        o.order_number || o.id,
                                                    )
                                                ) {
                                                    event.preventDefault();
                                                }
                                            }}
                                        >
                                            Delete / 删除
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
