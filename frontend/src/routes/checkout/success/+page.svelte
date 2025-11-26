<script>
  import { page } from '$app/stores';
  const orderId = $page.url.searchParams.get('order');
</script>

<div class="max-w-3xl mx-auto py-20 text-center space-y-6">

  <h1 class="text-3xl font-semibold text-green-700">
    Order Submitted Successfully!
  </h1>

  <p class="text-gray-700">
    Your order request has been received. We will contact you soon.
  </p>

  {#if orderId}
    <a
      href={`/my/orders/${orderId}`}
      class="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
    >
      View Order →
    </a>
  {/if}

  <a
    href="/products"
    class="block mt-4 text-gray-600 underline"
  >
    Continue Shopping
  </a>
</div>
