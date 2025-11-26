<script>
    export let data;
    let c = data.chart;

    // 新字段
    let name = c.name;
    let gender = c.gender || '';
    let category_id = c.category_id || '';
    let notes = c.notes || '';

    // 错误提示
    let errorMsg = '';
</script>

<div class="max-w-xl space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Edit Size Chart（编辑尺码表）
    </h1>

    {#if errorMsg}
        <div class="bg-red-50 border p-3 text-red-700 rounded">{errorMsg}</div>
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
                <option value="">—</option>
                <option value="male">Male（男）</option>
                <option value="female">Female（女）</option>
                <option value="unisex">Unisex（通用）</option>
            </select>
        </div>

        <!-- 分类 -->
        <div>
            <label class="block text-sm font-medium">Category（品类）</label>
            <input
                name="category_id"
                bind:value={category_id}
                class="border rounded p-2 w-full"
                placeholder="如：1（布料），2（成衣）"
            />
        </div>

        <!-- 备注 -->
        <div>
            <label class="block text-sm font-medium">Notes（备注）</label>
            <textarea
                name="notes"
                rows="3"
                bind:value={notes}
                class="border rounded p-2 w-full"
            ></textarea>
        </div>

        <button class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save（保存）
        </button>

    </form>

</div>
