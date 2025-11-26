<script>
    export let data;

    // 保留下来的数据
    const customers = data.customers;
    let keyword = data.keyword || '';
</script>

<div class="space-y-8">

    <!-- Title + Search + Create Button -->
    <div class="flex justify-between items-center">

        <div class="flex items-center gap-4">
            <h1 class="text-3xl font-semibold tracking-tight">
                Customers（客户）
            </h1>

            <!-- 搜索框 -->
            <form method="GET" class="flex gap-2">
                <input
                    name="keyword"
                    placeholder="Search customers..."
                    bind:value={keyword}
                    class="border rounded p-2 text-sm w-64"
                />
                <button
                    class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                    Search（搜索）
                </button>
            </form>
        </div>

        <!-- Create Button -->
        <a
            href="/admin/customers/create"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            + New Customer（新增客户）
        </a>
    </div>

    <!-- Table -->
    <div class="bg-white border rounded-lg overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-3">Name（姓名）</th>
                    <th class="p-3">Phone（电话）</th>
                    <th class="p-3">Email（邮箱）</th>
                    <th class="p-3">WeChat</th>
                    <th class="p-3">Created（创建时间）</th>
                    <th class="p-3"></th>
                </tr>
            </thead>

            <tbody>
                {#each customers as c}
                    <tr class="border-b hover:bg-gray-50">

                        <td class="p-3 font-medium">{c.full_name}</td>
                        <td class="p-3">{c.phone}</td>
                        <td class="p-3">{c.email}</td>
                        <td class="p-3">{c.wechat || '—'}</td>

                        <td class="p-3 whitespace-nowrap">
                            {new Date(c.created_at).toLocaleDateString()}
                        </td>

                        <td class="p-3 text-right">

                            <a
                                href={`/admin/customers/${c.id}`}
                                class="text-blue-600 hover:underline mr-4"
                            >
                                View（查看）
                            </a>

                            <a
                                href={`/admin/customers/${c.id}/edit`}
                                class="text-gray-600 hover:underline"
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
