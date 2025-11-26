<script>
    export let data;

    const customer = data.customer;
    const measurements = data.measurements;
</script>

<div class="space-y-8">

    <!-- 标题 -->
    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-semibold tracking-tight">
            Measurements for {customer.full_name}（量体记录）
        </h1>

        <a
            href={`/admin/measurements/create?customer_id=${customer.id}`}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            + New Measurement（新增量体）
        </a>
    </div>

    <!-- 客户基本信息 -->
    <div class="p-4 border rounded-lg bg-white space-y-1">
        <div class="text-lg font-medium">{customer.full_name}</div>
        <div class="text-sm text-gray-600">{customer.phone}</div>
        <div class="text-sm text-gray-600">{customer.email}</div>
    </div>

    <!-- 量体记录列表 -->
    <div class="bg-white border rounded-lg overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-3">Gender（性别）</th>
                    <th class="p-3">Height（身高）</th>
                    <th class="p-3">Chest（胸围）</th>
                    <th class="p-3">Waist（腰围）</th>
                    <th class="p-3">Updated（更新时间）</th>
                    <th class="p-3"></th>
                </tr>
            </thead>

            <tbody>
                {#each measurements as m}
                    <tr class="border-b hover:bg-gray-50">

                        <td class="p-3">{m.gender || '—'}</td>
                        <td class="p-3">{m.height || '—'}</td>
                        <td class="p-3">{m.chest || '—'}</td>
                        <td class="p-3">{m.waist || '—'}</td>

                        <td class="p-3 whitespace-nowrap">
                            {new Date(m.updated_at).toLocaleDateString()}
                        </td>

                        <td class="p-3 text-right">
                            <a
                                href={`/admin/measurements/${m.id}`}
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

</div>
