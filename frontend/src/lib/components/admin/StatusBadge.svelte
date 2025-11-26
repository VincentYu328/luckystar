<script>
    export let status = "";
    export let size = "md"; // sm / md

    // 支持的状态 → 配色
    const colorMap = {
        active:    "bg-green-100 text-green-700 border-green-300",
        inactive:  "bg-gray-100 text-gray-600 border-gray-300",

        pending:   "bg-yellow-100 text-yellow-700 border-yellow-300",
        confirmed: "bg-blue-100 text-blue-700 border-blue-300",
        completed: "bg-green-100 text-green-700 border-green-300",
        cancelled: "bg-red-100 text-red-700 border-red-300",

        paid:      "bg-green-100 text-green-700 border-green-300",
        unpaid:    "bg-gray-100 text-gray-600 border-gray-300",
        failed:    "bg-red-100 text-red-700 border-red-300"
    };

    // 中英双语映射
    const labelMap = {
        active:    "Active（启用）",
        inactive:  "Inactive（禁用）",

        pending:   "Pending（待处理）",
        confirmed: "Confirmed（已确认）",
        completed: "Completed（已完成）",
        cancelled: "Cancelled（已取消）",

        paid:      "Paid（已付款）",
        unpaid:    "Unpaid（未付款）",
        failed:    "Failed（失败）"
    };

    $: colorClass = colorMap[status] || "bg-gray-100 text-gray-600 border-gray-300";
    $: label = labelMap[status] || status;
</script>

<span
    class={`inline-block border px-2 py-0.5 rounded text-xs font-medium select-none
        ${size === 'sm' ? 'text-[10px]' : 'text-xs'}
        ${colorClass}
    `}
>
    {label}
</span>
