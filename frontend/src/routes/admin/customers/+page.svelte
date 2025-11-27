<script>
    export let data;

    // 从 load 返回的数据
    let { customers, keyword, deleteSuccess, deleteError } = data;

    // 搜索框绑定（保持和 URL 同步）
    let searchKeyword = keyword;
</script>

<div class="space-y-8 p-4">

    <!-- 标题 + 搜索 + 新建 -->
    <div class="flex justify-between items-center">
        <div class="flex items-center gap-6">
            <h1 class="text-3xl font-semibold tracking-tight">
                Customers（客户管理）
            </h1>

            <!-- 关键：method="get"，SvelteKit 自动客户端导航 + 重新执行 load -->
            <form class="flex gap-2" method="get">
                <input
                    name="keyword"
                    bind:value={searchKeyword}
                    placeholder="搜索姓名 / 电话 / 邮箱..."
                    class="border rounded-lg px-3 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                >
                    Search（搜索）
                </button>
            </form>
        </div>

        <a
            href="/admin/customers/create"
            class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
            + New Customer（新增客户）
        </a>
    </div>

    <!-- 成功 / 错误提示 -->
    {#if deleteSuccess}
        <div class="p-4 rounded-lg bg-green-100 text-green-800 border border-green-300">
            Customer deleted successfully.
        </div>
    {/if}
    {#if deleteError}
        <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            {deleteError}
        </div>
    {/if}

    <!-- 表格 -->
    <div class="bg-white border rounded-lg overflow-hidden shadow-sm">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="px-6 py-3 font-medium">Name（姓名）</th>
                    <th class="px-6 py-3 font-medium">Phone（电话）</th>
                    <th class="px-6 py-3 font-medium">Email（邮箱）</th>
                    <th class="px-6 py-3 font-medium">WeChat</th>
                    <th class="px-6 py-3 font-medium">Created（创建时间）</th>
                    <th class="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each customers as c}
                    <tr class="border-b hover:bg-gray-50 transition">
                        <td class="px-6 py-4 font-medium">{c.full_name}</td>
                        <td class="px-6 py-4">{c.phone}</td>
                        <td class="px-6 py-4">{c.email}</td>
                        <td class="px-6 py-4">{c.wechat || "—"}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {new Date(c.created_at).toLocaleDateString('zh-CN')}
                        </td>

                        <td class="px-6 py-4">
                            <div class="flex justify-end gap-5 items-center">

                                <a href="/admin/customers/{c.id}" class="text-blue-600 hover:underline">
                                    View（查看）
                                </a>

                                <a href="/admin/customers/{c.id}/edit" class="text-gray-600 hover:underline">
                                    Edit（编辑）
                                </a>

                                <!-- 删除表单：最优雅的 confirm 写法 -->
                                <form method="POST" action="?/delete" class="inline">
                                    <input type="hidden" name="customer_id" value={c.id} />
                                    <button
                                        type="submit"
                                        class="text-red-600 hover:underline font-medium"
                                        on:click|preventDefault={() => confirm(`确定要永久删除客户「${c.full_name}」吗？`)}
                                    >
                                        Delete（删除）
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="6" class="text-center py-12 text-gray-500">
                            No customers found.（暂无客户）
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>