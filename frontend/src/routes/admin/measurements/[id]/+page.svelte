<!-- frontend\src\routes\admin\measurements\[id]\+page.svelte -->

<script>
  export let data;

  const { measurement, customer, groupMember, isGroupMember } = data;

  function confirmDelete(e) {
    if (!confirm("Delete this measurement?")) {
      e.preventDefault();
    }
  }

  // Determine back link
  $: backLink = isGroupMember ? '/admin/measurements' : `/admin/customers/${customer?.id}`;
  $: displayName = isGroupMember ? groupMember?.full_name : customer?.full_name;
</script>

<div class="max-w-3xl mx-auto py-10 space-y-8">

  <div>
    <a href="/admin/measurements" class="text-blue-600 hover:underline text-sm mb-2 inline-block">
      ← Back to Measurements
    </a>
    <h1 class="text-3xl font-semibold tracking-tight">
      Measurement Details（量体详情）
    </h1>
  </div>

  <!-- Customer or Group Member info -->
  <div class="p-4 bg-white border rounded-lg space-y-1">
    {#if isGroupMember}
      <div><strong>Type:</strong> Group Member（团体成员）</div>
      <div><strong>Name:</strong> {displayName}</div>
      <div><strong>Group Member ID:</strong> {groupMember.id}</div>
    {:else}
      <div><strong>Type:</strong> Customer（客户）</div>
      <div><strong>Customer:</strong> {customer.full_name}</div>
      <div><strong>Phone:</strong> {customer.phone || '—'}</div>
      <div><strong>Email:</strong> {customer.email || '—'}</div>
    {/if}
  </div>

  <!-- Measurement fields -->
  <div class="p-4 bg-white border rounded-lg space-y-3">
    <h2 class="text-lg font-semibold border-b pb-2 mb-3">Measurement Data（量体数据）</h2>
    <div class="grid grid-cols-2 gap-3">
      <div><strong>Source:</strong> {measurement.source ?? "—"}</div>
      <div><strong>Unit:</strong> {measurement.unit ?? "cm"}</div>
      <div><strong>Height:</strong> {measurement.height ?? "—"} {measurement.unit || 'cm'}</div>
      <div><strong>Chest:</strong> {measurement.chest ?? "—"} {measurement.unit || 'cm'}</div>
      <div><strong>Waist:</strong> {measurement.waist ?? "—"} {measurement.unit || 'cm'}</div>
      <div><strong>Hip:</strong> {measurement.hip ?? "—"} {measurement.unit || 'cm'}</div>
      <div><strong>Shoulder Width:</strong> {measurement.shoulder_width ?? "—"} {measurement.unit || 'cm'}</div>
      <div><strong>Sleeve Length:</strong> {measurement.sleeve_length ?? "—"} {measurement.unit || 'cm'}</div>
      <div><strong>Inseam:</strong> {measurement.inseam ?? "—"} {measurement.unit || 'cm'}</div>
    </div>
    {#if measurement.notes}
      <div class="col-span-2 pt-3 border-t">
        <strong>Notes:</strong>
        <div class="mt-1 text-gray-700 whitespace-pre-wrap">{measurement.notes}</div>
      </div>
    {/if}
    <div class="col-span-2 pt-3 border-t text-sm text-gray-600">
      <strong>Measured at:</strong> {new Date(measurement.measured_at).toLocaleString('zh-CN')}
    </div>
  </div>

  <!-- Buttons -->
  <div class="flex gap-4">
    <a
      href={backLink}
      class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
    >
      Back（返回）
    </a>

    <form method="post" action="?/delete">
      <button
        type="submit"
        class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        on:click={confirmDelete}
      >
        Delete（删除）
      </button>
    </form>
  </div>

</div>
