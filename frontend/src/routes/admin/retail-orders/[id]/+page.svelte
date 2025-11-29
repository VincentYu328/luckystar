<!-- frontend\src\routes\admin\retail-orders\[id]\+page.svelte -->

<script>
    import { enhance } from '$app/forms';
    // 移除 import { goto } from '$app/navigation';，因为 enhance 会处理重定向
    
    export let data;
    
    // Rule 4: Defensive check
    const products = data.products ?? []; 
    
    let items = [{ product_id: '', qty: 1, unit_price: null }];
    let customer_name = '';
    let customer_phone = '';
    let notes = '';
    let formError = '';
    let formMessage = '';
    let submitting = false;

    // --- Helper Functions ---
    
    function addItem() {
        items = [...items, { product_id: '', qty: 1, unit_price: null }];
        formError = '';
    }

    function removeItem(i) {
        items = items.filter((_, idx) => idx !== i);
        formError = '';
    }

    // --- Price Lookup Helper ---
    function getProductPrice(productId) {
        const product = products.find(p => p.id === Number(productId));
        return product ? product.base_price : 0;
    }
</script>

<div class="space-y-8 max-w-3xl p-4">

    <h1 class="text-3xl font-semibold tracking-tight">
        Create Retail Order (Staff Entry)
    </h1>

    {#if formError}
        <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            ❌ Error: {formError}
        </div>
    {/if}
    
    {#if formMessage}
        <div class="p-4 rounded-lg bg-green-100 text-green-800 border border-green-300">
            ✅ {formMessage}
        </div>
    {/if}

    <form 
        method="POST" 
        action="?/create" 
        use:enhance={({ data, cancel }) => {
            
            // --- 1. 客户端校验 (Pre-Submit Validation) ---
            formError = '';
            submitting = true;

            if (!customer_name || !customer_phone || items.length === 0) {
                formError = 'Customer name, phone, and at least one item are required.';
                submitting = false;
                cancel(); // 取消提交
                return;
            }

            // --- 2. 计算并构造 Items Payload ---
            let total_amount = 0;
            const itemsPayload = [];
            
            for (const item of items) {
                const product = products.find(p => p.id === Number(item.product_id));
                
                if (!product) {
                    formError = `Error: Please select a product for all items.`;
                    submitting = false;
                    cancel();
                    return;
                }
                
                // 获取价格 (手动覆盖价格 > 基础价格)
                const unitPrice = item.unit_price !== null && item.unit_price !== '' ? Number(item.unit_price) : product.base_price;
                const quantity = Number(item.qty);

                if (quantity <= 0 || isNaN(quantity)) {
                    formError = `Error: Quantity for ${product.name} must be positive.`;
                    submitting = false;
                    cancel();
                    return;
                }

                total_amount += unitPrice * quantity;
                
                itemsPayload.push({
                    product_id: product.id,
                    name: product.name,
                    price_snapshot: unitPrice, 
                    quantity: quantity,
                });
            }

            // --- 3. 构造最终 Payload JSON ---
            const finalPayload = {
                customer_name,
                customer_phone,
                notes,
                items: itemsPayload,
                total_amount: total_amount, 
            };

            // 4. 将 JSON 字符串注入到 FormData 中，传递给 Action
            data.set('payload', JSON.stringify(finalPayload));
            
            // --- 提交后处理 (Post-Submit Handling) ---
            return ({ update, result }) => {
                submitting = false;

                if (result.type === 'failure') {
                    // Action 返回 failure 对象 (通常是服务器校验失败)
                    formError = result.data.message || 'Order creation failed.';
                } else if (result.type === 'redirect') {
                    // Action 抛出 throw redirect(303, ...)，enhance 自动处理跳转
                    formMessage = 'Order created successfully. Redirecting...';
                    // SvelteKit 会自动执行跳转
                } else {
                    formError = 'An unexpected submission error occurred.';
                }
                
                update(); // 强制更新页面状态（如错误信息）
            }
        }}
    >

        <div class="space-y-10">

            <div class="space-y-3 p-4 border rounded-lg bg-gray-50">
                <h2 class="text-xl font-medium">
                    Customer Info
                </h2>
                
                <input
                    bind:value={customer_name}
                    placeholder="Customer Name (Required)"
                    class="border rounded p-2 w-full"
                    name="customer_name_phantom" 
                />

                <input
                    bind:value={customer_phone}
                    placeholder="Phone Number (Required)"
                    class="border rounded p-2 w-full"
                    name="customer_phone_phantom"
                />
            </div>

            <div class="space-y-5">
                <h2 class="text-xl font-medium">
                    Order Items
                </h2>

                {#each items as item, i}
                    <div class="border rounded-lg p-4 bg-white space-y-3">
                        
                        <div class="text-sm text-gray-700">Item #{i + 1}</div>

                        <select
                            bind:value={item.product_id}
                            class="border rounded p-2 w-full"
                            required
                            name="product_id_{i}_phantom"
                        >
                            <option value="">
                                Select Product...
                            </option>
                            {#each products as p}
                                <option value={p.id}>
                                    {p.sku} — {p.name} (${p.base_price.toFixed(2)})
                                </option>
                            {/each}
                        </select>
                        
                        {#if item.product_id}
                            <div class="text-xs text-gray-500 pl-1">Base Price: ${getProductPrice(item.product_id).toFixed(2)}</div>
                        {/if}

                        <div class="flex gap-3">
                            <input
                                type="number"
                                min="1"
                                bind:value={item.qty}
                                class="border rounded p-2 w-1/3"
                                placeholder="Qty"
                                required
                                name="qty_{i}_phantom"
                            />
                            <input
                                type="number"
                                step="0.01"
                                bind:value={item.unit_price}
                                class="border rounded p-2 w-2/3"
                                placeholder="Unit Price Override (Optional)"
                                name="price_{i}_phantom"
                            />
                        </div>

                        <button
                            type="button"
                            on:click={() => removeItem(i)}
                            class="text-red-600 text-sm hover:underline"
                        >
                            Remove Item
                        </button>
                    </div>
                {/each}

                <button
                    type="button"
                    on:click={addItem}
                    class="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 font-medium"
                >
                    + Add Item
                </button>
            </div>

            <div>
                <label class="block mb-1 font-medium">
                    Notes (Optional)
                </label>
                <textarea
                    bind:value={notes}
                    class="border rounded p-2 w-full"
                    rows="3"
                    placeholder="Internal notes about the order."
                    name="notes_phantom"
                ></textarea>
            </div>

            <button
                type="submit"
                disabled={submitting}
                class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition w-full"
            >
                {submitting ? 'Creating Order...' : 'Create Order'}
            </button>

        </div>

    </form>
</div>