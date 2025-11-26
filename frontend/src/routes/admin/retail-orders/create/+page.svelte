<script>
    export let data;

    const products = data.products;

    let items = [];
    let customer_name = '';
    let customer_phone = '';
    let notes = '';

    function addItem() {
        items = [...items, { product_id: '', qty: 1 }];
    }

    function removeItem(i) {
        items = items.filter((_, idx) => idx !== i);
    }
</script>

<div class="space-y-8 max-w-3xl">

    <h1 class="text-3xl font-semibold tracking-tight">
        Create Retail Order（录入零售订单）
    </h1>

    <form method="POST" class="space-y-10">

        <!-- 顾客信息 -->
        <div class="space-y-3">
            <h2 class="text-xl font-medium">
                Customer Info（顾客信息）
            </h2>

            <input
                name="customer_name"
                bind:value={customer_name}
                placeholder="Customer Name（客户姓名）"
                class="border rounded p-2 w-full"
            />

            <input
                name="customer_phone"
                bind:value={customer_phone}
                placeholder="Phone Number（电话）"
                class="border rounded p-2 w-full"
            />
        </div>

        <!-- 订单商品 -->
        <div class="space-y-5">
            <h2 class="text-xl font-medium">
                Order Items（订单商品）
            </h2>

            {#each items as item, i}
                <div class="border rounded-lg p-4 bg-white space-y-3">

                    <select
                        name="product_id"
                        bind:value={item.product_id}
                        class="border rounded p-2 w-full"
                        required
                    >
                        <option value="">
                            Select Product…（选择产品…）
                        </option>

                        {#each products as p}
                            <option value={p.id}>
                                {p.sku} — {p.name}
                            </option>
                        {/each}
                    </select>

                    <input
                        type="number"
                        min="1"
                        name="qty"
                        bind:value={item.qty}
                        class="border rounded p-2 w-full"
                        placeholder="Quantity（数量）"
                        required
                    />

                    <button
                        type="button"
                        on:click={() => removeItem(i)}
                        class="text-red-600 text-sm"
                    >
                        Remove（移除）
                    </button>
                </div>
            {/each}

            <button
                type="button"
                on:click={addItem}
                class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
                + Add Item（添加商品）
            </button>
        </div>

        <!-- 备注 -->
        <div>
            <label class="block mb-1 font-medium">
                Notes（备注）
            </label>
            <textarea
                name="notes"
                bind:value={notes}
                class="border rounded p-2 w-full"
                rows="3"
                placeholder="Optional notes（可选备注）"
            ></textarea>
        </div>

        <!-- 提交 -->
        <button
            type="submit"
            name="action"
            value="create"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
            Create Order（创建订单）
        </button>

    </form>

</div>
