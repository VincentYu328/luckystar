<!-- frontend\src\routes\my\measurements\+page.svelte -->

<script>
  import { goto } from '$app/navigation';
  export let data;

  const { user, measurements: m } = data;

  // 统一跳转到编辑页（新增或更新都走这里）
  function goToEdit() {
    goto('/my/measurements/edit');
  }
</script>

<div class="max-w-4xl mx-auto py-10 space-y-10">

  <div class="flex items-center justify-between">
    <h1 class="text-3xl font-semibold tracking-tight">
      My Measurements
    </h1>
  </div>

  {#if !m}
    <!-- 还没有任何测量数据 -->
    <div class="p-8 border rounded-lg bg-gray-50 text-center space-y-6">
      <div class="text-gray-700 text-lg">
        You have no saved measurements yet.
      </div>
      <button 
        on:click={goToEdit} 
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Add Measurements
      </button>
    </div>

  {:else}
    <!-- 已有数据，展示 -->
    <div class="space-y-8">

      <!-- 提示信息 - 一旦有 measurements 就显示 -->
      <div class="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <p class="text-blue-800 font-medium mb-2">
          ✓ Your measurements have been recorded.
        </p>
        <p class="text-blue-700 text-sm">
          Please contact us if you have any concerns about the measurements.
        </p>
      </div>

      <!-- Basic -->
      <div class="border rounded-lg p-6 bg-gray-50">
        <h2 class="text-xl font-semibold mb-4">Basic</h2>
        <div class="grid grid-cols-2 gap-4 text-gray-700">
          <div><span class="font-medium">Height:</span> {m.height} cm</div>
          <div><span class="font-medium">Weight:</span> {m.weight ?? '—'} kg</div>
        </div>
      </div>

      <!-- Upper Body -->
      <div class="border rounded-lg p-6 bg-gray-50">
        <h2 class="text-xl font-semibold mb-4">Upper Body</h2>
        <div class="grid grid-cols-2 gap-4 text-gray-700">
          <div><span class="font-medium">Chest:</span> {m.chest} cm</div>
          <div><span class="font-medium">Shoulder:</span> {m.shoulder_width} cm</div>
          <div><span class="font-medium">Sleeve:</span> {m.sleeve_length} cm</div>
          <div><span class="font-medium">Neck:</span> {m.neck ?? '—'} cm</div>
        </div>
      </div>

      <!-- Lower Body -->
      <div class="border rounded-lg p-6 bg-gray-50">
        <h2 class="text-xl font-semibold mb-4">Lower Body</h2>
        <div class="grid grid-cols-2 gap-4 text-gray-700">
          <div><span class="font-medium">Waist:</span> {m.waist} cm</div>
          <div><span class="font-medium">Hip:</span> {m.hip} cm</div>
          <div><span class="font-medium">Inseam:</span> {m.inseam} cm</div>
        </div>
      </div>

      <!-- Notes (如果有的话单独显示) -->
      {#if m.notes}
        <div class="border rounded-lg p-6 bg-gray-50">
          <h2 class="text-xl font-semibold mb-4">Notes</h2>
          <p class="text-gray-700">{m.notes}</p>
        </div>
      {/if}

      <!-- 不再显示 Update Measurements 按钮 -->

    </div>
  {/if}

</div>