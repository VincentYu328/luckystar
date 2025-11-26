<script>
  // 只保留这一个：全局样式
  import "../app.css";

  // 全局公用组件
  import Header from '$lib/components/common/Header.svelte';
  import Footer from '$lib/components/common/Footer.svelte';
  import Toast from '$lib/components/common/Toast.svelte';
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta
    name="description"
    content="Lucky Star Fashion — Fabrics, Garments & Custom Orders"
  />
  <link rel="icon" href="/favicon.png" />
</svelte:head>

<div class="min-h-screen flex flex-col font-serif">
  <Header />

  <main class="main-body">
    <slot />
  </main>

  <Footer />
  <Toast />
</div>

<style>
  .main-body {
    flex: 1;
    padding-top: 5rem;
  }
</style>
