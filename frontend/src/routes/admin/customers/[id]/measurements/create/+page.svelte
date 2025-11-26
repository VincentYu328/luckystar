<script>
    export let data;

    let gender = '';
    let height = '';
    let weight = '';
    let chest = '';
    let waist = '';
    let hips = '';
    let shoulder = '';
    let sleeve = '';
    let inseam = '';
    let outseam = '';
    let thigh = '';
    let calf = '';
    let neckline = '';
    let notes = '';

    function confirmBeforeSubmit(event) {
        const ok = confirm(
            "请再次确认量体数据。一旦提交，将不可修改，以保护后续定制与生产环节的准确性。\n\n是否继续提交？"
        );
        if (!ok) {
            event.preventDefault();
        }
    }
</script>

<div class="max-w-3xl space-y-8">

    <h1 class="text-2xl font-semibold tracking-tight">
        New Measurement（新增量体记录）
    </h1>

    <!-- ⚠ 业务风险警告 -->
    <div class="p-4 border-l-4 border-red-600 bg-red-50 text-red-700 rounded">
        <p class="font-semibold">⚠ 重要提醒</p>
        <p class="mt-1">
            请务必再次核对量体数据。
            <span class="font-medium">一旦提交，将无法修改</span>，
            以保护后续定制与生产环节的准确性。
        </p>
    </div>

    <form
        method="POST"
        class="space-y-6"
        on:submit|preventDefault={confirmBeforeSubmit}
        on:submit={confirmBeforeSubmit}
    >

        <input type="hidden" name="customer_id" value={data.customer_id} />

        <!-- 性别 -->
        <div>
            <label class="block mb-1 font-medium">Gender（性别）</label>
            <select name="gender" bind:value={gender} class="border rounded p-2 w-full">
                <option value="">—</option>
                <option value="male">Male（男）</option>
                <option value="female">Female（女）</option>
            </select>
        </div>

        <!-- 基本身体数据 -->
        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="block mb-1 font-medium">Height（身高）</label>
                <input name="height" bind:value={height} class="border rounded p-2 w-full" />
            </div>

            <div>
                <label class="block mb-1 font-medium">Weight（体重）</label>
                <input name="weight" bind:value={weight} class="border rounded p-2 w-full" />
            </div>
        </div>

        <!-- 上身 -->
        <h2 class="text-lg font-semibold mt-6">Upper Body（上身）</h2>

        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="block mb-1 font-medium">Chest（胸围）</label>
                <input name="chest" bind:value={chest} class="border rounded p-2 w-full" />
            </div>

            <div>
                <label class="block mb-1 font-medium">Waist（腰围）</label>
                <input name="waist" bind:value={waist} class="border rounded p-2 w-full" />
            </div>

            <div>
                <label class="block mb-1 font-medium">Shoulder（肩宽）</label>
                <input name="shoulder" bind:value={shoulder} class="border rounded p-2 w-full" />
            </div>

            <div>
                <label class="block mb-1 font-medium">Sleeve（袖长）</label>
                <input name="sleeve" bind:value={sleeve} class="border rounded p-2 w-full" />
            </div>
        </div>

        <!-- 下身 -->
        <h2 class="text-lg font-semibold mt-6">Lower Body（下身）</h2>

        <div class="grid grid-cols-2 gap-6">
            <div>
                <label class="block mb-1 font-medium">Hips（臀围）</label>
                <input name="hips" bind:value={hips} class="border rounded p-2 w-full" />
            </div>

            <div>
                <label class="block mb-1 font-medium">Inseam（内长）</label>
                <input name="inseam" bind:value={inseam} class="border rounded p-2 w-full" />
            </div>

            <div>
                <label class="block mb-1 font-medium">Outseam（外长）</label>
                <input name="outseam" bind:value={outseam} class="border rounded p-2 w-full" />
            </div>

            <div>
                <label class="block mb-1 font-medium">Thigh（大腿围）</label>
                <input name="thigh" bind:value={thigh} class="border rounded p-2 w-full" />
            </div>

            <div>
                <label class="block mb-1 font-medium">Calf（小腿围）</label>
                <input name="calf" bind:value={calf} class="border rounded p-2 w-full" />
            </div>

            <div>
                <label class="block mb-1 font-medium">Neckline（领围）</label>
                <input name="neckline" bind:value={neckline} class="border rounded p-2 w-full" />
            </div>
        </div>

        <!-- 备注 -->
        <div>
            <label class="block mb-1 font-medium">Notes（备注）</label>
            <textarea
                name="notes"
                bind:value={notes}
                rows="3"
                class="border rounded p-2 w-full"
            ></textarea>
        </div>

        <button
            type="submit"
            name="action"
            value="create"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            on:click={confirmBeforeSubmit}
        >
            Create（创建）
        </button>

    </form>

</div>
