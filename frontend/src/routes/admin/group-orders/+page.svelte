<script>
    export let data;
    const orders = data.orders;
</script>

<div class="space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Group Orders（团体订单）
    </h1>

    {#if orders.length === 0}
        <p class="text-gray-600">No group orders yet（暂无团体订单）.</p>
    {:else}
        <div class="bg-white border rounded-lg overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="p-3">Order #（订单号）</th>
                        <th class="p-3">Client（客户）</th>
                        <th class="p-3">Members（成员数）</th>
                        <th class="p-3">Status（状态）</th>
                        <th class="p-3">Created（创建时间）</th>
                        <th class="p-3">Actions（操作）</th>
                    </tr>
                </thead>

                <tbody>
                    {#each orders as o}
                        <tr class="border-b hover:bg-gray-50">

                            <td class="p-3 font-semibold">
                                #{o.id}
                            </td>

                            <td class="p-3">
                                {o.group_name}
                            </td>

                            <td class="p-3">
                                {o.member_count}
                            </td>

                            <td class="p-3 capitalize">
                                {o.status}
                            </td>

                            <td class="p-3 whitespace-nowrap">
                                {new Date(o.created_at).toLocaleString()}
                            </td>

                            <td class="p-3">
                                <a 
                                    href={`/admin/group-orders/${o.id}`}
                                    class="text-blue-600 hover:underline"
                                >
                                    View（查看）
                                </a>
                            </td>

                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

    <div class="pt-4">
        <a
            href="/admin/group-orders/create"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            + Create Group Order（创建团体订单）
        </a>
    </div>

</div>
