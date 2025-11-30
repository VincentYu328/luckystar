<script>
    export let data;
    export let form;

    let chartName = data.chart.name;
    let gender = data.chart.gender || '';
    let notes = data.chart.notes || '';

    // 初始化 items（如果没有则添加一个空行）
    let items = data.items.length > 0
        ? data.items.map(item => ({
            id: item.id,
            size_label: item.size_label || '',
            chest: item.chest || '',
            waist: item.waist || '',
            hip: item.hip || '',
            height: item.height || ''
        }))
        : [{ id: null, size_label: '', chest: '', waist: '', hip: '', height: '' }];

    function addItem() {
        items = [...items, { id: null, size_label: '', chest: '', waist: '', hip: '', height: '' }];
    }

    function removeItem(index) {
        items = items.filter((_, i) => i !== index);
    }

    $: errorMsg = form?.error || '';

    let showDeleteConfirm = false;
</script>

<div class="max-w-4xl space-y-8">

    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-semibold tracking-tight">
            Edit Size Chart（编辑尺码表）
        </h1>
        <a href="/admin/size-charts" class="text-gray-600 hover:underline">
            ← Back to List
        </a>
    </div>

    {#if errorMsg}
        <div class="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg">
            ❌ {errorMsg}
        </div>
    {/if}

    <!-- 说明 -->
    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p class="text-blue-800 text-sm">
            <strong>📋 Instructions:</strong> Edit the size chart information and measurements.
            Changes will be reflected on the public <a href="/size-guide" target="_blank" class="underline">Size Guide</a> page.
        </p>
    </div>

    <form method="POST" action="?/update" class="space-y-8">

        <!-- Chart 基本信息 -->
        <div class="bg-white border rounded-lg p-6 space-y-6">
            <h2 class="text-xl font-semibold">Chart Information（尺码表信息）</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- 名称 -->
                <div>
                    <label class="block text-sm font-medium mb-2">Chart Name（表名）*</label>
                    <input
                        name="name"
                        bind:value={chartName}
                        placeholder="e.g., Men Standard Sizes"
                        class="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <!-- 性别 -->
                <div>
                    <label class="block text-sm font-medium mb-2">Gender（性别）</label>
                    <select
                        name="gender"
                        bind:value={gender}
                        class="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">— Not specified —</option>
                        <option value="men">Men（男）</option>
                        <option value="women">Women（女）</option>
                        <option value="boys">Boys（男童）</option>
                        <option value="girls">Girls（女童）</option>
                        <option value="unisex">Unisex（通用）</option>
                    </select>
                </div>
            </div>

            <!-- 备注 -->
            <div>
                <label class="block text-sm font-medium mb-2">Notes（备注）</label>
                <textarea
                    name="notes"
                    bind:value={notes}
                    rows="2"
                    placeholder="e.g., Measurements in centimetres"
                    class="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500"
                ></textarea>
            </div>
        </div>

        <!-- Size Items -->
        <div class="bg-white border rounded-lg p-6 space-y-6">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-semibold">Size Measurements（尺码数据）</h2>
                <button
                    type="button"
                    on:click={addItem}
                    class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
                >
                    + Add Size Row
                </button>
            </div>

            <p class="text-sm text-gray-600">
                Add measurements for each size (all measurements in centimetres).
            </p>

            <!-- Items Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse">
                    <thead>
                        <tr class="bg-gray-50 border-b">
                            <th class="p-3 text-left font-medium">Size*</th>
                            <th class="p-3 text-left font-medium">Chest (cm)</th>
                            <th class="p-3 text-left font-medium">Waist (cm)</th>
                            <th class="p-3 text-left font-medium">Hip (cm)</th>
                            <th class="p-3 text-left font-medium">Height (cm)</th>
                            <th class="p-3 text-center font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each items as item, index}
                            <tr class="border-b hover:bg-gray-50">
                                <td class="p-3">
                                    <!-- Hidden field for item ID -->
                                    <input type="hidden" name="items[{index}].id" value={item.id || ''} />
                                    <input
                                        type="text"
                                        name="items[{index}].size_label"
                                        bind:value={item.size_label}
                                        placeholder="S, M, L..."
                                        class="border rounded p-2 w-20 focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </td>
                                <td class="p-3">
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="items[{index}].chest"
                                        bind:value={item.chest}
                                        placeholder="92"
                                        class="border rounded p-2 w-24 focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>
                                <td class="p-3">
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="items[{index}].waist"
                                        bind:value={item.waist}
                                        placeholder="80"
                                        class="border rounded p-2 w-24 focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>
                                <td class="p-3">
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="items[{index}].hip"
                                        bind:value={item.hip}
                                        placeholder="94"
                                        class="border rounded p-2 w-24 focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>
                                <td class="p-3">
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="items[{index}].height"
                                        bind:value={item.height}
                                        placeholder="165"
                                        class="border rounded p-2 w-24 focus:ring-2 focus:ring-blue-500"
                                    />
                                </td>
                                <td class="p-3 text-center">
                                    {#if items.length > 1}
                                        <button
                                            type="button"
                                            on:click={() => removeItem(index)}
                                            class="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Remove
                                        </button>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 justify-between">
            <div class="flex gap-3">
                <button
                    type="submit"
                    class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
                >
                    Save Changes（保存修改）
                </button>
                <a
                    href="/admin/size-charts"
                    class="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                    Cancel
                </a>
            </div>

            <button
                type="button"
                on:click={() => showDeleteConfirm = true}
                class="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
            >
                Delete Size Chart
            </button>
        </div>

    </form>

</div>

<!-- Delete Confirmation Dialog -->
{#if showDeleteConfirm}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 class="text-xl font-bold text-gray-900">Delete Size Chart?</h2>

            <p class="text-gray-700">
                Are you sure you want to delete this size chart? This action cannot be undone and will remove all associated size measurements.
            </p>

            <div class="flex gap-3 pt-4">
                <form method="POST" action="?/delete" class="flex-1">
                    <button
                        type="submit"
                        class="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium transition"
                    >
                        Yes, Delete
                    </button>
                </form>
                <button
                    on:click={() => showDeleteConfirm = false}
                    class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium transition"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
{/if}
