<script>
    export let data;

    let name = '';
    let gender = '';
    let category_id = '';
    let notes = '';

    let errorMsg = '';
</script>

<div class="max-w-xl space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Create Size Chart（新增尺码表）
    </h1>

    {#if errorMsg}
        <div class="bg-red-50 border border-red-300 text-red-700 p-3 rounded">
            {errorMsg}
        </div>
    {/if}

    <form method="POST" class="space-y-6">

        <!-- 名称 -->
        <div>
            <label class="block text-sm font-medium">Name（名称）</label>
            <input
                name="name"
                bind:value={name}
                class="border rounded p-2 w-full"
                required
            />
        </div>

        <!-- 性别 -->
        <div>
            <label class="block text-sm font-medium">Gender（性别）</label>
            <select
                name="gender"
                bind:value={gender}
                class="border rounded p-2 w-full"
            >
                <option value="">— 未指定 —</option>
                <option value="men">Men（男）</option>
                <option value="women">Women（女）</option>
                <option value="unisex">Unisex（通用）</option>
                <option value="kids">Kids（儿童）</option>
            </select>
        </div>

        <!-- 分类（可选） -->
        <div>
            <label class="block text-sm font-medium">Category（品类）</label>
            <input
                name="category_id"
                bind:value={category_id}
                type="number"
                placeholder="可选，例如 1 = 衬衫，2 = 裤子"
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- 备注 -->
        <div>
            <label class="block text-sm font-medium">Notes（备注）</label>
            <textarea
                name="notes"
                bind:value={notes}
                rows="3"
                class="border rounded p-2 w-full"
            ></textarea>
        </div>

        <button
            type="submit"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            on:click={() => {
                if (!name.trim()) {
                    errorMsg = "Name is required（名称不能为空）";
                }
            }}
        >
            Create（创建）
        </button>

    </form>

</div>
