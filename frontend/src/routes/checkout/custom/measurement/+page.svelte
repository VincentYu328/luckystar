<!-- frontend\src\routes\checkout\custom\measurement\+page.svelte -->

<script>
  export let data;

  let m = data.measurements || {
    height: '',
    chest: '',
    waist: '',
    hip: '',
    shoulder_width: '',
    sleeve_length: '',
    inseam: ''
  };
</script>

<div class="max-w-2xl mx-auto py-10 space-y-8">

  <h1 class="text-3xl font-semibold">Your Measurements</h1>

  <form method="POST" class="space-y-6">

    <div class="grid grid-cols-2 gap-6">

      <div>
        <label class="text-sm">Height (cm)</label>
        <input name="height" class="border rounded p-2 w-full" bind:value={m.height} />
      </div>

      <div>
        <label class="text-sm">Chest (cm)</label>
        <input name="chest" class="border rounded p-2 w-full" bind:value={m.chest} />
      </div>

      <div>
        <label class="text-sm">Waist (cm)</label>
        <input name="waist" class="border rounded p-2 w-full" bind:value={m.waist} />
      </div>

      <div>
        <label class="text-sm">Hip (cm)</label>
        <input name="hip" class="border rounded p-2 w-full" bind:value={m.hip} />
      </div>

      <div>
        <label class="text-sm">Shoulder Width (cm)</label>
        <input name="shoulder_width" class="border rounded p-2 w-full" bind:value={m.shoulder_width} />
      </div>

      <div>
        <label class="text-sm">Sleeve Length (cm)</label>
        <input name="sleeve_length" class="border rounded p-2 w-full" bind:value={m.sleeve_length} />
      </div>

      <div>
        <label class="text-sm">Inseam (cm)</label>
        <input name="inseam" class="border rounded p-2 w-full" bind:value={m.inseam} />
      </div>

    </div>

    <button
      type="submit"
      name="action"
      value="save"
      class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      Save Measurements
    </button>

  </form>
</div>
