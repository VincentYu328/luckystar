<!-- frontend\src\routes\admin\measurements\[id]\edit\+page.svelte -->

<script>
  export let data;
  const m = data.measurement;
</script>

<h1 class="text-3xl font-semibold mb-6">Edit Measurement #{m.id}</h1>

<form method="post" class="space-y-4">

  <div>
    <label>Height</label>
    <input name="height" value={m.height ?? ''} class="border p-2 rounded w-full" />
  </div>

  <div>
    <label>Chest</label>
    <input name="chest" value={m.chest ?? ''} class="border p-2 rounded w-full" />
  </div>

  <div>
    <label>Waist</label>
    <input name="waist" value={m.waist ?? ''} class="border p-2 rounded w-full" />
  </div>

  <div>
    <label>Notes</label>
    <textarea name="notes" class="border p-2 rounded w-full">{m.notes ?? ''}</textarea>
  </div>

  <button class="px-4 py-2 bg-blue-600 text-white rounded">
    Save
  </button>
</form>

<a class="text-blue-600 underline mt-4 block" href={`/admin/measurements/${m.id}`}>
  ← Back
</a>
