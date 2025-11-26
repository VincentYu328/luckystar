<script>
    export let data;

    const order = data.order;
    const fabrics = data.fabrics;

    let member_name = '';
    let member_phone = '';
    let fabric_id = '';
    let notes = '';
</script>

<div class="space-y-10 max-w-2xl">

    <h1 class="text-3xl font-semibold tracking-tight">
        Add Member（新增成员）
    </h1>

    <p class="text-gray-600">
        Group Order #{order.id} — {order.group_name}
    </p>

    <form method="POST" class="space-y-6 bg-white border rounded-lg p-6">

        <!-- 姓名 -->
        <div>
            <label class="block mb-1 font-medium">
                Name（姓名）
            </label>
            <input
                name="member_name"
                bind:value={member_name}
                required
                class="border rounded p-2 w-full"
                placeholder="Enter member name（输入姓名）"
            />
        </div>

        <!-- 电话（可选） -->
        <div>
            <label class="block mb-1 font-medium">
                Phone（电话，可选）
            </label>
            <input
                name="member_phone"
                bind:value={member_phone}
                class="border rounded p-2 w-full"
                placeholder="Enter phone（输入电话）"
            />
        </div>

        <!-- 布料选择 -->
        <div>
            <label class="block mb-1 font-medium">
                Fabric Choice（布料选择，可选）
            </label>
            <select
                name="fabric_id"
                bind:value={fabric_id}
                class="border rounded p-2 w-full"
            >
                <option value="">— None（无） —</option>

                {#each fabrics as f}
                    <option value={f.id}>
                        {f.sku} — {f.name}
                    </option>
                {/each}
            </select>
        </div>

        <!-- 备注 -->
        <div>
            <label class="block mb-1 font-medium">
                Notes（备注）
            </label>
            <textarea
                name="notes"
                bind:value={notes}
                rows="3"
                class="border rounded p-2 w-full"
                placeholder="Optional notes（可选备注）"
            ></textarea>
        </div>

        <button
            type="submit"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            Save Member（保存成员）
        </button>

    </form>

</div>
