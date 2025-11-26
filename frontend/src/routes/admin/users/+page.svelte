<script>
    export let data;
    const users = data.users;
</script>

<div class="space-y-8">

    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-semibold tracking-tight">
            Staff Users（员工管理）
        </h1>

        <a href="/admin/users/create"
           class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + New User（新增员工）
        </a>
    </div>

    <div class="bg-white border rounded-lg overflow-x-auto">
        <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="p-3">Name（姓名）</th>
                    <th class="p-3">Phone（电话）</th>
                    <th class="p-3">Email</th>
                    <th class="p-3">Position（职位）</th>
                    <th class="p-3">Role（角色）</th>
                    <th class="p-3">Status（状态）</th>
                    <th class="p-3"></th>
                </tr>
            </thead>

            <tbody>
                {#each users as u}
                    <tr class="border-b hover:bg-gray-50">

                        <td class="p-3 font-medium">{u.full_name}</td>
                        <td class="p-3">{u.phone}</td>
                        <td class="p-3">{u.email ?? '—'}</td>
                        <td class="p-3">{u.position_name}</td>
                        <td class="p-3">{u.role_name}</td>

                        <td class="p-3">
                            {#if u.is_active}
                                <span class="text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs">
                                    Active
                                </span>
                            {:else}
                                <span class="text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs">
                                    Disabled
                                </span>
                            {/if}
                        </td>

                        <td class="p-3 text-right space-x-3">
                            <a href={`/admin/users/${u.id}/edit`}
                               class="text-blue-600 hover:underline">
                                Edit（编辑）
                            </a>

                            <a href={`/admin/users/${u.id}/permissions`}
                               class="text-gray-600 hover:underline">
                                Permissions（权限）
                            </a>
                        </td>

                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

</div>
