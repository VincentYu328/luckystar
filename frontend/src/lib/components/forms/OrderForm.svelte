<script>
    import { createEventDispatcher } from 'svelte';

    export let customers = [];     // 父组件传入 customer 列表
    export let products = [];      // 父组件传入产品列表
    export let defaultValues = {}; // 编辑模式下使用

    const dispatch = createEventDispatcher();

    // -----------------------------
    // 主订单对象：与 SQL 完全一致
    // -----------------------------
    let order = {
        customer_id: defaultValues.customer_id ?? null,
        status: defaultValues.status ?? 'pending',
        channel: defaultValues.channel ?? 'in_store',
        discount_rate: defaultValues.discount_rate ?? 0,
        discount_amount: defaultValues.discount_amount ?? 0,
        subtotal: defaultValues.subtotal ?? 0,
        total_amount: defaultValues.total_amount ?? 0,
        deposit_amount: defaultValues.deposit_amount ?? 0,
        deposit_paid: defaultValues.deposit_paid ?? 0,
        due_date: defaultValues.due_date ?? '',
        notes: defaultValues.notes ?? ''
    };

    // -----------------------------
    // 订单明细：SQL retail_order_items
    // -----------------------------
    let items = defaultValues.items ?? [];

    // 商品选择 → 添加 item
    function addItem(productId) {
        const p = products.find(x => x.id == productId);
        if (!p) return;

        items.push({
            product_id: p.id,
            product_sku: p.sku,
            product_name: p.name,
            unit_price: p.base_price,
            quantity: 1,
            size_label: '',
            color: p.color || '',
            subtotal: p.base_price
        });

        updateTotals();
    }

    // 删除 item
    function removeItem(index) {
        items.splice(index, 1);
        updateTotals();
    }

    // 修改数量
    function updateQty(index, qty) {
        items[index].quantity = Number(qty);
        items[index].subtotal =
            items[index].quantity * items[index].unit_price;

        updateTotals();
    }

    // -----------------------------
    // 自动计算 totals
    // -----------------------------
    function updateTotals() {
        order.subtotal = items.reduce((s, x) => s + x.subtotal, 0);

        order.discount_amount =
            order.discount_rate > 0
                ? order.subtotal * (order.discount_rate / 100)
                : order.discount_amount;

        order.total_amount =
            order.subtotal - order.discount_amount;
    }

    // -----------------------------
    // 提交到父组件
    // -----------------------------
    function submitForm() {
        updateTotals();

        dispatch('submit', {
            order,
            items
        });
    }
</script>

<div class="space-y-8">

    <h2 class="text-xl font-semibold">
        Retail Order（零售订单）
    </h2>

    <form class="space-y-6" on:submit|preventDefault={submitForm}>

        <!-- ===========================
             Customer 顾客选择
        ============================ -->
        <div>
            <label class="form-label">Customer（顾客）</label>
            <select class="form-input" bind:value={order.customer_id}>
                <option value="">-- Select Customer --（选择顾客）</option>
                {#each customers as c}
                    <option value={c.id}>{c.full_name} — {c.phone}</option>
                {/each}
            </select>
        </div>

        <!-- ===========================
             Order Items 商品明细
        ============================ -->
        <div class="border p-4 rounded space-y-4">

            <h3 class="text-lg font-medium">Items（商品明细）</h3>

            <!-- 添加商品 -->
            <div class="flex gap-4 items-center">
                <select class="form-input" on:change={(e) => addItem(e.target.value)}>
                    <option value="">Add Product（添加商品）</option>
                    {#each products as p}
                        <option value={p.id}>{p.sku} — {p.name}</option>
                    {/each}
                </select>
            </div>

            <!-- 商品列表 -->
            <table class="w-full text-sm mt-4">
                <thead>
                    <tr class="text-left border-b">
                        <th class="py-1">Product（商品）</th>
                        <th>Price（单价）</th>
                        <th>Qty（数量）</th>
                        <th>Subtotal（小计）</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {#each items as item, i}
                        <tr class="border-b">
                            <td class="py-2">
                                {item.product_name}
                            </td>
                            <td>${item.unit_price}</td>
                            <td>
                                <input type="number" min="1"
                                    class="w-16 border rounded px-2"
                                    bind:value={item.quantity}
                                    on:change={(e) => updateQty(i, e.target.value)} />
                            </td>
                            <td>${item.subtotal.toFixed(2)}</td>
                            <td>
                                <button type="button"
                                    class="text-red-500"
                                    on:click={() => removeItem(i)}>
                                    删除
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- ===========================
             Discount + Deposit 折扣 + 预付款
        ============================ -->
        <div class="grid grid-cols-2 gap-6">

            <div>
                <label class="form-label">Discount Rate（折扣 %）</label>
                <input type="number" step="0.1"
                    class="form-input"
                    bind:value={order.discount_rate}
                    on:input={updateTotals} />
            </div>

            <div>
                <label class="form-label">Discount Amount（折扣金额）</label>
                <input type="number" step="0.01"
                    class="form-input"
                    bind:value={order.discount_amount}
                    on:input={updateTotals} />
            </div>

            <div>
                <label class="form-label">Deposit（订金）</label>
                <input type="number" step="0.01"
                    class="form-input"
                    bind:value={order.deposit_amount} />
            </div>

            <div>
                <label class="form-label">Due Date（交付日期）</label>
                <input type="date" class="form-input" bind:value={order.due_date} />
            </div>

        </div>

        <!-- ===========================
             Notes 备注
        ============================ -->
        <div>
            <label class="form-label">Notes（备注）</label>
            <textarea rows="3" class="form-input"
                bind:value={order.notes}></textarea>
        </div>

        <!-- 汇总 -->
        <div class="text-right text-lg font-medium">
            Total（总计）: ${order.total_amount.toFixed(2)}
        </div>

        <!-- 提交 -->
        <button class="btn-primary mt-4">
            Save Order（保存订单）
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
