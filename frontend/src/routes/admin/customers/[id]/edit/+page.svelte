<script>
    export let data;
    let c = data.customer;

    let full_name = c.full_name;
    let phone = c.phone;
    let email = c.email;
    let address = c.address;
    let wechat = c.wechat;
    let whatsapp = c.whatsapp;
    let is_active = c.is_active ? "1" : "0";
</script>

<div class="max-w-xl space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Edit Customer（编辑客户）
    </h1>

    <form method="POST" class="space-y-6">

        <!-- Full Name -->
        <div>
            <label class="block text-sm font-medium">
                Full Name（姓名）
            </label>
            <input
                name="full_name"
                bind:value={full_name}
                required
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- Phone -->
        <div>
            <label class="block text-sm font-medium">
                Phone（电话）
            </label>
            <input
                name="phone"
                bind:value={phone}
                required
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- Email -->
        <div>
            <label class="block text-sm font-medium">
                Email（邮箱）
            </label>
            <input
                name="email"
                type="email"
                bind:value={email}
                required
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- Address -->
        <div>
            <label class="block text-sm font-medium">
                Address（地址）
            </label>
            <input
                name="address"
                bind:value={address}
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- WeChat -->
        <div>
            <label class="block text-sm font-medium">
                WeChat（微信）
            </label>
            <input
                name="wechat"
                bind:value={wechat}
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- WhatsApp -->
        <div>
            <label class="block text-sm font-medium">
                WhatsApp
            </label>
            <input
                name="whatsapp"
                bind:value={whatsapp}
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- Account Status -->
        <div>
            <label class="block text-sm font-medium">
                Account Status（账号状态）
            </label>

            <select
                name="is_active"
                bind:value={is_active}
                class="border rounded p-2 w-full"
            >
                <option value="1">Active（启用）</option>
                <option value="0">Inactive（停用）</option>
            </select>
        </div>

        <button
            type="submit"
            name="action"
            value="save"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
            Save Changes（保存修改）
        </button>

    </form>

</div>
