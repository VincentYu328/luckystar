<script>
    export let data;
    export let form;

    const order = data.order;
    const customers = data.customers;

    let addType = 'existing'; // 'existing' or 'manual'
    let customer_id = '';
    let full_name = '';
    let phone = '';
    let email = '';
    let note = '';

    $: errorMsg = form?.error || '';
</script>

<div class="space-y-8 max-w-2xl">

    <div>
        <a href="/admin/group-orders/{order.id}" class="text-blue-600 hover:underline text-sm mb-2 inline-block">
            ← Back to Group Order
        </a>
        <h1 class="text-3xl font-semibold tracking-tight">
            Add Member（新增成员）
        </h1>
        <p class="text-gray-600 mt-2">
            Group Order #{order.id} — {order.group_name}
        </p>
    </div>

    {#if errorMsg}
        <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            ❌ {errorMsg}
        </div>
    {/if}

    <form method="POST" class="space-y-6 bg-white border rounded-lg p-6">

        <!-- 选择添加方式 -->
        <div>
            <label class="block mb-2 font-medium">
                Add Type（添加方式）
            </label>
            <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="add_type"
                        value="existing"
                        bind:group={addType}
                        class="w-4 h-4"
                    />
                    <span>From Existing Customer（从现有客户）</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="add_type"
                        value="manual"
                        bind:group={addType}
                        class="w-4 h-4"
                    />
                    <span>Manual Entry（手动输入）</span>
                </label>
            </div>
        </div>

        {#if addType === 'existing'}
            <!-- 从现有客户选择 -->
            <div>
                <label class="block mb-1 font-medium">
                    Select Customer（选择客户） *
                </label>
                <select
                    name="customer_id"
                    bind:value={customer_id}
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
                <p class="text-sm text-gray-500 mt-1">
                    The member information will be automatically filled from the selected customer.
                </p>
            </div>
        {:else}
            <!-- 手动输入成员信息 -->
            <div>
                <label class="block mb-1 font-medium">
                    Full Name（姓名） *
                </label>
                <input
                    name="full_name"
                    bind:value={full_name}
                    required
                    class="border rounded p-2 w-full"
                    placeholder="Enter member name（输入姓名）"
                />
            </div>

            <div>
                <label class="block mb-1 font-medium">
                    Phone（电话） *
                </label>
                <input
                    name="phone"
                    bind:value={phone}
                    required
                    class="border rounded p-2 w-full"
                    placeholder="Enter phone（输入电话）"
                />
            </div>

            <div>
                <label class="block mb-1 font-medium">
                    Email（邮箱）
                </label>
                <input
                    type="email"
                    name="email"
                    bind:value={email}
                    class="border rounded p-2 w-full"
                    placeholder="Enter email（输入邮箱）"
                />
            </div>
        {/if}

        <!-- 备注（两种方式都可以添加） -->
        <div>
            <label class="block mb-1 font-medium">
                Note（备注）
            </label>
            <textarea
                name="note"
                bind:value={note}
                rows="3"
                class="border rounded p-2 w-full"
                placeholder="Optional notes（可选备注）"
            ></textarea>
        </div>

        <button
            type="submit"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            Add Member（添加成员）
        </button>

    </form>

</div>
