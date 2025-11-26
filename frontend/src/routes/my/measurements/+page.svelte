<script>
  export let data;

  let user = data.user;
  let m = data.measurements;

  function goToAdd() {
    window.location.href = "/checkout/custom/measurement";
  }
</script>

<div class="max-w-4xl mx-auto py-10 space-y-10">

  <h1 class="text-3xl font-semibold tracking-tight">
    My Measurements
  </h1>

  {#if !m}
    <div class="p-6 border rounded-lg bg-gray-50 text-center space-y-3">
      <div class="text-gray-700 text-lg">
        You have no saved measurements yet.
      </div>
      <button
        on:click={goToAdd}
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
      >
        Add Measurements
      </button>
    </div>

  {:else}

    <div class="space-y-6">

      <!-- Basic Body Data -->
      <div class="border rounded-lg p-6 bg-gray-50 space-y-4">
        <h2 class="text-xl font-semibold">Basic</h2>

        <div class="grid grid-cols-2 gap-4 text-gray-700">
          <div><span class="font-medium">Height:</span> {m.height} cm</div>
          <div><span class="font-medium">Weight:</span> {m.weight ?? '—'} kg</div>
        </div>
      </div>

      <!-- Upper Body -->
      <div class="border rounded-lg p-6 bg-gray-50 space-y-4">
        <h2 class="text-xl font-semibold">Upper Body</h2>

        <div class="grid grid-cols-2 gap-4 text-gray-700">
          <div><span class="font-medium">Chest:</span> {m.chest} cm</div>
          <div><span class="font-medium">Shoulder:</span> {m.shoulder_width} cm</div>
          <div><span class="font-medium">Sleeve:</span> {m.sleeve_length} cm</div>
          <div><span class="font-medium">Neck:</span> {m.neck ?? '—'} cm</div>
        </div>
      </div>

      <!-- Lower Body -->
      <div class="border rounded-lg p-6 bg-gray-50 space-y-4">
        <h2 class="text-xl font-semibold">Lower Body</h2>

        <div class="grid grid-cols-2 gap-4 text-gray-700">
          <div><span class="font-medium">Waist:</span> {m.waist} cm</div>
          <div><span class="font-medium">Hip:</span> {m.hip} cm</div>
          <div><span class="font-medium">Inseam:</span> {m.inseam} cm</div>
          <div><span class="font-medium">Notes:</span> {m.notes || '—'}</div>
        </div>
      </div>

      <!-- Update Button -->
      <div class="pt-4">
        <button
          on:click={goToAdd}
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Update Measurements
        </button>
      </div>

    </div> <!-- END space-y-6 -->

  {/if}

</div>
