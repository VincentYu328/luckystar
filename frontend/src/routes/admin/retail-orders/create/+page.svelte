<script>
    import { enhance } from '$app/forms';
    
    export let data;
    
    const products = data.products ?? []; 
    const customers = data.customers ?? [];
    
    let items = [{ product_id: '', qty: 1, unit_price: null }];
    let customer_id = ''; 
    let notes = '';
    let formError = '';
    let formMessage = '';
    let submitting = false;

    function addItem() {
        items = [...items, { product_id: '', qty: 1, unit_price: null }];
        formError = '';
    }

    function removeItem(i) {
        items = items.filter((_, idx) => idx !== i);
        formError = '';
    }

    function getProductPrice(productId) {
        const product = products.find(p => p.id === Number(productId));
        return product ? product.base_price : 0;
    }
</script>

<div class="space-y-8 max-w-3xl p-4">

    <h1 class="text-3xl font-semibold tracking-tight">
        Create Retail Order (Staff Entry)
    </h1>

    {#if data.loadError}
        <div class="p-4 rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300">
            ⚠️ Load Error: {data.loadError}
        </div>
    {/if}

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
        use:enhance={({ formData, cancel }) => {
            console.log('[CLIENT] Form submission started');
            
            formError = '';
            formMessage = '';
            submitting = true;

            const timeout = setTimeout(() => {
                console.error('[CLIENT] Timeout after 10 seconds');
                if (submitting) {
                    formError = "Server Timeout: The server took too long to respond.";
                    submitting = false;
                }
            }, 10000);
            
            // 客户端验证
            if (!customer_id || items.length === 0) {
                console.warn('[CLIENT] Validation failed: Missing customer or items');
                formError = 'A customer and at least one item are required.';
                submitting = false; 
                clearTimeout(timeout);
                cancel(); 
                return;
            }

            // ⭐ 验证所有 item 都选择了产品
            for (let i = 0; i < items.length; i++) {
                if (!items[i].product_id || items[i].product_id === '') {
                    formError = `Please select a product for item #${i + 1}`;
                    submitting = false;
                    clearTimeout(timeout);
                    cancel();
                    return;
                }
            }

            // 构建 Payload
            let calculated_subtotal = 0;
            const itemsPayload = [];
            
            try {
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    
                    // ⭐ 关键修复：确保 product_id 是数字
                    const productId = Number(item.product_id);
                    
                    if (!productId || isNaN(productId)) {
                        throw new Error(`Invalid product selected for item #${i + 1}`);
                    }
                    
                    const product = products.find(p => p.id === productId);
                    
                    if (!product) {
                        throw new Error(`Product not found for item #${i + 1}. Please refresh the page.`);
                    }
                    
                    const unitPrice = item.unit_price !== null && item.unit_price !== '' 
                        ? Number(item.unit_price) 
                        : product.base_price;
                    const quantity = Number(item.qty);

                    if (quantity <= 0 || isNaN(quantity)) {
                        throw new Error(`Quantity for ${product.name} must be positive.`);
                    }

                    if (unitPrice < 0 || isNaN(unitPrice)) {
                        throw new Error(`Price for ${product.name} must be valid.`);
                    }

                    const itemSubtotal = unitPrice * quantity;
                    calculated_subtotal += itemSubtotal;
                    
                    // ⭐ 关键修复：确保 product_id 是数字类型
                    itemsPayload.push({
                        product_id: productId, // 数字，不是字符串
                        name: product.name,
                        price_snapshot: unitPrice, 
                        quantity: quantity,
                    });

                    console.log(`[CLIENT] Item #${i + 1} processed:`, {
                        product_id: productId,
                        name: product.name,
                        price_snapshot: unitPrice,
                        quantity: quantity
                    });
                }

                const finalPayload = {
                    customer_id: Number(customer_id), 
                    notes,
                    items: itemsPayload,
                    subtotal: calculated_subtotal, 
                    total_amount: calculated_subtotal,
                };
                
                console.log('[CLIENT] Final Payload:', JSON.stringify(finalPayload, null, 2));
                console.log('[CLIENT] Items details:', itemsPayload.map(it => ({
                    product_id: it.product_id,
                    product_id_type: typeof it.product_id,
                    name: it.name
                })));

                formData.set('payload', JSON.stringify(finalPayload));
                console.log('[CLIENT] Request sent to server');
                
            } catch (err) {
                console.error('[CLIENT] Pre-submit error:', err.message);
                formError = err.message;
                submitting = false;
                clearTimeout(timeout);
                cancel();
                return;
            }
            
            // Post-submit 回调处理
            return ({ update, result }) => {
                clearTimeout(timeout);
                console.log('[CLIENT] Response received. Type:', result.type);
                
                submitting = false;

                if (result.type === 'failure') {
                    formError = result.data?.message || 'Order creation failed.';
                    console.error('[CLIENT] Action failed:', formError);
                    update(); 
                } else if (result.type === 'redirect') {
                    formMessage = 'Order created successfully! Redirecting...';
                    console.log('[CLIENT] Redirecting to:', result.location);
                    update(); 
                    return; 
                } else if (result.type === 'error') {
                    formError = 'Server error occurred.';
                    console.error('[CLIENT] Server error:', result.error);
                    update();
                } else {
                    formError = 'Unexpected response type.';
                    console.warn('[CLIENT] Unexpected result type:', result.type);
                    update();
                }
            }
        }}
    >

        <div class="space-y-10">

            <div class="space-y-3 p-4 border rounded-lg bg-gray-50">
                <h2 class="text-xl font-medium">
                    Customer Info
                </h2>
                
                <select
                    bind:value={customer_id}
                    class="border rounded p-2 w-full"
                    required
                    name="customer_id_phantom"
                >
                    <option value="">Select Existing Customer (Required)</option>
                    {#each customers as customer}
                        <option value={customer.id}>
                            {customer.full_name} ({customer.phone || customer.email})
                        </option>
                    {/each}
                </select>
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
                            <option value="">Select Product...</option>
                            {#each products as p}
                                <option value={p.id}>
                                    {p.sku} — {p.name} (${p.base_price.toFixed(2)})
                                </option>
                            {/each}
                        </select>
                        
                        {#if item.product_id}
                            <div class="text-xs text-gray-500 pl-1">
                                Base Price: ${getProductPrice(item.product_id).toFixed(2)}
                            </div>
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
                <label class="block mb-1 font-medium" for="notes_input">
                    Notes (Optional)
                </label>
                <textarea
                    bind:value={notes}
                    class="border rounded p-2 w-full"
                    rows="3"
                    placeholder="Internal notes about the order."
                    name="notes_phantom"
                    id="notes_input"
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