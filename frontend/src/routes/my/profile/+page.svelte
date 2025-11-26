<!-- frontend\src\routes\my\profile\+page.svelte -->

<script>
  export let data;

  let user = data.user;

  let full_name = user.full_name || '';
  let email = user.email || '';
  let phone = user.phone || '';
</script>

<div class="max-w-4xl mx-auto py-10 space-y-10">
  <h1 class="text-3xl font-semibold tracking-tight">
    My Profile
  </h1>

  {#if data.successMessage}
    <div class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
      {data.successMessage}
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
    <!-- Left Panel -->
    <div class="space-y-6">
      <form method="POST" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700" for="full_name">Full Name</label>
          <input
            id="full_name"
            class="mt-1 w-full border rounded px-3 py-2"
            name="full_name"
            bind:value={full_name}
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700" for="email">Email</label>
          <input
            id="email"
            class="mt-1 w-full border rounded px-3 py-2"
            type="email"
            bind:value={email}
            disabled
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700" for="phone">Phone</label>
          <input
            id="phone"
            class="mt-1 w-full border rounded px-3 py-2"
            name="phone"
            bind:value={phone}
            placeholder="Optional"
          />
        </div>

        <button
          type="submit"
          class="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>

    <!-- Right Panel -->
    <div class="bg-gray-50 border rounded-lg p-6 space-y-4">
      <h2 class="text-xl font-semibold">Account Info</h2>

      <div class="text-gray-700">
        <span class="font-medium">Customer ID:</span>
        {user.id}
      </div>

      <div class="text-gray-700">
        <span class="font-medium">Role:</span>
        Customer
      </div>

      <div class="text-gray-700">
        <span class="font-medium">Email:</span>
        {user.email}
      </div>

      <div class="text-gray-700">
        <span class="font-medium">Status:</span>
        <span class="text-green-700 font-semibold">Active</span>
      </div>

      <div class="text-gray-400 text-sm">
        Profile information is synced to your Lucky Star account.
      </div>
    </div>
  </div>
</div>