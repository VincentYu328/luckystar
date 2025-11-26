<script>
    export let data;
    const sizeCharts = data.sizeCharts;
</script>

<div class="space-y-8">

    <!-- 标题 + 新建 -->
    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-semibold tracking-tight">
            Size Charts（尺码表）
        </h1>

        <a
            href="/admin/size-charts/create"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            + New Size Chart（新增尺码表）
        </a>
    </div>

    <!-- 列表 -->
    <div class="bg-white border rounded-lg overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-3">Name（名称）</th>
                    <th class="p-3">Gender（性别）</th>
                    <th class="p-3">Category（品类）</th>
                    <th class="p-3">Notes（备注）</th>
                    <th class="p-3"></th>
                </tr>
            </thead>

            <tbody>
                {#if sizeCharts.length === 0}
                    <tr>
                        <td class="p-4 text-gray-500 text-center" colspan="5">
                            No size charts yet（尚无尺码表）
                        </td>
                    </tr>
                {:else}
                    {#each sizeCharts as sc}
                        <tr class="border-b hover:bg-gray-50">

                            <!-- 名称 -->
                            <td class="p-3 font-medium">{sc.name}</td>

                            <!-- 性别 -->
                            <td class="p-3">{sc.gender || '—'}</td>

                            <!-- 品类名称（后端 join 好的） -->
                            <td class="p-3">{sc.category_name || '—'}</td>

                            <!-- 备注 -->
                            <td class="p-3 max-w-md truncate">{sc.notes || '—'}</td>

                            <!-- 操作 -->
                            <td class="p-3 text-right space-x-3 whitespace-nowrap">
                                <a
                                    href={`/admin/size-charts/${sc.id}/edit`}
                                    class="text-blue-600 hover:underline"
                                >
                                    Edit（编辑）
                                </a>

                                <a
                                    href={`/admin/size-charts/${sc.id}/items`}
                                    class="text-gray-600 hover:underline"
                                >
                                    Items（尺码）
                                </a>
                            </td>

                        </tr>
                    {/each}
                {/if}
            </tbody>
        </table>
    </div>

</div>
