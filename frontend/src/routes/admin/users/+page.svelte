<!-- frontend/src/routes/admin/users/+page.svelte -->
<script>
    export let data;
    
    // 🔥 使用响应式解构
    $: ({ users, createSuccess, updateSuccess, deleteSuccess, deleteError } = data);
</script>

<div class="space-y-8 p-4">

    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-semibold tracking-tight">
            Staff Users（员工管理）
        </h1>

        <a href="/admin/users/create"
           class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            + New User（新增员工）
        </a>
    </div>

    <!-- 成功/错误提示 -->
    {#if createSuccess}
        <div class="p-4 rounded-lg bg-green-100 text-green-800 border border-green-300">
            ✅ User created successfully / 员工创建成功
        </div>
    {/if}

    {#if updateSuccess}
        <div class="p-4 rounded-lg bg-green-100 text-green-800 border border-green-300">
            ✅ User updated successfully / 员工更新成功
        </div>
    {/if}

    {#if deleteSuccess}
        <div class="p-4 rounded-lg bg-green-100 text-green-800 border border-green-300">
            ✅ User deleted successfully / 员工删除成功
        </div>
    {/if}

    {#if deleteError}
        <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            ❌ {deleteError}
        </div>
    {/if}

    <!-- 用户列表 -->
    {#if users.length === 0}
        <div class="text-center py-12 bg-gray-50 rounded-lg">
            <p class="text-gray-600">No staff users yet（暂无员工）</p>
        </div>
    {:else}
        <div class="bg-white border rounded-lg overflow-hidden shadow-sm">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="p-3 font-medium">Name（姓名）</th>
                        <th class="p-3 font-medium">Phone（电话）</th>
                        <th class="p-3 font-medium">Email</th>
                        <th class="p-3 font-medium">Position（职位）</th>
                        <th class="p-3 font-medium">Role（角色）</th>
                        <th class="p-3 font-medium">Status（状态）</th>
                        <th class="p-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {#each users as u (u.id)}
                        <tr class="border-b hover:bg-gray-50 transition">

                            <td class="p-3 font-medium text-gray-900">{u.full_name}</td>
                            <td class="p-3 text-gray-700">{u.phone}</td>
                            <td class="p-3 text-gray-700">{u.email ?? '—'}</td>
                            <td class="p-3 text-gray-700">{u.position_name ?? '—'}</td>
                            <td class="p-3">
                                <span class="px-2 py-1 rounded-full text-xs font-medium {u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">
                                    {u.role_name ?? u.role}
                                </span>
                            </td>

                            <td class="p-3">
                                {#if u.is_active === 1 || u.is_active === true}
                                    <span class="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                                        ✓ Active
                                    </span>
                                {:else}
                                    <span class="text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                                        ✕ Disabled
                                    </span>
                                {/if}
                            </td>

                            <td class="p-3">
                                <div class="flex justify-end gap-3">
                                    <a href={`/admin/users/${u.id}/edit`}
                                       class="text-blue-600 hover:underline">
                                        Edit（编辑）
                                    </a>

                                    <a href={`/admin/users/${u.id}/permissions`}
                                       class="text-gray-600 hover:underline">
                                        Permissions（权限）
                                    </a>
                                </div>
                            </td>

                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}

</div>