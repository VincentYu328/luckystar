<script>
    export let data;
    const measurements = data.measurements;
</script>

<div class="space-y-8">

    <!-- Title -->
    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-semibold tracking-tight">
            Measurements（量体数据）
        </h1>
    </div>

    <!-- Table -->
    <div class="bg-white border rounded-lg overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-3">Customer（客户）</th>
                    <th class="p-3">Gender（性别）</th>
                    <th class="p-3">Updated（更新日期）</th>
                    <th class="p-3"></th>
                </tr>
            </thead>

            <tbody>
                {#each measurements as m}
                    <tr class="border-b hover:bg-gray-50">

                        <td class="p-3 font-medium">
                            {m.customer_name}
                        </td>

                        <td class="p-3">
                            {m.gender || '—'}
                        </td>

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
