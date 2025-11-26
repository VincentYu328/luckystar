<script>
    export let data;

    const chart = data.chart;
    const items = data.items;
</script>

<div class="space-y-8">

    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-semibold tracking-tight">
            Sizes for {chart.name}（尺码数据）
        </h1>

        <a
            href={`/admin/size-charts/${chart.id}/items/create`}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            + Add Size（新增尺码）
        </a>
    </div>

    <div class="bg-white border rounded-lg overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-3">Size（尺码）</th>
                    <th class="p-3">Chest（胸围）</th>
                    <th class="p-3">Waist（腰围）</th>
                    <th class="p-3">Hip（臀围）</th>
                    <th class="p-3">Height（身高）</th>
                    <th class="p-3">Shoulder（肩宽）</th>
                    <th class="p-3">Sleeve（袖长）</th>
                    <th class="p-3">Inseam（裤内长）</th>
                    <th class="p-3">Length（衣长）</th>
                    <th class="p-3">Notes（备注）</th>
                    <th class="p-3"></th>
                </tr>
            </thead>

            <tbody>
                {#each items as item}
                    <tr class="border-b hover:bg-gray-50">

                        <td class="p-3 font-medium">{item.size_label}</td>
                        <td class="p-3">{item.chest ?? '—'}</td>
                        <td class="p-3">{item.waist ?? '—'}</td>
                        <td class="p-3">{item.hip ?? '—'}</td>
                        <td class="p-3">{item.height ?? '—'}</td>
                        <td class="p-3">{item.shoulder ?? '—'}</td>
                        <td class="p-3">{item.sleeve ?? '—'}</td>
                        <td class="p-3">{item.inseam ?? '—'}</td>
                        <td class="p-3">{item.length ?? '—'}</td>
                        <td class="p-3">{item.notes ?? '—'}</td>

                        <td class="p-3 text-right">
                            <a
                                href={`/admin/size-charts/${chart.id}/items/${item.id}`}
                                class="text-blue-600 hover:underline"
                            >
                                Edit（编辑）
                            </a>
                        </td>

                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

</div>
