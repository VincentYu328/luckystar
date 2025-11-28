<!-- frontend\src\routes\admin\inventory\adjust\+page.svelte -->

<!-- frontend/src/routes/admin/inventory/adjust/+page.svelte -->
<script>
    import { enhance } from "$app/forms";

    export let data;
    export let form;

    // ⭐ 类型防御
    const fabrics = Array.isArray(data.fabrics) ? data.fabrics : [];

    let selected = '';
    let newQty = '';
    let note = '';

    // ⭐ 根据选择的布料，安全获取当前信息
    $: current = fabrics.find(f => String(f.fabric_id) === selected) ?? null;
</script>

<div class="space-y-8">

    <h1 class="text-3xl font-semibold">
        Inventory Adjustment（库存盘点）
    </h1>

    <p class="text-gray-600">
        Only <span class="font-semibold text-red-600">Store Head</span>
        can directly modify inventory. Use with caution.
    </p>

    <!-- ⭐ 错误显示（SSR） -->
    {#if form?.error}
    <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        <p class="font-medium">Error</p>
        <p class="text-sm">{form.error}</p>
    </div>
    {/if}

    <!-- ===================================== -->
    <!-- 布料选择器 -->
    <!-- ===================================== -->
    <div>
        <label class="block mb-2 font-medium">Select Fabric（选择布料）</label>
        <select bind:value={selected} class="border rounded p-2 w-full">
            <option value="">— Select（选择） —</option>

            {#each fabrics as f}
                <option value={String(f.fabric_id)}>
                    {f.sku} — {f.fabric_name} (Current: {f.stock_balance})
                </option>
            {/each}
        </select>
    </div>

    <!-- ===================================== -->
    <!-- 调整表单（自动显示） -->
    <!-- ===================================== -->
    {#if current}
    <form
        method="POST"
        action="?/adjust"
        use:enhance
        class="space-y-6 border rounded p-6 bg-white"
    >
        <!-- product_id hidden -->
        <input type="hidden" name="product_id" value={current.fabric_id} />

        <!-- 当前库存 -->
        <div>
            <label class="block mb-1 font-medium">Current Stock（当前库存）</label>
            <div class="text-lg font-semibold">
                {current.stock_balance}
            </div>
        </div>

        <!-- 新库存 -->
        <div>
            <label class="block mb-1 font-medium">New Stock Value（更新后库存）</label>
            <input
                name="new_quantity"
                type="number"
                min="0"
                bind:value={newQty}
                class="border rounded p-2 w-full"
                required
            />
        </div>

        <!-- 备注 -->
        <div>
            <label class="block mb-1 font-medium">Notes（备注）</label>
            <textarea
                name="note"
                bind:value={note}
                class="border rounded p-2 w-full"
                rows="3"
                placeholder="Describe the reason…（说明原因…）"
            ></textarea>
        </div>

        <!-- 提交按钮 -->
        <button
            type="submit"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
            Confirm Adjustment（确认盘点）
        </button>
    </form>
    {/if}
</div>
