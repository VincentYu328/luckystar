<script>
	export let data;

	const user = data.user;
	const stats = data.stats;
</script>

<div class="space-y-8">

	<h1 class="text-3xl font-semibold tracking-tight">
		Welcome, {user.full_name}（欢迎，{user.full_name}）
	</h1>

	<p class="text-gray-600">
		Here is an overview of your store's recent activity.
		<br />
		以下为门店近期运营概览。
	</p>

	<!-- ====================
	     Overview Cards 概览卡片
	==================== -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

		<!-- 今日订单 -->
		<div class="p-6 bg-white border rounded-lg shadow-sm">
			<div class="text-gray-500 text-sm">
				Today's Orders（今日订单）
			</div>
			<div class="text-3xl font-semibold mt-2">
				{stats.today_orders}
			</div>
		</div>

		<!-- 待处理订单 -->
		<div class="p-6 bg-white border rounded-lg shadow-sm">
			<div class="text-gray-500 text-sm">
				Pending Orders（待处理订单）
			</div>
			<div class="text-3xl font-semibold mt-2 text-blue-700">
				{stats.pending_orders}
			</div>
		</div>

		<!-- 产品总数 -->
		<div class="p-6 bg-white border rounded-lg shadow-sm">
			<div class="text-gray-500 text-sm">
				Total Products（产品总数）
			</div>
			<div class="text-3xl font-semibold mt-2">
				{stats.total_products}
			</div>
		</div>

		<!-- 库存总量 -->
		<div class="p-6 bg-white border rounded-lg shadow-sm">
			<div class="text-gray-500 text-sm">
				Total Inventory Quantity（库存总量）
			</div>
			<div class="text-3xl font-semibold mt-2">
				{stats.total_inventory_qty}
			</div>
		</div>

		<!-- 今日销售额 -->
		<div class="p-6 bg-white border rounded-lg shadow-sm">
			<div class="text-gray-500 text-sm">
				Today's Sales（今日销售额）
			</div>
			<div class="text-3xl font-semibold mt-2 text-green-700">
				${stats.today_sales.toFixed(2)}
			</div>
		</div>

	</div>

	<!-- ====================
	     Charts Placeholder 图表占位
	==================== -->
	<div class="mt-10 p-6 bg-gray-50 border rounded-lg text-gray-500 text-center">
		Charts and recent activity logs coming soon...
		<br />
		图表与近期操作日志即将上线……
	</div>

</div>
