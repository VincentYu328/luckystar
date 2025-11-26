<script>
    export let data;

    const garments = data.garments;

    let group_name = '';
    let contact_name = '';
    let contact_phone = '';
    let garment_id = '';
    let notes = '';
</script>

<div class="max-w-2xl space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Create Group Order（创建团体订单）
    </h1>

    <form method="POST" class="space-y-6">

        <!-- 团体名 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Group Name（团体名称）
            </label>
            <input
                name="group_name"
                bind:value={group_name}
                required
                class="border rounded p-2 w-full"
                placeholder="e.g., Samoan Church Youth Choir"
            />
        </div>

        <!-- 联系人 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Contact Person（联系人）
            </label>
            <input
                name="contact_name"
                bind:value={contact_name}
                required
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- 联系电话 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Contact Phone（联系电话）
            </label>
            <input
                name="contact_phone"
                bind:value={contact_phone}
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- 主打产品 -->
        <div>
            <label class="block text-sm font-medium mb-1">
                Selected Garment（主打产品）
            </label>

            <select
                name="garment_id"
                bind:value={garment_id}
                required
                class="border rounded p-2 w-full"
            >
                <option value="">Select…（请选择）</option>

                {#each garments as g}
                    <option value={g.id}>
                        {g.sku} — {g.name}
                    </option>
                {/each}
            </select>

            <p class="text-gray-500 text-sm mt-1">
                This will be the default garment for all group members.
                <br />
                将作为所有成员的默认成衣（可单独调整）。
            </p>
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
            name="action"
            value="create"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
            Create（创建）
        </button>

    </form>

</div>
