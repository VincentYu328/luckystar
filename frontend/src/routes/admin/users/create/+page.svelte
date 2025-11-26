<script>
    let full_name = '';
    let phone = '';
    let email = '';
    let position_id = '';
    let password = '';

    let address = '';
    let wechat = '';
    let whatsapp = '';

    export let data;
    let errorMsg = '';
</script>

<div class="max-w-xl space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Create User（新增员工）
    </h1>

    {#if errorMsg}
        <div class="bg-red-50 border text-red-700 p-3 rounded">{errorMsg}</div>
    {/if}

    <form method="POST" class="space-y-6">

        <!-- Full Name -->
        <div>
            <label class="block text-sm font-medium">Full Name（姓名）</label>
            <input name="full_name" bind:value={full_name} required class="input" />
        </div>

        <!-- Phone -->
        <div>
            <label class="block text-sm font-medium">Phone（电话）</label>
            <input name="phone" bind:value={phone} required class="input" />
        </div>

        <!-- Email -->
        <div>
            <label class="block text-sm font-medium">Email（邮箱）</label>
            <input name="email" bind:value={email} required class="input" />
        </div>

        <!-- Position -->
        <div>
            <label class="block text-sm font-medium">Position（职位）</label>
            <select name="position_id" bind:value={position_id} required class="input">
                <option value="">Select…（请选择…）</option>
                <option value="1">Head（Admin / 店主）</option>
                <option value="2">Manager（经理）</option>
                <option value="3">Sales（销售员）</option>
            </select>
        </div>

        <!-- Password -->
        <div>
            <label class="block text-sm font-medium">Password（密码）</label>
            <input type="password" name="password" bind:value={password} required class="input" />
        </div>

        <!-- Address -->
        <div>
            <label class="block text-sm font-medium">Address（地址）</label>
            <input name="address" bind:value={address} class="input" />
        </div>

        <!-- WeChat -->
        <div>
            <label class="block text-sm font-medium">WeChat（微信）</label>
            <input name="wechat" bind:value={wechat} class="input" />
        </div>

        <!-- WhatsApp -->
        <div>
            <label class="block text-sm font-medium">WhatsApp（WhatsApp）</label>
            <input name="whatsapp" bind:value={whatsapp} class="input" />
        </div>

        <button class="btn-primary">Create（创建）</button>

    </form>

</div>
