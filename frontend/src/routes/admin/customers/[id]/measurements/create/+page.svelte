<!-- frontend/src/routes/admin/customers/[id]/measurements/create/+page.svelte -->
<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { notifications } from '$lib/stores/notifications.js';

  export let data;
  export let form;

  // 回填
  $: values = form?.values ?? {};

  $: gender = values.gender ?? '';
  $: height = values.height ?? '';
  $: weight = values.weight ?? '';
  $: chest = values.chest ?? '';
  $: waist = values.waist ?? '';
  $: hips = values.hips ?? '';
  $: shoulder = values.shoulder ?? '';
  $: sleeve = values.sleeve ?? '';
  $: inseam = values.inseam ?? '';
  $: outseam = values.outseam ?? '';
  $: thigh = values.thigh ?? '';
  $: calf = values.calf ?? '';
  $: neckline = values.neckline ?? '';
  $: notes = values.notes ?? '';

  // SSR-safe redirect
  $: formResult = $page.form;

  onMount(() => {
    if (formResult?.success) {
      notifications.success(formResult.message || "量体记录创建成功！");
      goto(`/admin/customers/${data.customer_id}`);
    }
  });

  // browser-only confirm
  let doConfirm = false;
  onMount(() => (doConfirm = true));

  function confirmBeforeSubmit(e) {
    if (doConfirm && !confirm("请确认量体数据是否准确？")) {
      e.preventDefault();
    }
  }
</script>

<div class="max-w-4xl mx-auto p-6">
  <h1 class="text-3xl font-bold mb-8 text-gray-800">
    New Measurement（为客户 #{data.customer_id} 新增量体记录）
  </h1>

  {#if form?.error}
    <div class="mb-6 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg">
      ❌ {form.error}
    </div>
  {/if}

  <form method="POST" class="space-y-8" on:submit={confirmBeforeSubmit}>
    <input type="hidden" name="customer_id" value={data.customer_id} />

    <!-- 性别 -->
    <div>
      <label for="gender" class="block text-sm font-medium text-gray-700 mb-2">Gender（性别）</label>
      <select id="gender" name="gender" bind:value={gender} class="w-full px-4 py-2 border rounded-lg">
        <option value="">— 请选择 —</option>
        <option value="male">Male（男）</option>
        <option value="female">Female（女）</option>
      </select>
    </div>

    <!-- 基本信息 -->
    <div>
      <h2 class="text-xl font-semibold mb-4 text-gray-700">Basic Info（基本信息）</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div>
          <label for="height" class="block text-sm font-medium text-gray-700 mb-2">Height（身高 cm）</label>
          <input id="height" name="height" type="number" step="0.1" bind:value={height} class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label for="weight" class="block text-sm font-medium text-gray-700 mb-2">Weight（体重 kg）</label>
          <input id="weight" name="weight" type="number" step="0.1" bind:value={weight} class="w-full px-4 py-2 border rounded-lg" />
        </div>

      </div>
    </div>

    <!-- 上身 -->
    <div>
      <h2 class="text-xl font-semibold mb-4 text-gray-700">Upper Body（上身）</h2>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">

        <div>
          <label for="chest" class="block text-sm font-medium text-gray-700 mb-2">Chest</label>
          <input id="chest" name="chest" type="number" step="0.1" bind:value={chest} class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label for="waist" class="block text-sm font-medium text-gray-700 mb-2">Waist</label>
          <input id="waist" name="waist" type="number" step="0.1" bind:value={waist} class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label for="shoulder" class="block text-sm font-medium text-gray-700 mb-2">Shoulder</label>
          <input id="shoulder" name="shoulder" type="number" step="0.1" bind:value={shoulder} class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label for="sleeve" class="block text-sm font-medium text-gray-700 mb-2">Sleeve</label>
          <input id="sleeve" name="sleeve" type="number" step="0.1" bind:value={sleeve} class="w-full px-4 py-2 border rounded-lg" />
        </div>

      </div>
    </div>

    <!-- 下身 -->
    <div>
      <h2 class="text-xl font-semibold mb-4 text-gray-700">Lower Body（下身）</h2>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">

        <div>
          <label for="hips" class="block text-sm font-medium text-gray-700 mb-2">Hips</label>
          <input id="hips" name="hips" type="number" step="0.1" bind:value={hips} class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label for="inseam" class="block text-sm font-medium text-gray-700 mb-2">Inseam</label>
          <input id="inseam" name="inseam" type="number" step="0.1" bind:value={inseam} class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label for="outseam" class="block text-sm font-medium text-gray-700 mb-2">Outseam</label>
          <input id="outseam" name="outseam" type="number" step="0.1" bind:value={outseam} class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label for="thigh" class="block text-sm font-medium text-gray-700 mb-2">Thigh</label>
          <input id="thigh" name="thigh" type="number" step="0.1" bind:value={thigh} class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label for="calf" class="block text-sm font-medium text-gray-700 mb-2">Calf</label>
          <input id="calf" name="calf" type="number" step="0.1" bind:value={calf} class="w-full px-4 py-2 border rounded-lg" />
        </div>

        <div>
          <label for="neckline" class="block text-sm font-medium text-gray-700 mb-2">Neckline</label>
          <input id="neckline" name="neckline" type="number" step="0.1" bind:value={neckline} class="w-full px-4 py-2 border rounded-lg" />
        </div>

      </div>
    </div>

    <!-- 备注 -->
    <div>
      <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">Notes（备注）</label>
      <textarea id="notes" name="notes" rows="4" bind:value={notes} class="w-full px-4 py-3 border rounded-lg"></textarea>
    </div>

    <div class="flex gap-4 pt-6">
      <button type="submit" class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        确认创建
      </button>

      <a href={`/admin/customers/${data.customer_id}`} class="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
        取消
      </a>
    </div>
  </form>
</div>
