<script>
    export let data;
    export let form;

    const order = data.order;
    const member = data.member;
    const m = data.measurement;

    const fields = [
        { key: 'height', label: 'Height（身高）', unit: 'cm' },
        { key: 'weight', label: 'Weight（体重）', unit: 'kg' },
        { key: 'shoulder', label: 'Shoulder Width（肩宽）', unit: 'cm' },
        { key: 'chest', label: 'Chest（胸围）', unit: 'cm' },
        { key: 'waist', label: 'Waist（腰围）', unit: 'cm' },
        { key: 'hip', label: 'Hip（臀围）', unit: 'cm' },
        { key: 'sleeve', label: 'Sleeve Length（袖长）', unit: 'cm' },
        { key: 'pant_length', label: 'Pant Length（裤长）', unit: 'cm' },
        { key: 'thigh', label: 'Thigh（大腿围）', unit: 'cm' },
        { key: 'notes', label: 'Notes（备注）', type: 'textarea' }
    ];

    $: errorMsg = form?.error || '';
</script>

<div class="space-y-8 max-w-3xl">

    <div>
        <a href="/admin/group-orders/{order.id}" class="text-blue-600 hover:underline text-sm mb-2 inline-block">
            ← Back to Group Order
        </a>
        <h1 class="text-3xl font-semibold tracking-tight">
            Measurement — {member.full_name}（量体）
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

    <form method="POST" class="space-y-8 bg-white border rounded-lg p-6">

        <h2 class="text-xl font-semibold mb-3">
            Body Measurements（身体量体数据）
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            {#each fields as f}
                {#if f.type === 'textarea'}
                    <div class="md:col-span-2">
                        <label class="block mb-1 font-medium">{f.label}</label>
                        <textarea
                            name={f.key}
                            class="border rounded p-2 w-full"
                            rows="4"
                        >{m[f.key] ?? ''}</textarea>
                    </div>
                {:else}
                    <div>
                        <label class="block mb-1 font-medium">{f.label}</label>
                        <div class="flex items-center gap-2">
                            <input
                                name={f.key}
                                type="number"
                                step="0.1"
                                value={m[f.key] ?? ''}
                                class="border rounded p-2 w-full"
                                placeholder="Enter {f.label.toLowerCase()}"
                            />
                            {#if f.unit}
                                <span class="text-gray-500 text-sm">{f.unit}</span>
                            {/if}
                        </div>
                    </div>
                {/if}
            {/each}

        </div>

        <div class="flex gap-3">
            <button
                type="submit"
                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Save Measurement（保存量体）
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
