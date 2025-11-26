<script>
    export let data;

    const customer = data.customer;
    const groupOrders = data.groupOrders;
    const measurements = data.measurements;   // ← 必须加
</script>

<div class="space-y-10 max-w-3xl">

    <h1 class="text-3xl font-semibold tracking-tight">
        Customer #{customer.id}（客户详情）
    </h1>

    <!-- ========================= -->
    <!-- 基本信息 -->
    <!-- ========================= -->
    <section class="bg-white border rounded-lg p-6 space-y-3">
        <h2 class="text-xl font-semibold mb-2">Basic Info（基本信息）</h2>

        <div class="text-gray-700 space-y-1">
            <p><strong>Name（姓名）:</strong> {customer.full_name}</p>
            <p><strong>Phone（电话）:</strong> {customer.phone}</p>
            <p><strong>Email（邮箱）:</strong> {customer.email}</p>

            {#if customer.address}
                <p><strong>Address（地址）:</strong> {customer.address}</p>
            {/if}

            {#if customer.wechat}
                <p><strong>WeChat:</strong> {customer.wechat}</p>
            {/if}

            {#if customer.whatsapp}
                <p><strong>WhatsApp:</strong> {customer.whatsapp}</p>
            {/if}

            <p>
                <strong>Status（状态）:</strong>
                {customer.is_active ? "Active（启用）" : "Inactive（停用）"}
            </p>
        </div>

        <a
            href={`/admin/customers/${customer.id}/edit`}
            class="inline-block mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
            Edit Customer（编辑客户）
        </a>
    </section>


    <!-- ========================= -->
    <!-- 团体订单 -->
    <!-- ========================= -->
    <section class="bg-white border rounded-lg p-6 space-y-3">
        <h2 class="text-xl font-semibold mb-2">Group Orders（团体订单）</h2>

        {#if groupOrders.length === 0}
            <p class="text-gray-500">No group orders（无团体订单）</p>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="p-3">Group Name</th>
                            <th class="p-3">Event</th>
                            <th class="p-3">Members</th>
                            <th class="p-3">Created</th>
                            <th class="p-3"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each groupOrders as g}
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-3">{g.group_name}</td>
                            <td class="p-3">{g.event_name ?? '—'}</td>
                            <td class="p-3">{g.expected_members}</td>
                            <td class="p-3">{new Date(g.created_at).toLocaleString()}</td>
                            <td class="p-3 text-right">
                                <a
                                    href={`/admin/group-orders/${g.id}`}
                                    class="text-blue-600 hover:underline"
                                >
                                    View
                                </a>
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/else}
        {/if}
    </section>


    <!-- ========================= -->
    <!-- 量体记录 -->
    <!-- ========================= -->
    <section class="bg-white border rounded-lg p-6 space-y-3">
        <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold mb-2">Measurements（量体记录）</h2>

            <a
                href={`/admin/customers/${customer.id}/measurements/create`}
                class="px-4 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
            >
                + New Measurement
            </a>
        </div>

        {#if measurements.length === 0}
            <p class="text-gray-500">No Measurements（无量体记录）</p>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="p-3">Date</th>
                            <th class="p-3">Gender</th>
                            <th class="p-3">Height</th>
                            <th class="p-3">Waist</th>
                            <th class="p-3"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {#each measurements as m}
                        <tr class="border-b hover:bg-gray-50">
                            <td class="p-3">{new Date(m.created_at).toLocaleDateString()}</td>
                            <td class="p-3">{m.gender}</td>
                            <td class="p-3">{m.height}</td>
                            <td class="p-3">{m.waist}</td>
                            <td class="p-3 text-right">
                                <a
                                    href={`/admin/measurements/${m.id}`}
                                    class="text-blue-600 hover:underline"
                                >
                                    View（查看）
                                </a>
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/else}
        {/if}
    </section>

</div>
