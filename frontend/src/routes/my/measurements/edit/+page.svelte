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
  let showConfirmDialog = false;
  let showSuccessMessage = false;
  let formElement;

  // 检查是否已经锁定（已提交过）
  $: isLocked = data.measurements?.is_locked === 1;

  function handleSubmit(event) {
    // 如果已经锁定，阻止提交
    if (isLocked) {
      event.preventDefault();
      return;
    }

    // 如果还没锁定，显示确认对话框
    event.preventDefault();
    showConfirmDialog = true;
  }

  function confirmSubmit() {
    showConfirmDialog = false;
    // 提交表单
    if (formElement) {
      formElement.requestSubmit();
    }
  }

  function cancelSubmit() {
    showConfirmDialog = false;
  }
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

  {#if isLocked}
    <!-- 已锁定提示 -->
    <div class="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg mb-6">
      <p class="text-yellow-800 font-medium mb-2">
        ⚠️ Your measurements have been submitted and locked.
      </p>
      <p class="text-yellow-700 text-sm">
        Please contact us if you have any concerns about the measurements.
      </p>
    </div>
  {/if}

  <form
    bind:this={formElement}
    method="POST"
    class="space-y-6"
    on:submit={handleSubmit}
    use:enhance={() => {
      saving = true;
      console.log('🚀 [CLIENT] Form submitting...');
      return async ({ result, update }) => {
        saving = false;

        // 如果提交成功，显示成功消息10秒后再重定向
        if (result.type === 'redirect') {
          console.log('✅ [CLIENT] Submission successful, showing success message...');
          showSuccessMessage = true;

          // 等待10秒
          await new Promise(resolve => setTimeout(resolve, 10000));

          // 刷新数据并重定向
          await invalidateAll();
          await update();
          console.log('🔄 [CLIENT] Redirecting...');
        } else {
          // 如果失败，正常处理
          await update();
        }
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
               disabled={isLocked}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Weight (kg)</label>
        <input type="number" step="0.1" name="weight" bind:value={m.weight}
               disabled={isLocked}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Chest (cm) *</label>
        <input required type="number" step="0.1" name="chest" bind:value={m.chest}
               disabled={isLocked}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Waist (cm) *</label>
        <input required type="number" step="0.1" name="waist" bind:value={m.waist}
               disabled={isLocked}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Hip (cm) *</label>
        <input required type="number" step="0.1" name="hip" bind:value={m.hip}
               disabled={isLocked}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Shoulder Width (cm) *</label>
        <input required type="number" step="0.1" name="shoulder_width" bind:value={m.shoulder_width}
               disabled={isLocked}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Sleeve Length (cm) *</label>
        <input required type="number" step="0.1" name="sleeve_length" bind:value={m.sleeve_length}
               disabled={isLocked}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Inseam (cm) *</label>
        <input required type="number" step="0.1" name="inseam" bind:value={m.inseam}
               disabled={isLocked}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1">Neck (cm)</label>
        <input type="number" step="0.1" name="neck" bind:value={m.neck}
               disabled={isLocked}
               class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" />
      </div>

      <div class="col-span-2">
        <label class="block text-sm font-medium mb-1">Notes</label>
        <textarea rows="3" name="notes" bind:value={m.notes}
                  disabled={isLocked}
                  class="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"></textarea>
      </div>

    </div>

    <button
      type="submit"
      disabled={saving || isLocked}
      class="mt-6 w-full bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition"
    >
      {#if isLocked}
        Measurements Locked
      {:else if saving}
        Saving...
      {:else}
        Save Measurements
      {/if}
    </button>
  </form>
</div>

<!-- 确认对话框 -->
{#if showConfirmDialog}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
      <h2 class="text-xl font-bold text-gray-900">Confirm Your Measurements</h2>

      <p class="text-gray-700">
        Please double-check your measurements, as they cannot be changed once submitted and are essential for us to customize your products accurately.
      </p>

      <div class="flex gap-3 pt-4">
        <button
          on:click={confirmSubmit}
          class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition"
        >
          Confirm & Submit
        </button>
        <button
          on:click={cancelSubmit}
          class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- 成功提示消息 -->
{#if showSuccessMessage}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
      <div class="flex items-center justify-center mb-4">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>

      <h2 class="text-xl font-bold text-gray-900 text-center">Success!</h2>

      <div class="space-y-3">
        <p class="text-green-700 font-medium text-center">
          ✓ Your measurements have been successfully submitted.
        </p>
        <p class="text-gray-700 text-sm text-center">
          Please contact us if you have any concerns about the measurements.
        </p>
      </div>

      <div class="pt-4 text-center text-sm text-gray-500">
        Redirecting in a moment...
      </div>
    </div>
  </div>
{/if}