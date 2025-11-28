<!-- frontend/src/routes/admin/audit/+page.svelte -->
<script>
    export let data;
    
    // 🔥 使用响应式解构
    $: ({ logs, error } = data);

    // 动作的中英文映射
    const ACTION_LABELS = {
        'user_created': 'User Created / 创建用户',
        'user_updated': 'User Updated / 更新用户',
        'user_deleted': 'User Deleted / 删除用户',
        'customer_created': 'Customer Created / 创建客户',
        'customer_updated': 'Customer Updated / 更新客户',
        'customer_deleted': 'Customer Deleted / 删除客户',
        'order_created': 'Order Created / 创建订单',
        'order_updated': 'Order Updated / 更新订单',
        'payment_created': 'Payment Created / 创建付款',
        'login': 'Login / 登录',
        'logout': 'Logout / 登出'
    };

    // 格式化详情 JSON
    function formatDetails(details) {
        if (!details) return '—';
        try {
            const parsed = typeof details === 'string' ? JSON.parse(details) : details;
            return JSON.stringify(parsed, null, 2);
        } catch {
            return String(details);
        }
    }
</script>

<div class="space-y-8 p-4">

    <h1 class="text-3xl font-semibold tracking-tight">
        Audit Logs（系统审计日志）
    </h1>

    <!-- 错误提示 -->
    {#if error}
        <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            ❌ {error}
        </div>
    {/if}

    <!-- 审计日志列表 -->
    {#if logs.length === 0}
        <div class="text-center py-12 bg-gray-50 rounded-lg">
            <p class="text-gray-600">No audit logs yet（暂无审计日志）</p>
        </div>
    {:else}
        <div class="bg-white border rounded-lg overflow-hidden shadow-sm">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="p-3 font-medium">User（用户）</th>
                        <th class="p-3 font-medium">Action（动作）</th>
                        <th class="p-3 font-medium">Target（目标）</th>
                        <th class="p-3 font-medium">Details（详情）</th>
                        <th class="p-3 font-medium">Time（时间）</th>
                    </tr>
                </thead>

                <tbody>
                    {#each logs as log (log.id)}
                        <tr class="border-b hover:bg-gray-50 transition">

                            <!-- 用户名 -->
                            <td class="p-3 font-medium text-gray-900">
                                {log.user_name ?? log.full_name ?? 'System'}
                            </td>

                            <!-- 动作 -->
                            <td class="p-3">
                                <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                    {ACTION_LABELS[log.action] ?? log.action}
                                </span>
                            </td>

                            <!-- 目标 -->
                            <td class="p-3 text-gray-700">
                                {#if log.target_type && log.target_id}
                                    <span class="capitalize">{log.target_type}</span> #{log.target_id}
                                {:else}
                                    —
                                {/if}
                            </td>

                            <!-- 详情 -->
                            <td class="p-3">
                                {#if log.details}
                                    <details class="cursor-pointer">
                                        <summary class="text-blue-600 hover:underline text-xs">
                                            View Details / 查看详情
                                        </summary>
                                        <pre class="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-w-md">{formatDetails(log.details)}</pre>
                                    </details>
                                {:else}
                                    <span class="text-gray-400">—</span>
                                {/if}
                            </td>

                            <!-- 时间 -->
                            <td class="p-3 whitespace-nowrap text-gray-600">
                                {new Date(log.created_at).toLocaleString('zh-CN')}
                            </td>

                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

</div>