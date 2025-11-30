<script>
    export let data;
    export let form;

    const order = data.order;

    // Format date for input field (YYYY-MM-DD)
    function formatDateForInput(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    }

    $: errorMsg = form?.error || '';
</script>

<div class="space-y-8 max-w-4xl p-4">

    <!-- Header -->
    <div>
        <a href="/admin/group-orders/{order.id}" class="text-blue-600 hover:underline text-sm mb-2 inline-block">
            ← Back to Group Order
        </a>
        <h1 class="text-3xl font-semibold tracking-tight">
            Edit Group Order #{order.id}（编辑团体订单）
        </h1>
    </div>

    <!-- Error Message -->
    {#if errorMsg}
        <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            ❌ {errorMsg}
        </div>
    {/if}

    <!-- Edit Form -->
    <form method="POST" class="bg-white border rounded-lg p-6 space-y-6">

        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
            Order Information（订单信息）
        </h2>

        <!-- Group Name (Required) -->
        <div>
            <label for="group_name" class="block mb-2 font-medium">
                Group Name（团体名称）<span class="text-red-600">*</span>
            </label>
            <input
                id="group_name"
                name="group_name"
                type="text"
                required
                value={order.group_name}
                class="w-full border rounded-lg px-4 py-2"
                placeholder="Enter group name"
            />
        </div>

        <!-- Event Name -->
        <div>
            <label for="event_name" class="block mb-2 font-medium">
                Event Name（活动名称）
            </label>
            <input
                id="event_name"
                name="event_name"
                type="text"
                value={order.event_name || ''}
                class="w-full border rounded-lg px-4 py-2"
                placeholder="Enter event name (optional)"
            />
        </div>

        <!-- Expected Members -->
        <div>
            <label for="expected_members" class="block mb-2 font-medium">
                Expected Members（预计成员数）
            </label>
            <input
                id="expected_members"
                name="expected_members"
                type="number"
                min="1"
                value={order.expected_members || ''}
                class="w-full border rounded-lg px-4 py-2"
                placeholder="Enter expected number of members"
            />
        </div>

        <!-- Event Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="event_start" class="block mb-2 font-medium">
                    Event Start Date（活动开始日期）
                </label>
                <input
                    id="event_start"
                    name="event_start"
                    type="date"
                    value={formatDateForInput(order.event_start)}
                    class="w-full border rounded-lg px-4 py-2"
                />
            </div>
            <div>
                <label for="event_end" class="block mb-2 font-medium">
                    Event End Date（活动结束日期）
                </label>
                <input
                    id="event_end"
                    name="event_end"
                    type="date"
                    value={formatDateForInput(order.event_end)}
                    class="w-full border rounded-lg px-4 py-2"
                />
            </div>
        </div>

        <!-- Fabric Selected -->
        <div>
            <label for="fabric_selected" class="block mb-2 font-medium">
                Selected Fabric（选择的布料）
            </label>
            <input
                id="fabric_selected"
                name="fabric_selected"
                type="text"
                value={order.fabric_selected || ''}
                class="w-full border rounded-lg px-4 py-2"
                placeholder="Enter fabric ID or name"
            />
            <p class="text-sm text-gray-500 mt-1">
                Enter the fabric ID or description
            </p>
        </div>

        <!-- Notes -->
        <div>
            <label for="notes" class="block mb-2 font-medium">
                Notes（备注）
            </label>
            <textarea
                id="notes"
                name="notes"
                rows="4"
                class="w-full border rounded-lg px-4 py-2"
                placeholder="Enter any additional notes"
            >{order.notes || ''}</textarea>
        </div>

        <!-- Read-only Information -->
        <div class="border-t pt-4 space-y-2">
            <h3 class="text-sm font-semibold text-gray-700">Read-Only Information（只读信息）</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                    <span class="text-gray-500">Leader Name:</span>
                    <span class="ml-2 font-medium">{order.leader_name || '—'}</span>
                </div>
                {#if order.leader_phone}
                    <div>
                        <span class="text-gray-500">Leader Phone:</span>
                        <span class="ml-2 font-medium">{order.leader_phone}</span>
                    </div>
                {/if}
                {#if order.leader_email}
                    <div>
                        <span class="text-gray-500">Leader Email:</span>
                        <span class="ml-2 font-medium">{order.leader_email}</span>
                    </div>
                {/if}
                <div>
                    <span class="text-gray-500">Created At:</span>
                    <span class="ml-2 font-medium">{new Date(order.created_at).toLocaleString('zh-CN')}</span>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
            <button
                type="submit"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Save Changes（保存修改）
            </button>
            <a
                href="/admin/group-orders/{order.id}"
                class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 inline-flex items-center"
            >
                Cancel（取消）
            </a>
        </div>

    </form>

</div>
