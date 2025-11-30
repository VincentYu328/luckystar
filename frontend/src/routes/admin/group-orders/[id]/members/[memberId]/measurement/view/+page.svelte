<script>
    export let data;

    const order = data.order;
    const member = data.member;
    const m = data.measurement;

    const fields = [
        { key: 'height', label: 'Height（身高）', unit: 'cm' },
        { key: 'weight', label: 'Weight（体重）', unit: 'kg' },
        { key: 'shoulder_width', label: 'Shoulder Width（肩宽）', unit: 'cm' },
        { key: 'chest', label: 'Chest（胸围）', unit: 'cm' },
        { key: 'waist', label: 'Waist（腰围）', unit: 'cm' },
        { key: 'hip', label: 'Hip（臀围）', unit: 'cm' },
        { key: 'sleeve_length', label: 'Sleeve Length（袖长）', unit: 'cm' },
        { key: 'inseam', label: 'Inseam / Pant Length（裤长）', unit: 'cm' },
        { key: 'notes', label: 'Notes（备注）', type: 'textarea' }
    ];

    function formatValue(value) {
        if (value === null || value === undefined || value === '') {
            return '—';
        }
        return value;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('zh-CN');
    }
</script>

<div class="space-y-8 max-w-4xl p-4">

    <!-- Header -->
    <div>
        <a href="/admin/group-orders/{order.id}" class="text-blue-600 hover:underline text-sm mb-2 inline-block">
            ← Back to Group Order
        </a>
        <h1 class="text-3xl font-semibold tracking-tight">
            Measurement Details — {member.full_name}（量体详情）
        </h1>
        <p class="text-gray-600 mt-2">
            Group Order #{order.id} — {order.group_name}
        </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3">
        <a
            href="/admin/group-orders/{order.id}/members/{member.id}/measurement"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            Edit Measurement（编辑量体）
        </a>
        <a
            href="/admin/group-orders/{order.id}"
            class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
            Back to Order（返回订单）
        </a>
    </div>

    <!-- Measurement Info Card -->
    <div class="bg-white border rounded-lg p-6 space-y-6">

        <!-- Metadata Section -->
        <div class="border-b pb-4">
            <h2 class="text-xl font-semibold mb-3">Measurement Information（量体信息）</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <div class="text-gray-500">Source（来源）</div>
                    <div class="font-medium capitalize">{formatValue(m.source)}</div>
                </div>
                <div>
                    <div class="text-gray-500">Unit（单位）</div>
                    <div class="font-medium">{formatValue(m.unit)}</div>
                </div>
                <div>
                    <div class="text-gray-500">Measured At（测量时间）</div>
                    <div class="font-medium">{formatDate(m.measured_at)}</div>
                </div>
                {#if m.measured_by}
                    <div>
                        <div class="text-gray-500">Measured By（测量人员）</div>
                        <div class="font-medium">Staff ID: {m.measured_by}</div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Body Measurements -->
        <div>
            <h2 class="text-xl font-semibold mb-4">Body Measurements（身体量体数据）</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {#each fields as f}
                    {#if f.type === 'textarea'}
                        <div class="md:col-span-2">
                            <div class="text-sm text-gray-500 mb-1">{f.label}</div>
                            <div class="bg-gray-50 border rounded p-3 min-h-[80px] whitespace-pre-wrap">
                                {formatValue(m[f.key])}
                            </div>
                        </div>
                    {:else}
                        <div>
                            <div class="text-sm text-gray-500 mb-1">{f.label}</div>
                            <div class="bg-gray-50 border rounded p-3 flex items-center justify-between">
                                <span class="font-medium text-lg">
                                    {formatValue(m[f.key])}
                                </span>
                                {#if f.unit && m[f.key]}
                                    <span class="text-gray-500 text-sm ml-2">{f.unit}</span>
                                {/if}
                            </div>
                        </div>
                    {/if}
                {/each}
            </div>
        </div>

    </div>

</div>
