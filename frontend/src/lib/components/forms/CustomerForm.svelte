<script>
    import { createEventDispatcher } from 'svelte';

    // 父组件传入：编辑模式使用 defaultValues
    export let defaultValues = {};

    const dispatch = createEventDispatcher();

    // ---------------------------------------
    // Customer 数据（与 SQL 字段完全一致）
    // ---------------------------------------
    let customer = {
        full_name: defaultValues.full_name ?? '',
        phone: defaultValues.phone ?? '',
        email: defaultValues.email ?? '',
        address: defaultValues.address ?? '',
        wechat: defaultValues.wechat ?? '',
        whatsapp: defaultValues.whatsapp ?? '',
        password: '',                     // 仅用于创建顾客
        is_active: defaultValues.is_active ?? 1,
        type: defaultValues.type ?? 'retail',
        notes: defaultValues.notes ?? ''
    };

    const isEdit = !!defaultValues.id;

    function submitForm() {
        // 编辑模式下，如果 password 为空，则不发送 password 字段
        const payload = { ...customer };

        if (isEdit && !customer.password) {
            delete payload.password;
        }

        dispatch("submit", payload);
    }
</script>

<div class="space-y-8">

    <h2 class="text-xl font-semibold">
        Customer（顾客）
    </h2>

    <form class="space-y-6" on:submit|preventDefault={submitForm}>

        <!-- 姓名 -->
        <div>
            <label class="form-label">Full Name（姓名）</label>
            <input required class="form-input" bind:value={customer.full_name} />
        </div>

        <!-- 电话 -->
        <div>
            <label class="form-label">Phone（电话）</label>
            <input required class="form-input" bind:value={customer.phone} />
        </div>

        <!-- Email -->
        <div>
            <label class="form-label">Email</label>
            <input required type="email" class="form-input" bind:value={customer.email} />
        </div>

        <!-- Address -->
        <div>
            <label class="form-label">Address（地址）</label>
            <input class="form-input" bind:value={customer.address} />
        </div>

        <!-- WeChat -->
        <div>
            <label class="form-label">WeChat</label>
            <input class="form-input" bind:value={customer.wechat} />
        </div>

        <!-- WhatsApp -->
        <div>
            <label class="form-label">WhatsApp</label>
            <input class="form-input" bind:value={customer.whatsapp} />
        </div>

        <!-- 密码（仅用于创建新用户） -->
        {#if !isEdit}
            <div>
                <label class="form-label">Password（密码）</label>
                <input type="password" class="form-input" bind:value={customer.password} required />
            </div>
        {/if}

        <!-- 账号状态 -->
        <div>
            <label class="form-label">Status（账号状态）</label>
            <select class="form-input" bind:value={customer.is_active}>
                <option value="1">Active（启用）</option>
                <option value="0">Disabled（禁用）</option>
            </select>
        </div>

        <!-- 顾客类型 -->
        <div>
            <label class="form-label">Type（顾客类型）</label>
            <select class="form-input" bind:value={customer.type}>
                <option value="retail">Retail（零售）</option>
                <option value="group">Group（团体）</option>
            </select>
        </div>

        <!-- 备注 -->
        <div>
            <label class="form-label">Notes（备注）</label>
            <textarea class="form-input" rows="3" bind:value={customer.notes}></textarea>
        </div>

        <!-- Submit -->
        <button class="btn-primary">
            {isEdit ? 'Save（保存）' : 'Create（创建）'}
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
