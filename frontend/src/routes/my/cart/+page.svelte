<!-- frontend\src\routes\my\cart\+page.svelte -->

<script>
    import { goto } from "$app/navigation"; // 引入 SvelteKit 导航
    
    import {
        cart,
        cartTotal,
        updateQty,
        removeFromCart,
        clearCart, 
    } from "$lib/stores/cart.js";

    import { 
        transferCartToPending 
    } from "$lib/stores/checkout-store.js"; 

    let items = [];
    let amount = 0;

    cart.subscribe((v) => (items = v));
    cartTotal.subscribe((v) => (amount = v));

    /**
     * 处理“进行结账”的逻辑：
     * 1. 将购物车内容转移到 pendingCheckout store。
     * 2. 清空当前的购物车 store。
     * 3. 导航到订单列表页。
     */
    function handleCheckout() {
        if (items.length === 0) return;

        // 1. 将购物车数据（items 和 total）转移到待提交 Store
        transferCartToPending(items, amount);
        
        // 2. 清空购物车 (同时会清除 localStorage)
        clearCart();
        
        // 3. 跳转到订单页面，让用户查看并最终提交订单
        goto('/my/orders'); 
    }
</script>

<div class="max-w-3xl mx-auto py-10 space-y-6">
    <h1 class="text-3xl font-semibold tracking-tight">My Cart</h1>

    {#if items.length === 0}
        <p class="text-gray-500">Your cart is empty.</p>
    {:else}
        <div class="space-y-4">
            {#each items as item}
                <div class="flex justify-between border-b pb-4">
                    <div>
                        <div class="font-medium">{item.name}</div>
                        <div class="text-gray-600">${item.price} each</div>
                    </div>

                    <div class="flex items-center gap-3">
                        <input
                            type="number"
                            min="1"
                            value={item.qty}
                            class="w-16 border rounded p-1"
                            on:change={(e) =>
                                updateQty(item.product_id, Number(e.target.value))}
                        />

                        <button
                            class="text-red-600"
                            on:click={() => removeFromCart(item.product_id)}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            {/each}
        </div>

        <div class="pt-6 text-xl font-semibold">
            Total: ${amount.toFixed(2)}
        </div>

        <button
            on:click={handleCheckout}
            class="block mt-6 bg-blue-600 text-white py-3 rounded-lg text-center hover:bg-blue-700 w-full"
        >
            Proceed to Checkout
        </button>
    {/if}
</div>