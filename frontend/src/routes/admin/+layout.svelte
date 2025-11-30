<script>
	// 注入的后台员工
	export let data;
	const user = data.user;
</script>

<div class="min-h-screen flex bg-gray-100">

	<!-- ===========================
	     Sidebar
	=========================== -->
	<aside class="w-64 bg-white border-r px-6 py-8 space-y-6 hidden md:block">

		<div>
			<div class="text-xl font-semibold tracking-tight">Lucky Star Admin</div>
			<div class="text-gray-500 text-sm mt-1">Hello, {user.full_name}</div>
			<div class="text-blue-600 text-sm font-medium">{user.role}</div>
		</div>

		<nav class="space-y-2">

			<a href="/admin/dashboard"
				class="block px-3 py-2 rounded hover:bg-gray-100">
				📊 Dashboard
			</a>

			<a href="/admin/products"
				class="block px-3 py-2 rounded hover:bg-gray-100">
				🧵 Products
			</a>

			<a href="/admin/inventory"
				class="block px-3 py-2 rounded hover:bg-gray-100">
				📦 Inventory
			</a>

			<a href="/admin/retail-orders"
				class="block px-3 py-2 rounded hover:bg-gray-100">
				🧾 Retail Orders
			</a>

			<a href="/admin/group-orders"
				class="block px-3 py-2 rounded hover:bg-gray-100">
				👥 Group Orders
			</a>

			<a href="/admin/customers"
				class="block px-3 py-2 rounded hover:bg-gray-100">
				🧑‍💼 Customers
			</a>

			<a href="/admin/measurements"
				class="block px-3 py-2 rounded hover:bg-gray-100">
				📐 Measurements
			</a>

			<a href="/admin/size-charts"
				class="block px-3 py-2 rounded hover:bg-gray-100">
				📏 Size Charts
			</a>

			<a href="/admin/payments"
				class="block px-3 py-2 rounded hover:bg-gray-100">
				💰 Payments
			</a>

			<a href="/admin/users"
				class="block px-3 py-2 rounded hover:bg-gray-100">
				🔐 Staff Users
			</a>

			<a href="/admin/audit"
				class="block px-3 py-2 rounded hover:bg-gray-100">
				🗒 Audit Logs
			</a>

		</nav>
	</aside>

	<!-- ===========================
	     Main Content Area
	=========================== -->
	<main class="flex-1 p-6">
		<slot />
	</main>

</div>
