<script>
    import { user } from '$lib/stores/auth';
    import { onDestroy } from 'svelte';

    export let permission = "";      // 需要的权限节点（如 "staff.view"）
    export let silent = false;       // silent=true 时不显示提示

    let currentUser = null;
    const unsubscribe = user.subscribe(u => currentUser = u);
    onDestroy(unsubscribe);

    // 判断权限
    function hasPermission() {
        if (!currentUser || !currentUser.permissions) return false;
        return currentUser.permissions.includes(permission);
    }
</script>

{#if hasPermission()}
    <!-- 用户拥有权限 → 渲染内容 -->
    <slot />
{:else}
    {#if !silent}
        <div class="p-4 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
            🚫 No Permission（无权限）  
            <div class="text-xs mt-1 text-red-500">Required: {permission}</div>
        </div>
    {/if}
{/if}
