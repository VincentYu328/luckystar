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

  {#if data.successMessage}
    <div class="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
      {data.successMessage}
    </div>
  {/if}

  <form method="POST" class="space-y-6">

    <div class="grid grid-cols-2 gap-6">

      <div>
        <label class="text-sm" for="height">Height (cm)</label>
        <input
          id="height"
          name="height"
          class="border rounded p-2 w-full"
          bind:value={m.height}
        />
      </div>

      <div>
        <label class="text-sm" for="chest">Chest (cm)</label>
        <input
          id="chest"
          name="chest"
          class="border rounded p-2 w-full"
          bind:value={m.chest}
        />
      </div>

      <div>
        <label class="text-sm" for="waist">Waist (cm)</label>
        <input
          id="waist"
          name="waist"
          class="border rounded p-2 w-full"
          bind:value={m.waist}
        />
      </div>

      <div>
        <label class="text-sm" for="hip">Hip (cm)</label>
        <input
          id="hip"
          name="hip"
          class="border rounded p-2 w-full"
          bind:value={m.hip}
        />
      </div>

      <div>
        <label class="text-sm" for="shoulder">Shoulder Width (cm)</label>
        <input
          id="shoulder"
          name="shoulder_width"
          class="border rounded p-2 w-full"
          bind:value={m.shoulder_width}
        />
      </div>

      <div>
        <label class="text-sm" for="sleeve">Sleeve Length (cm)</label>
        <input
          id="sleeve"
          name="sleeve_length"
          class="border rounded p-2 w-full"
          bind:value={m.sleeve_length}
        />
      </div>

      <div>
        <label class="text-sm" for="inseam">Inseam (cm)</label>
        <input
          id="inseam"
          name="inseam"
          class="border rounded p-2 w-full"
          bind:value={m.inseam}
        />
      </div>

    </div>

    <button
      type="submit"
      class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      Save Measurements
    </button>

  </form>
</div>