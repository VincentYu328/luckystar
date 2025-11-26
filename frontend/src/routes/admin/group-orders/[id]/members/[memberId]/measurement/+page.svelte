<script>
    export let data;

    const order = data.order;
    const member = data.member;
    const m = data.measurement;

    // 所有 measurement 字段（可自由扩展）
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
</script>

<div class="space-y-10 max-w-3xl">

    <h1 class="text-3xl font-semibold tracking-tight">
        Measurement — {member.member_name}（量体）
    </h1>

    <p class="text-gray-600 mb-4">
        Group Order #{order.id} — {order.group_name}
    </p>

    <form method="POST" class="space-y-8 bg-white border rounded-lg p-6">

        <h2 class="text-xl font-semibold mb-3">
            Body Measurements（身体量体数据）
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

            {#each fields as f}
                <!-- 备注 textarea 独占整行 -->
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
                                type="numb
