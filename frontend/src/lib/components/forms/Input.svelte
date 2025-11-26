<script>
    import { createEventDispatcher } from "svelte";

    export let label = "";          // 显示的标签（可双语）
    export let placeholder = "";    // 占位符
    export let type = "text";       // input 类型
    export let value = "";          // 双向绑定
    export let required = false;    // 是否必填
    export let disabled = false;    // 是否禁用
    export let error = "";          // 错误提示（可选）
    export let name = "";           // 可选：表单 name

    const dispatch = createEventDispatcher();

    function updateValue(e) {
        value = e.target.value;
        dispatch("change", value);
        dispatch("input", value);
    }
</script>

<div class="space-y-1">
    {#if label}
        <label class="form-label">
            {label}
            {#if required}<span class="text-red-500">*</span>{/if}
        </label>
    {/if}

    <input
        class="form-input"
        {name}
        bind:value
        type={type}
        {placeholder}
        {required}
        {disabled}
        on:input={updateValue}
    />

    {#if error}
        <p class="text-sm text-red-600">{error}</p>
    {/if}
</div>

<style>
    .form-label {
        @apply block text-sm font-medium text-gray-700;
    }

    .form-input {
        @apply w-full border rounded px-3 py-2 text-sm
               focus:outline-none focus:ring-2 focus:ring-blue-500;
    }
</style>
