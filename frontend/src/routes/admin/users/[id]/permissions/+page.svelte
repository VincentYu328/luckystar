<script>
    export let data;

    let user = data.detail;
    let role = data.role;
    let perms = data.perms;
</script>

<div class="space-y-8">

    <h1 class="text-3xl font-semibold tracking-tight">
        Permissions for {user.full_name}
        （权限概览）
    </h1>

    <div class="bg-white border rounded p-6 space-y-2">
        <p>
            <strong>Role（角色）:</strong> {role.role_name}
        </p>
    </div>

    <div class="bg-white border rounded p-6">
        <h2 class="font-semibold mb-4">
            Effective Permissions（生效权限）
        </h2>

        <ul class="list-disc ml-6 space-y-1">
            {#each perms as p}
                <li>{p}</li>
            {/each}
        </ul>
    </div>

</div>
