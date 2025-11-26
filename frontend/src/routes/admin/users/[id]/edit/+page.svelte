<script>
    export let data;
    let u = data.detail;

    let full_name = u.full_name;
    let phone = u.phone;
    let email = u.email;
    let address = u.address;
    let wechat = u.wechat;
    let whatsapp = u.whatsapp;

    let position_id = u.position_id;
    let is_active = u.is_active ? "1" : "0";

    let resultMsg = '';
</script>

<div class="max-w-xl space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Edit User（编辑员工）
    </h1>

    <form method="POST" class="space-y-6">

        <div>
            <label class="block text-sm">Full Name（姓名）</label>
            <input name="full_name" bind:value={full_name} class="input" />
        </div>

        <div>
            <label class="block text-sm">Phone（电话）</label>
            <input name="phone" bind:value={phone} class="input" />
        </div>

        <div>
            <label class="block text-sm">Email（邮箱）</label>
            <input name="email" bind:value={email} class="input" />
        </div>

        <div>
            <label class="block text-sm">Address（地址）</label>
            <input name="address" bind:value={address} class="input" />
        </div>

        <div>
            <label class="block text-sm">WeChat（微信）</label>
            <input name="wechat" bind:value={wechat} class="input" />
        </div>

        <div>
            <label class="block text-sm">WhatsApp（WhatsApp）</label>
            <input name="whatsapp" bind:value={whatsapp} class="input" />
        </div>

        <div>
            <label class="block text-sm">Position（职位）</label>
            <select name="position_id" bind:value={position_id} class="input">
                <option value="1">Head（Admin / 店主）</option>
                <option value="2">Manager（经理）</option>
                <option value="3">Sales（销售员）</option>
            </select>
        </div>

        <div>
            <label class="block text-sm">Status（状态）</label>
            <select name="is_active" bind:value={is_active} class="input">
                <option value="1">Active（启用）</option>
                <option value="0">Disabled（禁用）</option>
            </select>
        </div>

        <button class="btn-primary">Save（保存）</button>

    </form>

</div>
