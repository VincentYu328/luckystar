<!-- frontend/src/routes/admin/customers/[id]/edit/+page.svelte -->
<script>
  export let data;
  export let form;  // ⭐ 接收 action 返回的数据

  $: customer = form?.customer ?? data.customer;
  $: values = form?.values ?? {};
  $: errorMessage = form?.error ?? null;
  $: successMessage = form?.success ?? false;

  const fieldValue = (field, fallback) => values[field] ?? fallback ?? '';
</script>

<div class="max-w-xl space-y-6">
  <h1 class="text-2xl font-semibold">Edit Customer（编辑客户）</h1>

  {#if successMessage}
    <div class="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
      Customer updated successfully!（客户信息已更新）
    </div>
  {/if}

  {#if errorMessage}
    <div class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
      {errorMessage}
    </div>
  {/if}

  <form method="POST" class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-1">Full Name（姓名）</label>
      <input
        name="full_name"
        class="border rounded p-2 w-full"
        value={fieldValue('full_name', customer.full_name)}
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Phone（电话）</label>
      <input
        name="phone"
        class="border rounded p-2 w-full"
        value={fieldValue('phone', customer.phone)}
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Email（邮箱）</label>
      <input
        name="email"
        type="email"
        class="border rounded p-2 w-full"
        value={fieldValue('email', customer.email)}
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Address（地址）</label>
      <input
        name="address"
        class="border rounded p-2 w-full"
        value={fieldValue('address', customer.address)}
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">WeChat（微信）</label>
      <input
        name="wechat"
        class="border rounded p-2 w-full"
        value={fieldValue('wechat', customer.wechat)}
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">WhatsApp</label>
      <input
        name="whatsapp"
        class="border rounded p-2 w-full"
        value={fieldValue('whatsapp', customer.whatsapp)}
      />
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Account Status（账号状态）</label>
      <select
        name="is_active"
        class="border rounded p-2 w-full"
      >
        <option
          value="1"
          selected={fieldValue('is_active', customer.is_active ? '1' : '0') === '1'}
        >
          Active（启用）
        </option>
        <option
          value="0"
          selected={fieldValue('is_active', customer.is_active ? '1' : '0') === '0'}
        >
          Inactive（停用）
        </option>
      </select>
    </div>

    <div class="flex gap-4">
      <button type="submit" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Save Changes（保存修改）
      </button>
      <a href={`/admin/customers/${customer.id}`} class="bg-gray-200 px-6 py-3 rounded-lg inline-block text-center">
        Cancel（取消）
      </a>
    </div>
  </form>
</div>