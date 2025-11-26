<script>
    export let data;

    let order_id = '';
    let payment_type = 'full';
    let payment_method = 'cash';
    let amount = '';
    let transfer_reference = '';
    let notes = '';

    let errorMsg = '';
</script>

<div class="max-w-xl space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Create Payment（新增付款记录）
    </h1>

    {#if errorMsg}
        <div class="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            {errorMsg}
        </div>
    {/if}

    <form method="POST" class="space-y-6">

        <!-- 订单选择 -->
        <div>
            <label class="block mb-1 font-medium">
                Order（订单）
            </label>

            <select
                name="order_id"
                bind:value={order_id}
                required
                class="border rounded p-2 w-full"
            >
                <option value="">Please choose order（请选择订单）</option>

                {#each data.retailOrders as o}
                    <option value={o.id}>
                        Retail #{o.id} — ${o.total_amount}
                    </option>
                {/each}
            </select>
        </div>

        <!-- 付款类型 -->
        <div>
            <label class="block mb-1 font-medium">
                Payment Type（付款类型）
            </label>

            <select
                name="payment_type"
                bind:value={payment_type}
                class="border rounded p-2 w-full"
            >
                <option value="full">Full（全额）</option>
                <option value="deposit">Deposit（定金）</option>
                <option value="final">Final（尾款）</option>
            </select>
        </div>

        <!-- 付款方式 -->
        <div>
            <label class="block mb-1 font-medium">
                Payment Method（支付方式）
            </label>

            <select
                name="payment_method"
                bind:value={payment_method}
                class="border rounded p-2 w-full"
            >
                <option value="cash">Cash（现金）</option>
                <option value="eftpos">EFTPOS</option>
                <option value="transfer">Bank Transfer（银行转账）</option>
            </select>
        </div>

        <!-- 银行转账 Reference -->
        {#if payment_method === 'transfer'}
            <div>
                <label class="block mb-1 font-medium">
                    Transfer Reference（银行转账凭证号）
                </label>
                <input
                    name="transfer_reference"
                    bind:value={transfer_reference}
                    class="border rounded p-2 w-full"
                    placeholder="例如：ABC123 或 Screenshot Filename"
                />
            </div>
        {/if}

        <!-- 金额 -->
        <div>
            <label class="block mb-1 font-medium">
                Amount（金额）
            </label>
            <input
                name="amount"
                type="number"
                bind:value={amount}
                min="0"
                step="0.01"
                required
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- Notes -->
        <div>
            <label class="block mb-1 font-medium">
                Notes（备注）
            </label>
            <textarea
                name="notes"
                bind:value={notes}
                rows="3"
                class="border rounded p-2 w-full"
            ></textarea>
        </div>

        <button
            type="submit"
            name="action"
            value="create"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            on:click={() => {
                if (!order_id) errorMsg = '请选择订单';
            }}
        >
            Create（创建）
        </button>

    </form>

</div>
