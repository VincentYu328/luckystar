<script>
    export let data;

    let full_name = '';
    let phone = '';
    let email = '';
    let address = '';
    let wechat = '';
    let whatsapp = '';

    // 新增字段
    let password = '';
    let confirm_password = '';
    let errorMsg = '';
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

    <form method="POST" class="space-y-6">

        <!-- 姓名 -->
        <div>
            <label class="block mb-1 font-medium">
                Full Name（姓名）
            </label>
            <input
                name="full_name"
                bind:value={full_name}
                class="border rounded p-2 w-full"
                required
            />
        </div>

        <!-- 电话 -->
        <div>
            <label class="block mb-1 font-medium">
                Phone（电话）
            </label>
            <input
                name="phone"
                bind:value={phone}
                class="border rounded p-2 w-full"
                required
            />
        </div>

        <!-- 邮箱 -->
        <div>
            <label class="block mb-1 font-medium">
                Email（邮箱）
            </label>
            <input
                name="email"
                type="email"
                bind:value={email}
                class="border rounded p-2 w-full"
                required
            />
        </div>

        <!-- 地址 -->
        <div>
            <label class="block mb-1 font-medium">
                Address（地址）
            </label>
            <input
                name="address"
                bind:value={address}
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- 微信 -->
        <div>
            <label class="block mb-1 font-medium">
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
            <label class="block mb-1 font-medium">
                WhatsApp
            </label>
            <input
                name="whatsapp"
                bind:value={whatsapp}
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- 密码 -->
        <div>
            <label class="block mb-1 font-medium">
                Password（密码）
            </label>
            <input
                name="password"
                type="password"
                bind:value={password}
                class="border rounded p-2 w-full"
                required
            />
        </div>

        <!-- 确认密码 -->
        <div>
            <label class="block mb-1 font-medium">
                Confirm Password（确认密码）
            </label>
            <input
                name="confirm_password"
                type="password"
                bind:value={confirm_password}
                class="border rounded p-2 w-full"
                required
            />
        </div>

        <button
            type="submit"
            name="action"
            value="create"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            on:click={() => {
                if (password !== confirm_password) {
                    errorMsg = "Password and Confirm Password do not match.";
                }
            }}
        >
            Create（创建）
        </button>

    </form>

</div>
