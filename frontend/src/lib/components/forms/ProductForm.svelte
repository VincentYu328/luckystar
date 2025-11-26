<script>
    import { createEventDispatcher } from 'svelte';

    export let product = {
        sku: '',
        name: '',
        description: '',
        product_type: 'fabric',    // 'fabric' | 'garment'
        category_id: null,
        material: '',
        pattern: '',
        width_cm: '',
        fabric_id: null,
        style: '',
        gender: '',
        size_label: '',
        color: '',
        unit: 'piece',
        base_price: '',
        cost_price: ''
    };

    // 分类树（与你 SQL 完全一致）
    export let categories = [
        { id: 1, code: 'fabric', name: '布料', parent_id: null },
        { id: 2, code: 'garment', name: '成衣', parent_id: null },

        { id: 3, code: 'mens', name: '男装', parent_id: 2 },
        { id: 4, code: 'womens', name: '女装', parent_id: 2 },
        { id: 5, code: 'boys', name: '男童装', parent_id: 2 },
        { id: 6, code: 'girls', name: '女童装', parent_id: 2 }
    ];

    const dispatch = createEventDispatcher();

    function submitForm() {
        dispatch('submit', product);
    }
</script>

<div class="space-y-6">

    <!-- SKU -->
    <div>
        <label class="form-label">SKU</label>
        <input class="form-input" bind:value={product.sku} required />
    </div>

    <!-- Name -->
    <div>
        <label class="form-label">Name / 名称</label>
        <input class="form-input" bind:value={product.name} required />
    </div>

    <!-- Description -->
    <div>
        <label class="form-label">Description / 描述</label>
        <textarea class="form-textarea" bind:value={product.description}></textarea>
    </div>

    <!-- Product Type -->
    <div>
        <label class="form-label">Product Type / 产品类型</label>
        <select class="form-select" bind:value={product.product_type}>
            <option value="fabric">Fabric / 布料</option>
            <option value="garment">Garment / 成衣</option>
        </select>
    </div>

    <!-- Category -->
    <div>
        <label class="form-label">Category / 分类</label>
        <select class="form-select" bind:value={product.category_id} required>
            <option value="">-- Select Category --</option>
            {#each categories as cat}
                <option value={cat.id}>
                    {cat.name} ({cat.code})
                </option>
            {/each}
        </select>
    </div>

    <!-- Fabric-specific fields -->
    {#if product.product_type === 'fabric'}
        <div>
            <label class="form-label">Material / 材质</label>
            <input class="form-input" bind:value={product.material} />
        </div>

        <div>
            <label class="form-label">Pattern / 花纹</label>
            <input class="form-input" bind:value={product.pattern} />
        </div>

        <div>
            <label class="form-label">Width (cm) / 布幅 (cm)</label>
            <input class="form-input" type="number" bind:value={product.width_cm} />
        </div>

        <div>
            <label class="form-label">Color / 颜色</label>
            <input class="form-input" bind:value={product.color} />
        </div>
    {/if}

    <!-- Garment-specific fields -->
    {#if product.product_type === 'garment'}
        <div>
            <label class="form-label">Fabric Used / 面料（选用 fabric 产品）</label>
            <input class="form-input" type="number" bind:value={product.fabric_id} placeholder="fabric 产品 ID" />
        </div>

        <div>
            <label class="form-label">Style / 款式</label>
            <input class="form-input" bind:value={product.style} />
        </div>

        <div>
            <label class="form-label">Gender / 性别</label>
            <select class="form-select" bind:value={product.gender}>
                <option value="">-- Select --</option>
                <option value="men">Men / 男</option>
                <option value="women">Women / 女</option>
                <option value="boy">Boy / 男童</option>
                <option value="girl">Girl / 女童</option>
            </select>
        </div>

        <div>
            <label class="form-label">Size Label / 尺码标签</label>
            <input class="form-input" bind:value={product.size_label} />
        </div>

        <div>
            <label class="form-label">Color / 颜色</label>
            <input class="form-input" bind:value={product.color} />
        </div>
    {/if}

    <div class="grid grid-cols-2 gap-4">
        <div>
            <label class="form-label">Base Price / 基础售价</label>
            <input class="form-input" type="number" step="0.01" bind:value={product.base_price} required />
        </div>

        <div>
            <label class="form-label">Cost Price / 成本价</label>
            <input class="form-input" type="number" step="0.01" bind:value={product.cost_price} />
        </div>
    </div>

    <!-- Submit -->
    <button 
        class="btn-primary w-full mt-4"
        on:click={submitForm}
    >
        Save Product / 保存产品
    </button>

</div>

<style>
    .form-label {
        font-weight: 600;
        display: block;
        margin-bottom: 4px;
    }
    .form-input,
    .form-select,
    .form-textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 6px;
    }
    .btn-primary {
        background: #2b6cb0;
        color: white;
        padding: 10px;
        border-radius: 6px;
    }
</style>
