<!-- frontend\src\routes\checkout\custom\+page.svelte -->

<script>
  export let data;
</script>

<div class="max-w-3xl mx-auto py-10 space-y-8">
  <h1 class="text-3xl font-semibold">Custom Order</h1>

  <p class="text-gray-700">
    For custom garments, you need to provide your body measurements.
  </p>

  {#if data.hasMeasurements}
    <a
      href="/checkout"
      class="block bg-green-600 text-white px-6 py-3 rounded-lg text-center hover:bg-green-700"
    >
      Use Existing Measurements → Continue
    </a>

    <a
      href="/checkout/custom/measurement"
      class="block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-700"
    >
      Update Measurements
    </a>

  {:else}

    <a
      href="/checkout/custom/measurement"
      class="block bg-blue-600 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-700"
    >
      Add Measurements
    </a>

  {/if}
</div>