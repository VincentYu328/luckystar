<!-- frontend\src\routes\products\+page.svelte -->

<script>
  export let data;
  const categories = data.categories ?? [];
</script>

<svelte:head>
  <title>Products — Lucky Star Fashion</title>
  <meta name="description" content="Pacific-inspired fabrics, island garments, church uniforms and custom orders for the Auckland Pacific community." />
  <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700&display=swap" rel="stylesheet">
</svelte:head>

<section class="products-page">
  <div class="page-container">
    <h1 class="page-title">Products</h1>

    {#each categories as cat}
      <section class="category-section">
        <h2 class="category-title">{cat.name}</h2>

        {#if cat.children.length === 0}
          <!-- Fabrics 大按钮 -->
          <a href="/products/fabrics" class="category-card single">
            <span class="card-label">Browse All {cat.name}</span>
            <svg class="arrow-icon" viewBox="0 0 24 24"><path d="M8 4l8 8-8 8"/></svg>
          </a>

        {:else}
          <!-- Garments 四个分类 -->
          <div class="subcategory-grid">
            {#each cat.children as child}
              <a href={`/products/garments/${child.code}`} class="category-card">
                <span class="card-label">{child.name}</span>
                <svg class="arrow-icon" viewBox="0 0 24 24"><path d="M8 4l8 8-8 8"/></svg>
              </a>
            {/each}
          </div>
        {/if}
      </section>
    {/each}
  </div>
</section>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Quicksand', system-ui, sans-serif;
  }

  .products-page {
    min-height: 72vh;
    padding: 10vh 2rem 2vh;
    background: url('/images/product.png') center/cover no-repeat fixed;
    position: relative;
  }

  .products-page::before {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(243, 179, 115, 0.58);
    backdrop-filter: blur(2px);
  }

  .page-container {
    position: relative;
    max-width: 1160px;
    margin: 0 auto;
  }

  .page-title {
    font-size: clamp(3.2rem, 8vw, 6rem);
    font-weight: 900;
    text-align: center;
    color: #fff4d6;
    margin: 0 0 2rem;
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    letter-spacing: 1.5px;
  }

  .category-title {
    font-size: 2.8rem;
    font-weight: 700;
    text-align: center;
    color: rgb(162, 228, 208);
    margin: 0 0 4rem;
    text-shadow: 0 3px 15px rgba(0, 0, 0, 0.45);
  }

  /* 优化后的卡片风格 */
  .category-card {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 248, 231, 0.42);
    backdrop-filter: blur(10px);
    border: 2.5px solid transparent;
    border-radius: 3rem;
    padding: 1.2rem 1.2rem;
    text-decoration: none;

    /* ❗ 新文字颜色（不再全白） */
    color: #5d3f2b;

    font-weight: 700;
    font-size: 1.55rem;
    text-align: center;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);

    /* ❗ 缩窄按钮，避免挤 */
    max-width: 240px;
    width: 100%;
    margin: 0 auto;
  }

  .category-card:hover {
    transform: translateY(-12px) scale(1.07);
    background: transparent;
    border-color: #e6d7bc;
    box-shadow:
      0 24px 48px rgba(0, 0, 0, 0.38),
      0 0 35px rgba(255, 248, 231, 0.9);
  }

  .card-label {
    transition: all 0.35s ease;
  }

  .arrow-icon {
    width: 28px;
    height: 28px;
    fill: none;

    /* ❗ 新颜色 */
    stroke: #5d3f2b;

    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    position: absolute;
    right: 22px;
    opacity: 0;
    transform: translateX(-20px);
    transition: all 0.45s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .category-card:hover .arrow-icon {
    opacity: 1;
    transform: translateX(0);
  }

  .single {
    max-width: 420px;
    font-size: 1.65rem;
    padding: 2rem 2rem;
  }

  /* Garments 四个分类布局优化 */
  .subcategory-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(180px, 1fr));
    gap: 2.6rem;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  @media (max-width: 1024px) {
    .subcategory-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 1.8rem;
    }
  }

  @media (max-width: 640px) {
    .subcategory-grid {
      grid-template-columns: 1fr;
      gap: 1.6rem;
    }
    .category-card {
      font-size: 1.45rem;
      padding: 1.5rem 1rem;
      border-radius: 2.6rem;
    }
    .single {
      max-width: 380px;
      font-size: 1.5rem;
    }
    .page-title {
      margin-bottom: 5rem;
    }
  }
</style>
