<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    export let data;

    // 从 load 返回的数据 - 由 SvelteKit 自动更新
    $: ({ customers, keyword, deleteSuccess, deleteError } = data);

    // 本地搜索框状态
    let searchKeyword = "";
    let searchTimeout;
    let mounted = false;

    onMount(() => {
        // 初始化时从 URL 同步搜索关键字
        searchKeyword = keyword || "";
        mounted = true;
    });

    // 🔥 核心：仅在挂载后监听 searchKeyword 变化
    $: if (mounted && searchKeyword !== undefined) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch();
        }, 500); // 使用 500ms 防抖，减少输入干扰
    }

    function performSearch() {
        const trimmed = (searchKeyword || "").trim();
        
        // 🔥 关键：只有当搜索词真正改变时才导航
        if (trimmed !== (keyword || "")) {
            const newUrl = new URL($page.url);
            
            if (trimmed.length > 0) {
                newUrl.searchParams.set('keyword', trimmed);
            } else {
                newUrl.searchParams.delete('keyword');
            }

            goto(newUrl.toString(), { 
                replaceState: true, 
                noScroll: true 
            });
        }
    }

    function handleSearchClick() {
        clearTimeout(searchTimeout);
        performSearch();
    }
</script>

<div class="space-y-8 p-4">

    <!-- 标题 + 搜索 + 新建 -->
    <div class="flex justify-between items-center">
        <div class="flex items-center gap-6">
            <h1 class="text-3xl font-semibold tracking-tight">
                Customers（客户管理）
            </h1>

            <div class="flex gap-2"> 
                <input
                    name="keyword"
                    bind:value={searchKeyword}
                    placeholder="搜索姓名 / 电话 / 邮箱..."
                    class="border rounded-lg px-3 py-2 text-sm w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="button" 
                    on:click={handleSearchClick}
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
                >
                    Search（搜索）
                </button>
            </div>
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
                {#each customers as c (c.id)}
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

                                <form method="POST" action="?/delete" class="inline">
                                    <input type="hidden" name="customer_id" value={c.id} />
                                    <button
                                        type="submit"
                                        class="text-red-600 hover:underline font-medium"
                                        on:click={(event) => { 
                                            if (!confirm(`确定要永久删除客户「${c.full_name}」吗？`)) {
                                                event.preventDefault();
                                            }
                                        }}
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