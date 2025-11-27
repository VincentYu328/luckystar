<!-- frontend\src\routes\admin\measurements\[id]\+page.svelte -->

<script>
  export let data;

  const { measurement, customer } = data;

  function confirmDelete(e) {
    if (!confirm("Delete this measurement?")) {
      e.preventDefault();
    }
  }
</script>

<div class="max-w-3xl mx-auto py-10 space-y-8">

  <h1 class="text-3xl font-semibold tracking-tight">
    Measurement Details（量体详情）
  </h1>

  <!-- Customer info -->
  <div class="p-4 bg-white border rounded-lg space-y-1">
    <div><strong>Customer:</strong> {customer.full_name}</div>
    <div><strong>Phone:</strong> {customer.phone}</div>
    <div><strong>Email:</strong> {customer.email}</div>
  </div>

  <!-- Measurement fields -->
  <div class="p-4 bg-white border rounded-lg space-y-3">
    <div><strong>Gender:</strong> {measurement.gender ?? "—"}</div>
    <div><strong>Height:</strong> {measurement.height ?? "—"}</div>
    <div><strong>Chest:</strong> {measurement.chest ?? "—"}</div>
    <div><strong>Waist:</strong> {measurement.waist ?? "—"}</div>
    <div><strong>Hips:</strong> {measurement.hips ?? "—"}</div>
    <div><strong>Calf:</strong> {measurement.calf ?? "—"}</div>
    <div><strong>Updated at:</strong> {new Date(measurement.updated_at).toLocaleString()}</div>
  </div>

  <!-- Buttons -->
  <div class="flex gap-4">
    <a
      href={`/admin/customers/${customer.id}`}
      class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
    >
      Back
    </a>

    <form method="post" action="?/delete">
      <button
        type="submit"
        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        on:click={confirmDelete}
      >
        Delete
      </button>
    </form>
  </div>

</div>
