<script>
    export let data;
    export let form;

    const customers = data.customers ?? [];
    const fabrics = data.fabrics ?? [];

    let leader_id = '';
    let group_name = '';
    let event_name = '';
    let expected_members = '';
    let fabric_selected = '';
    let event_start = '';
    let event_end = '';
    let notes = '';

    $: errorMsg = form?.error || '';
</script>

<div class="max-w-2xl space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Create Group Order（创建团体订单）
    </h1>

    {#if errorMsg}
        <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            ❌ {errorMsg}
        </div>
    {/if}

    <form method="POST" class="space-y-6">

        <!-- 选择负责人 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Group Leader（团体负责人） *
            </label>
            <select
                name="leader_id"
                bind:value={leader_id}
                required
                class="border rounded p-2 w-full"
            >
                <option value="">Select a customer...（选择客户）</option>
                {#each customers as c}
                    <option value={c.id}>
                        {c.full_name} - {c.phone} ({c.email})
                    </option>
                {/each}
            </select>
            <p class="text-gray-500 text-sm mt-1">
                The customer who will be the main contact for this group order.
            </p>
        </div>

        <!-- 团体名 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Group Name（团体名称） *
            </label>
            <input
                name="group_name"
                bind:value={group_name}
                required
                class="border rounded p-2 w-full"
                placeholder="e.g., Samoan Church Youth Choir"
            />
        </div>

        <!-- 活动名称 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Event Name（活动名称）
            </label>
            <input
                name="event_name"
                bind:value={event_name}
                class="border rounded p-2 w-full"
                placeholder="e.g., Annual Concert"
            />
        </div>

        <!-- 预计成员数 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Expected Members（预计成员数）
            </label>
            <input
                type="number"
                name="expected_members"
                bind:value={expected_members}
                class="border rounded p-2 w-full"
                min="1"
                placeholder="e.g., 30"
            />
        </div>

        <!-- 选择布料 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Selected Fabric（选择布料）
            </label>
            <select
                name="fabric_selected"
                bind:value={fabric_selected}
                class="border rounded p-2 w-full"
            >
                <option value="">Select fabric...（选择布料）</option>
                {#each fabrics as f}
                    <option value={f.id}>
                        {f.sku} — {f.name}
                    </option>
                {/each}
            </select>
            <p class="text-gray-500 text-sm mt-1">
                The fabric that will be used for this group order.
            </p>
        </div>

        <!-- 活动开始日期 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Event Start Date（活动开始日期）
            </label>
            <input
                type="date"
                name="event_start"
                bind:value={event_start}
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- 活动结束日期 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Event End Date（活动结束日期）
            </label>
            <input
                type="date"
                name="event_end"
                bind:value={event_end}
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- Notes -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Notes（备注）
            </label>
            <textarea
                name="notes"
                bind:value={notes}
                class="border rounded p-2 w-full"
                rows="3"
            ></textarea>
        </div>

        <button
            type="submit"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
            Create（创建）
        </button>

    </form>

</div>
