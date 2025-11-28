<!-- frontend/src/routes/admin/group-orders/+page.svelte -->
<script>
    export let data;
    
    // 🔥 使用响应式解构
    $: ({ orders, deleteSuccess, deleteError, createSuccess, updateSuccess } = data);

    const STATUS_LABEL = {
        pending: "Pending / 待处理",
        confirmed: "Confirmed / 已确认",
        in_progress: "In Progress / 进行中",
        completed: "Completed / 已完成",
        cancelled: "Cancelled / 已取消"
    };

    const STATUS_COLOR = {
        pending: "bg-yellow-100 text-yellow-800",
        confirmed: "bg-blue-100 text-blue-800",
        in_progress: "bg-purple-100 text-purple-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800"
    };
</script>

<div class="space-y-8 p-4">

    <!-- 标题和按钮 -->
    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-semibold tracking-tight">
            Group Orders（团体订单）
        </h1>

        
            href="/admin/group-orders/create"
            class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        <a>
            + Create Group Order（创建团体订单）
        </a>
    </div>

    <!-- 成功/错误提示 -->
    {#if createSuccess}
        <div class="p-4 rounded-lg bg-green-100 text-green-800 border border-green-300">
            ✅ Group order created successfully / 团体订单创建成功
        </div>
    {/if}

    {#if updateSuccess}
        <div class="p-4 rounded-lg bg-green-100 text-green-800 border border-green-300">
            ✅ Order updated successfully / 订单更新成功
        </div>
    {/if}

    {#if deleteSuccess}
        <div class="p-4 rounded-lg bg-green-100 text-green-800 border border-green-300">
            ✅ Group order deleted successfully / 团体订单删除成功
        </div>
    {/if}

    {#if deleteError}
        <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            ❌ {deleteError}
        </div>
    {/if}

    <!-- 订单列表 -->
    {#if orders.length === 0}
        <div class="text-center py-12 bg-gray-50 rounded-lg">
            <p class="text-gray-600 text-lg">No group orders yet（暂无团体订单）</p>
            <p class="text-sm text-gray-500 mt-2">Click the button above to create your first group order</p>
        </div>
    {:else}
        <div class="bg-white border rounded-lg overflow-hidden shadow-sm">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="p-3 font-medium">Order #（订单号）</th>
                        <th class="p-3 font-medium">Group Name（团体名称）</th>
                        <th class="p-3 font-medium">Leader（负责人）</th>
                        <th class="p-3 font-medium text-center">Members（成员数）</th>
                        <th class="p-3 font-medium">Status（状态）</th>
                        <th class="p-3 font-medium">Created（创建时间）</th>
                        <th class="p-3 text-right font-medium">Actions（操作）</th>
                    </tr>
                </thead>

                <tbody>
                    {#each orders as o (o.id)}
                        <tr class="border-b hover:bg-gray-50 transition">

                            <!-- 订单号 -->
                            <td class="p-3 font-semibold text-gray-900">
                                #{o.id}
                            </td>

                            <!-- 团体名称 -->
                            <td class="p-3">
                                <div class="font-medium text-gray-900">{o.group_name}</div>
                                {#if o.event_name}
                                    <div class="text-xs text-gray-500 mt-1">{o.event_name}</div>
                                {/if}
                            </td>

                            <!-- 负责人 -->
                            <td class="p-3">
                                <div class="text-gray-900">{o.leader_name || '—'}</div>
                                {#if o.leader_phone}
                                    <div class="text-xs text-gray-500">{o.leader_phone}</div>
                                {/if}
                            </td>

                            <!-- 成员数 -->
                            <td class="p-3 text-center">
                                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-medium">
                                    {o.member_count ?? 0}
                                </span>
                            </td>

                            <!-- 状态 -->
                            <td class="p-3">
                                <span class="px-2 py-1 rounded-full text-xs font-medium {STATUS_COLOR[o.status] || 'bg-gray-100 text-gray-800'}">
                                    {STATUS_LABEL[o.status] ?? o.status}
                                </span>
                            </td>

                            <!-- 创建时间 -->
                            <td class="p-3 whitespace-nowrap text-gray-600">
                                {new Date(o.created_at).toLocaleDateString('zh-CN')}
                            </td>

                            <!-- 操作按钮 -->
                            <td class="p-3">
                                <div class="flex justify-end gap-3">
                                    <a 
                                        href={`/admin/group-orders/${o.id}`}
                                        class="text-blue-600 hover:underline font-medium"
                                    >
                                        View / 查看
                                    </a>

                                    <a 
                                        href={`/admin/group-orders/${o.id}/edit`}
                                        class="text-gray-600 hover:underline"
                                    >
                                        Edit / 编辑
                                    </a>

                                    <form method="POST" action="?/delete" class="inline">
                                        <input type="hidden" name="order_id" value={o.id} />
                                        <button
                                            type="submit"
                                            class="text-red-600 hover:underline font-medium"
                                            on:click={(event) => { 
                                                if (!confirm(`确定要删除团体订单「${o.group_name}」吗？这将同时删除所有相关成员数据。`)) {
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