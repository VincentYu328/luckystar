<script>
    export let data;
    const logs = data.logs;
</script>

<div class="space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Audit Logs（系统审计日志）
    </h1>

    <div class="bg-white border rounded-lg overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-3">User（用户）</th>
                    <th class="p-3">Action（动作）</th>
                    <th class="p-3">Target（目标）</th>
                    <th class="p-3">Details（详情）</th>
                    <th class="p-3">Time（时间）</th>
                </tr>
            </thead>

            <tbody>
                {#each logs as log}
                    <tr class="border-b hover:bg-gray-50">

                        <td class="p-3">
                            {log.user_name ?? 'System'}
                        </td>

                        <td class="p-3">{log.action}</td>

                        <td class="p-3">
                            {log.target_type} #{log.target_id}
                        </td>

                        <td class="p-3 max-w-md truncate" title={log.details}>
                            {log.details || '—'}
                        </td>

                        <td class="p-3 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                        </td>

                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

</div>
