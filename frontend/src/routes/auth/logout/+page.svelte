<script>
    import { enhance } from '$app/forms';
    import { onMount } from 'svelte';

    let formNode;

    // 组件挂载后立即提交表单
    onMount(() => {
        if (formNode) {
            formNode.submit();
        }
    });
</script>

<div class="logout-page">
    <h1 class="text-center">正在安全退出，请稍候...</h1>
    
    <form method="POST" use:enhance bind:this={formNode} style="display: none;">
        </form>
</div>