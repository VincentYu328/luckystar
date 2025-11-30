<script>
    import { enhance } from "$app/forms";

    export let data;
    export let form;

    // 使用 form?.values 来保持输入值 (回显)
    let values = form?.values || data.values || {};
    let errorMsg = form?.error || data.error || '';

    let full_name = values.full_name || '';
    let phone = values.phone || '';
    let email = values.email || '';
    let address = values.address || '';
    let wechat = values.wechat || '';
    let whatsapp = values.whatsapp || '';

    let password = '';
    let confirm_password = '';
</script>

<div class="max-w-xl space-y-8">

    <h1 class="text-2xl font-semibold tracking-tight">
        Create Customer（新增客户）
    </h1>

    {#if errorMsg}
        <div class="bg-red-50 text-red-700 p-3 rounded border">
            {errorMsg}
        </div>
    {/if}

    <form method="POST" class="space-y-6" use:enhance>

        <div>
            <label for="full_name" class="block mb-1 font-medium">Full Name（姓名）</label>
            <input name="full_name" id="full_name" bind:value={full_name}
                   class="border rounded p-2 w-full" required />
        </div>

        <div>
            <label for="phone" class="block mb-1 font-medium">Phone（电话）</label>
            <input name="phone" id="phone" bind:value={phone}
                   class="border rounded p-2 w-full" required />
        </div>

        <div>
            <label for="email" class="block mb-1 font-medium">Email（邮箱）</label>
            <input name="email" id="email" type="email" bind:value={email}
                   class="border rounded p-2 w-full" required />
        </div>

        <div>
            <label for="address" class="block mb-1 font-medium">Address（地址）</label>
            <input name="address" id="address" bind:value={address}
                   class="border rounded p-2 w-full" />
        </div>

        <div>
            <label for="wechat" class="block mb-1 font-medium">WeChat（微信）</label>
            <input name="wechat" id="wechat" bind:value={wechat}
                   class="border rounded p-2 w-full" />
        </div>

        <div>
            <label for="whatsapp" class="block mb-1 font-medium">WhatsApp</label>
            <input name="whatsapp" id="whatsapp" bind:value={whatsapp}
                   class="border rounded p-2 w-full" />
        </div>

        <div>
            <label for="password" class="block mb-1 font-medium">Password（密码）</label>
            <input name="password" id="password" type="password" bind:value={password}
                   class="border rounded p-2 w-full" required />
        </div>

        <div>
            <label for="confirm_password" class="block mb-1 font-medium">Confirm Password（确认密码）</label>
            <input name="confirm_password" id="confirm_password" type="password"
                   bind:value={confirm_password}
                   class="border rounded p-2 w-full" required />
        </div>

        <button
            type="submit"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
            Create（创建）
        </button>

    </form>
</div>