<script>
    export let data;

    const order = data.order;
    const members = data.members;
</script>

<div class="space-y-10 max-w-4xl">

    <h1 class="text-3xl font-semibold tracking-tight">
        Group Members（团体成员）
    </h1>

    <p class="text-gray-600">
        Group Order #{order.id} — {order.group_name}
    </p>

    <!-- ========================= -->
    <!-- Add Member Button -->
    <!-- ========================= -->
    <div class="flex justify-end">
        <a
            href={`/admin/group-orders/${order.id}/members/add`}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            + Add Member（新增成员）
        </a>
    </div>

    <!-- ========================= -->
    <!-- Members List -->
    <!-- ========================= -->
    <div class="bg-white border rounded-lg overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-3">Name（姓名）</th>
                    <th class="p-3">Phone（电话）</th>
                    <th class="p-3">Fabric（布料）</th>
                    <th class="p-3">Measurements（量体）</th>
                    <th class="p-3">Actions（操作）</th>
                </tr>
            </thead>

            <tbody>
                {#if members.length === 0}
                    <tr>
                        <td colspan="5" class="p-4 text-gray-500 text-center">
                            No members yet.（暂无成员）
                        </td>
                    </tr>
                {:else}
                    {#each members as m}
                        <tr class="border-b hover:bg-gray-50">

                            <!-- 姓名 -->
                            <td class="p-3 font-medium">
                                {m.member_name}
                            </td>

                            <!-- 电话 -->
                            <td class="p-3">{m.member_phone || '—'}</td>

                            <!-- 布料选项 -->
                            <td class="p-3">
                                {m.fabric_sku
                                    ? `${m.fabric_sku} — ${m.fabric_name}`
                                    : '—'}
                            </td>

                            <!-- 是否已录入量体 -->
                            <td class="p-3">
                                {m.has_measurement
                                    ? '✔ Entered（已录入）'
                                    : '— Not Entered（未录入）'}
                            </td>

                            <!-- 操作 -->
                            <td class="p-3 space-x-4 whitespace-nowrap">

                                <a
                                    href={`/admin/group-orders/${order.id}/members/${m.id}/edit`}
                                    class="text-blue-600 hover:underline"
                                >
                                    Edit（编辑）
                                </a>

                                <a
                                    href={`/admin/group-orders/${order.id}/members/${m.id}/measurement`}
                                    class="text-green-700 hover:underline"
                                >
                                    Measurement（量体）
                                </a>

                            </td>

                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>
</div>
