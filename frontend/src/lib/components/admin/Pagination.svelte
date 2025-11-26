<script>
    export let page = 1;          // 当前页
    export let pageSize = 10;     // 每页条数
    export let total = 0;         // 总条目数
    export let onChange = () => {}; // 页码改变事件

    const totalPages = $: Math.max(1, Math.ceil(total / pageSize));

    function go(newPage) {
        if (newPage < 1 || newPage > totalPages) return;
        onChange(newPage);
    }
</script>

{#if total > 0}
<div class="flex items-center justify-between py-4 text-sm select-none">

    <!-- 左侧：总数 -->
    <div class="text-gray-600">
        Total: {total} items（共 {total} 条）
    </div>

    <!-- 右侧：分页按钮 -->
    <div class="flex items-center space-x-1">

        <!-- First -->
        <button
            class="px-2 py-1 border rounded disabled:opacity-40"
            on:click={() => go(1)}
            disabled={page === 1}
        >
            « First
        </button>

        <!-- Prev -->
        <button
            class="px-2 py-1 border rounded disabled:opacity-40"
            on:click={() => go(page - 1)}
            disabled={page === 1}
        >
            ‹ Prev
        </button>

        <!-- 中间：页码显示 -->
        <span class="px-3">
            Page {page} / {totalPages}（第 {page} 页 / 共 {totalPages} 页）
        </span>

        <!-- Next -->
        <button
            class="px-2 py-1 border rounded disabled:opacity-40"
            on:click={() => go(page + 1)}
            disabled={page === totalPages}
        >
            Next ›
        </button>

        <!-- Last -->
        <button
            class="px-2 py-1 border rounded disabled:opacity-40"
            on:click={() => go(totalPages)}
            disabled={page === totalPages}
        >
            Last »
        </button>
    </div>
</div>
{/if}
