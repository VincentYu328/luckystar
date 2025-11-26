<script>
    export let data;

    const p = data.payment;
    let errorMsg = '';

    function confirmVerify(event) {
        const ok = confirm(
            "请确认该银行转账已到账。\n\n确认后不可撤销。\n\n是否继续？"
        );
        if (!ok) {
            event.preventDefault();
        }
    }
</script>

<div class="max-w-xl space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Verify Transfer（核实银行转账）
    </h1>

    <!-- 错误提示 -->
    {#if errorMsg}
        <div class="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            {errorMsg}
        </div>
    {/if}

    <!-- 基本信息 -->
    <div class="bg-white border rounded-lg p-6 space-y-4">

        <div>
            <p class="font-medium text-gray-700">
                Payment ID: {p.id}
            </p>
        </div>

        <div class="space-y-1 text-gray-700">
            <p><strong>Order:</strong> {p.order_type} #{p.order_id}</p>
            <p><strong>Amount:</strong> ${p.amount.toFixed(2)}</p>
            <p><strong>Date:</strong> {new Date(p.payment_date).toLocaleString()}</p>
        </div>

        <hr />

        <!-- 转账信息 -->
        <div class="space-y-1">
            <p class="font-medium">Transfer Reference（银行转账凭证）</p>
            
            {#if p.transfer_reference}
                <p class="text-gray-700">{p.transfer_reference}</p>
            {:else}
                <p class="text-gray-500">（无凭证信息）</p>
            {/if}
        </div>

        <!-- 验证状态 -->
        <div>
            {#if p.transfer_verified}
                <p class="text-green-700 font-semibold">
                    已验证（Verified）
                </p>
            {:else}
                <p class="text-red-600 font-semibold">
                    未验证（Pending）
                </p>
            {/if}
        </div>

    </div>

    <!-- 操作按钮 -->
    {#if !p.transfer_verified}
        <form method="POST" on:submit={confirmVerify}>
            <button
                type="submit"
                name="action"
                value="verify"
                class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
                Confirm Transfer（确认到账）
            </button>
        </form>
    {/if}

</div>
