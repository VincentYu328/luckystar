<script>
    export let data;
    export let form;

    const order = data.order;
    const members = data.members;

    let deleteConfirm = { show: false, memberId: null, memberName: '' };

    function confirmDelete(memberId, memberName) {
        deleteConfirm = { show: true, memberId, memberName };
    }

    function cancelDelete() {
        deleteConfirm = { show: false, memberId: null, memberName: '' };
    }
</script>

<div class="space-y-8 p-4">

    <!-- 标题和操作按钮 -->
    <div class="flex justify-between items-center">
        <div>
            <a href="/admin/group-orders" class="text-blue-600 hover:underline text-sm mb-2 inline-block">
                ← Back to Group Orders
            </a>
            <h1 class="text-3xl font-semibold tracking-tight">
                Group Order #{order.id}
            </h1>
        </div>

        <div class="flex gap-3">
            <a
                href="/admin/group-orders/{order.id}/edit"
                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
                Edit / 编辑
            </a>
        </div>
    </div>

    <!-- Error Message -->
    {#if form?.error}
        <div class="p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
            ❌ {form.error}
        </div>
    {/if}

    <!-- 订单信息卡片 -->
    <div class="bg-white border rounded-lg p-6 space-y-4">
        <h2 class="text-xl font-semibold border-b pb-2">Order Information（订单信息）</h2>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <div class="text-sm text-gray-500">Group Name（团体名称）</div>
                <div class="font-medium">{order.group_name}</div>
            </div>

            {#if order.event_name}
                <div>
                    <div class="text-sm text-gray-500">Event Name（活动名称）</div>
                    <div class="font-medium">{order.event_name}</div>
                </div>
            {/if}

            <div>
                <div class="text-sm text-gray-500">Leader（负责人）</div>
                <div class="font-medium">{order.leader_name || '—'}</div>
                {#if order.leader_phone}
                    <div class="text-sm text-gray-600">{order.leader_phone}</div>
                {/if}
                {#if order.leader_email}
                    <div class="text-sm text-gray-600">{order.leader_email}</div>
                {/if}
            </div>

            {#if order.expected_members}
                <div>
                    <div class="text-sm text-gray-500">Expected Members（预计成员数）</div>
                    <div class="font-medium">{order.expected_members}</div>
                </div>
            {/if}

            {#if order.event_start || order.event_end}
                <div>
                    <div class="text-sm text-gray-500">Event Dates（活动日期）</div>
                    <div class="font-medium">
                        {#if order.event_start}
                            {new Date(order.event_start).toLocaleDateString('zh-CN')}
                        {/if}
                        {#if order.event_start && order.event_end}
                            -
                        {/if}
                        {#if order.event_end}
                            {new Date(order.event_end).toLocaleDateString('zh-CN')}
                        {/if}
                    </div>
                </div>
            {/if}

            {#if order.fabric_selected}
                <div>
                    <div class="text-sm text-gray-500">Selected Fabric（选择的布料）</div>
                    <div class="font-medium">Fabric ID: {order.fabric_selected}</div>
                </div>
            {/if}

            <div>
                <div class="text-sm text-gray-500">Created At（创建时间）</div>
                <div class="font-medium">{new Date(order.created_at).toLocaleString('zh-CN')}</div>
            </div>
        </div>

        {#if order.notes}
            <div>
                <div class="text-sm text-gray-500 mb-1">Notes（备注）</div>
                <div class="bg-gray-50 p-3 rounded border text-sm whitespace-pre-wrap">{order.notes}</div>
            </div>
        {/if}
    </div>

    <!-- 成员列表 -->
    <div class="bg-white border rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Members（成员列表）</h2>
            <a
                href="/admin/group-orders/{order.id}/members/add"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                + Add Member / 添加成员
            </a>
        </div>

        {#if members.length === 0}
            <div class="text-center py-8 text-gray-500">
                No members yet. Click "Add Member" to add the first member.
                <br />
                暂无成员，点击"添加成员"按钮添加第一个成员。
            </div>
        {:else}
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 border-b">
                    <tr>
                        <th class="p-3">Name（姓名）</th>
                        <th class="p-3">Phone（电话）</th>
                        <th class="p-3">Email（邮箱）</th>
                        <th class="p-3">Note（备注）</th>
                        <th class="p-3 text-right">Actions（操作）</th>
                    </tr>
                </thead>
                <tbody>
                    {#each members as member}
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-3 font-medium">{member.full_name}</td>
                            <td class="p-3">{member.phone || '—'}</td>
                            <td class="p-3">{member.email || '—'}</td>
                            <td class="p-3 text-gray-600">{member.note || '—'}</td>
                            <td class="p-3">
                                <div class="flex justify-end gap-2">
                                    {#if member.hasMeasurement}
                                        <a
                                            href="/admin/group-orders/{order.id}/members/{member.id}/measurement/view"
                                            class="text-green-600 hover:underline"
                                        >
                                            View / 查看
                                        </a>
                                    {/if}
                                    <a
                                        href="/admin/group-orders/{order.id}/members/{member.id}/measurement"
                                        class="text-blue-600 hover:underline"
                                    >
                                        {member.hasMeasurement ? 'Edit / 编辑' : 'Add / 添加'}
                                    </a>
                                    <button
                                        type="button"
                                        on:click={() => confirmDelete(member.id, member.full_name)}
                                        class="text-red-600 hover:underline"
                                    >
                                        Delete / 删除
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>

</div>

<!-- Delete Confirmation Modal -->
{#if deleteConfirm.show}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 class="text-xl font-semibold mb-4 text-gray-900">
                Confirm Delete（确认删除）
            </h2>
            <p class="mb-6 text-gray-700">
                Are you sure you want to delete member <strong>{deleteConfirm.memberName}</strong> from this group order?
                <br /><br />
                确定要从团体订单中删除成员 <strong>{deleteConfirm.memberName}</strong> 吗？
                <br /><br />
                <span class="text-red-600 text-sm">
                    ⚠️ This action cannot be undone. The member's measurement data will also be deleted.
                </span>
            </p>
            <form method="POST" action="?/deleteMember" class="flex gap-3">
                <input type="hidden" name="memberId" value={deleteConfirm.memberId} />
                <button
                    type="submit"
                    class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Yes, Delete（确认删除）
                </button>
                <button
                    type="button"
                    on:click={cancelDelete}
                    class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                    Cancel（取消）
                </button>
            </form>
        </div>
    </div>
{/if}
