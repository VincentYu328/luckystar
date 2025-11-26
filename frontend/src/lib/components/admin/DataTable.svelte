<script>
	// Props
	export let columns = [];     // [{ key, label }, ...]
	export let rows = [];        // [{ id, ... }, ...]
	export let actions = [];     // [{ label, onClick, color? }]
	export let loading = false;

	// Pagination
	export let page = 1;
	export let pageSize = 20;
	export let total = 0;
	export let onPageChange = () => {};

	// Sorting
	let sortKey = null;
	let sortDir = 'asc'; // or 'desc'

	function sort(col) {
		if (sortKey === col.key) {
			// Toggle asc/desc
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortKey = col.key;
			sortDir = 'asc';
		}

		// 外部不一定需要排序，这里只 emit sort 信息
		const event = new CustomEvent("sort", {
			detail: { key: sortKey, dir: sortDir }
		});
		dispatchEvent(event);
	}
</script>

<div class="bg-white border rounded-lg overflow-hidden">
	
	<!-- Loading overlay -->
	{#if loading}
		<div class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
			<div class="text-gray-600 text-sm">Loading…（加载中…）</div>
		</div>
	{/if}

	<table class="w-full table-auto border-collapse">
		<thead class="bg-gray-100 border-b">
			<tr>
				{#each columns as col}
					<th
						class="p-3 text-left text-sm font-medium text-gray-700 cursor-pointer select-none"
						on:click={() => sort(col)}
					>
						<div class="flex items-center gap-1">
							{col.label}

							{#if sortKey === col.key}
								{#if sortDir === 'asc'}
									<span>↑</span>
								{:else}
									<span>↓</span>
								{/if}
							{/if}
						</div>
					</th>
				{/each}

				<!-- Actions Column -->
				{#if actions.length > 0}
				<th class="p-3 text-right text-sm font-medium text-gray-700">
					Actions（操作）
				</th>
				{/if}
			</tr>
		</thead>

		<tbody>
			{#if rows.length === 0}
				<tr>
					<td colspan={columns.length + (actions.length > 0 ? 1 : 0)}
						class="p-6 text-center text-gray-500 text-sm">
						No data found（暂无数据）
					</td>
				</tr>
			{:else}
				{#each rows as row}
					<tr class="border-b hover:bg-gray-50 text-sm">
						
						{#each columns as col}
							<td class="p-3">
								{row[col.key] ?? "—"}
							</td>
						{/each}

						{#if actions.length > 0}
							<td class="p-3 text-right space-x-2">
								{#each actions as act}
									<button
										class="px-2 py-1 rounded text-xs 
											{act.color === 'red'
												? 'bg-red-100 text-red-700'
												: act.color === 'green'
												? 'bg-green-100 text-green-700'
												: 'bg-gray-100 text-gray-700'
											}"
										on:click={() => act.onClick(row)}
									>
										{act.label}
									</button>
								{/each}
							</td>
						{/if}

					</tr>
				{/each}
			{/if}
		</tbody>
	</table>

	<!-- Pagination -->
	<div class="flex items-center justify-between px-4 py-3 bg-gray-50 text-sm text-gray-600">

		<div>
			Page {page} / {Math.ceil(total / pageSize)}  
			（共 {total} 条记录）
		</div>

		<div class="space-x-2">
			<button
				class="px-3 py-1 border rounded disabled:opacity-50"
				on:click={() => onPageChange(page - 1)}
				disabled={page <= 1}
			>
				Prev（上一页）
			</button>

			<button
				class="px-3 py-1 border rounded disabled:opacity-50"
				on:click={() => onPageChange(page + 1)}
				disabled={page >= Math.ceil(total / pageSize)}
			>
				Next（下一页）
			</button>
		</div>

	</div>

</div>
