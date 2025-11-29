<!-- src/routes/my/measurements/edit/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation'; // ⭐ 添加这个
  
  export let data;
  export let form;

  let m = form?.data || data.measurements || {
    height: '', weight: '', chest: '', waist: '', hip: '',
    shoulder_width: '', sleeve_length: '', inseam: '', neck: '', notes: ''
  };

  let saving = false;
</script>

<div class="max-w-2xl mx-auto py-10">
  
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-semibold">
      {#if data.measurements}Update{:else}Add{/if} Measurements
    </h1>
    
    <a 
      href="/my/measurements" 
      class="text-gray-500 hover:text-gray-700 transition"
    >
      Cancel
    </a>
  </div>

  <form 
    method="POST" 
    class="space-y-6"
    use:enhance={() => {
      saving = true;
      console.log('🚀 [CLIENT] Form submitting...');
      return async ({ result, update }) => {
        // ⭐ 如果成功，先刷新所有数据
        if (result.type === 'redirect') {
          await invalidateAll(); // 强制重新加载所有 load 函数
          console.log('🔄 [CLIENT] Data invalidated, now redirecting...');
        }
        await update();
        saving = false;
        console.log('✅ [CLIENT] Form submission complete');
      };
    }} 
  >
    
    {#if form?.error}
      <div class="p-4 bg-red-50 text-red-700 border border-red-200 rounded">
        {form.error}
      </div>
    {/if}

    <div class="grid grid-cols-2 gap-6">
      
      <div>
        <label class="block text-sm font-medium mb-1">Height (cm) *</label>
        <input required type="number" step="0.1" name="height" bind:value={m.height}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Weight (kg)</label>
        <input type="number" step="0.1" name="weight" bind:value={m.weight}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Chest (cm) *</label>
        <input required type="number" step="0.1" name="chest" bind:value={m.chest}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Waist (cm) *</label>
        <input required type="number" step="0.1" name="waist" bind:value={m.waist}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Hip (cm) *</label>
        <input required type="number" step="0.1" name="hip" bind:value={m.hip}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Shoulder Width (cm) *</label>
        <input required type="number" step="0.1" name="shoulder_width" bind:value={m.shoulder_width}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Sleeve Length (cm) *</label>
        <input required type="number" step="0.1" name="sleeve_length" bind:value={m.sleeve_length}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Inseam (cm) *</label>
        <input required type="number" step="0.1" name="inseam" bind:value={m.inseam}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Neck (cm)</label>
        <input type="number" step="0.1" name="neck" bind:value={m.neck}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
      </div>

      <div class="col-span-2">
        <label class="block text-sm font-medium mb-1">Notes</label>
        <textarea rows="3" name="notes" bind:value={m.notes}
                  class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"></textarea>
      </div>

    </div>

    <button 
      type="submit" 
      disabled={saving}
      class="mt-6 w-full bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
    >
      {saving ? 'Saving...' : 'Save Measurements'}
    </button>
  </form>
</div>