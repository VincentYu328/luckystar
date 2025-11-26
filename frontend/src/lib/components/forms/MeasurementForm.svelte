<script>
    import { createEventDispatcher } from 'svelte';

    export let customer_id = null;       // 单独客户
    export let group_member_id = null;   // 团体成员
    export let unit = 'cm';              // 默认单位 cm
    export let defaultValues = {};       // 用于编辑模式，或预填

    const dispatch = createEventDispatcher();

    let form = {
        height: defaultValues.height ?? '',
        chest: defaultValues.chest ?? '',
        waist: defaultValues.waist ?? '',
        hip: defaultValues.hip ?? '',
        shoulder_width: defaultValues.shoulder_width ?? '',
        sleeve_length: defaultValues.sleeve_length ?? '',
        inseam: defaultValues.inseam ?? '',
        notes: defaultValues.notes ?? '',
        unit,
        source: 'staff',
    };

    function submitForm() {
        const payload = {
            ...form,
            customer_id,
            group_member_id
        };

        dispatch('submit', payload);
    }
</script>

<div class="space-y-8">

    <h2 class="text-xl font-semibold">
        Measurement Form（量体记录表）
    </h2>

    <form class="space-y-6" on:submit|preventDefault={submitForm}>

        <!-- ========== BASIC BODY MEASUREMENTS 基础量体 ========== -->
        <div class="grid grid-cols-2 gap-6">

            <div>
                <label class="form-label">Height（身高 cm）</label>
                <input type="number" step="0.1"
                    class="form-input"
                    bind:value={form.height} />
            </div>

            <div>
                <label class="form-label">Chest（胸围 cm）</label>
                <input type="number" step="0.1"
                    class="form-input"
                    bind:value={form.chest} />
            </div>

            <div>
                <label class="form-label">Waist（腰围 cm）</label>
                <input type="number" step="0.1"
                    class="form-input"
                    bind:value={form.waist} />
            </div>

            <div>
                <label class="form-label">Hip（臀围 cm）</label>
                <input type="number" step="0.1"
                    class="form-input"
                    bind:value={form.hip} />
            </div>

            <div>
                <label class="form-label">Shoulder Width（肩宽 cm）</label>
                <input type="number" step="0.1"
                    class="form-input"
                    bind:value={form.shoulder_width} />
            </div>

            <div>
                <label class="form-label">Sleeve Length（袖长 cm）</label>
                <input type="number" step="0.1"
                    class="form-input"
                    bind:value={form.sleeve_length} />
            </div>

            <div>
                <label class="form-label">Inseam（内长 cm）</label>
                <input type="number" step="0.1"
                    class="form-input"
                    bind:value={form.inseam} />
            </div>

        </div>

        <!-- ========== Notes 备注 ========== -->
        <div>
            <label class="form-label">Notes（备注）</label>
            <textarea rows="3" class="form-input" bind:value={form.notes}></textarea>
        </div>

        <!-- ========== Submit ========== -->
        <button class="btn-primary mt-4">
            Save Measurement（保存量体记录）
        </button>

    </form>
</div>

<style>
    .form-label {
        @apply block text-sm font-medium mb-1;
    }
    .form-input {
        @apply w-full border rounded px-3 py-2 text-sm;
    }
    .btn-primary {
        @apply bg-blue-600 text-white px-4 py-2 rounded shadow;
    }
</style>
