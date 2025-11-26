<script>
	import { page } from '$app/stores';

	const nav = [
		// Dashboard
		{ label: "Dashboard（仪表盘）", icon: "📊", href: "/admin/dashboard" },

		// Products & Inventory
		{ label: "Products（产品管理）", icon: "🧵", href: "/admin/products" },
		{ label: "Inventory（库存管理）", icon: "📦", href: "/admin/inventory" },

		// Orders
		{ label: "Retail Orders（零售订单）", icon: "🧾", href: "/admin/retail-orders" },
		{ label: "Group Orders（团体订单）", icon: "👥", href: "/admin/group-orders" },

		// Customers
		{ label: "Customers（客户管理）", icon: "🙂", href: "/admin/customers" },

		// Payments
		{ label: "Payments（支付记录）", icon: "💲", href: "/admin/payments" },

		// Measurements
		{ label: "Measurements（量体记录）", icon: "📐", href: "/admin/measurements" },

		// Size Charts
		{ label: "Size Charts（尺码表）", icon: "📏", href: "/admin/size-charts" },

		// Users（Staff）
		{ label: "Users（员工）", icon: "👤", href: "/admin/users" },

		// Audit
		{ label: "Audit Log（审计日志）", icon: "📝", href: "/admin/audit" }
	];
</script>

<aside class="w-64 bg-gray-900 text-white min-h-screen p-4 space-y-1">

	{#each nav as item}
		<a
			href={item.href}
			class="
				flex items-center px-4 py-2 rounded cursor-pointer
				hover:bg-gray-700 transition
				{ $page.url.pathname.startsWith(item.href) ? 'bg-gray-800' : '' }
			"
		>
			<span class="mr-3">{item.icon}</span>
			{item.label}
		</a>
	{/each}

</aside>
