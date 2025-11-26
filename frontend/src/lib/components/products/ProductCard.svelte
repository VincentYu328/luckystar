<script>
  export let product;
</script>

<a href={`/products/${product.id}`} class="product-card">
  <div class="img-box">
    <img
      src={product.images?.[0]?.url || "/images/placeholder.jpg"}
      alt={product.name}
      class="img"
    />
  </div>

  <div class="content">
    <h3 class="name">{product.name}</h3>

    {#if product.base_price}
      <div class="price">
        NZD {product.base_price}
      </div>
    {/if}

    {#if product.category_name}
      <div class="category">
        {product.category_name}
      </div>
    {/if}
  </div>
</a>

<style>
  .product-card {
    display: block;
    background: white;
    border-radius: 1.25rem;
    overflow: hidden;
    border: 1px solid rgba(143,163,184,0.2);
    transition: transform .25s, box-shadow .25s;
    text-align: center;
  }
  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.15);
  }

  .img-box {
    width: 100%;
    height: 200px;
    background: #E3EAF1;
  }

  .img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .content {
    padding: 1rem;
  }

  .name {
    font-size: 1.1rem;
    font-weight: bold;
    color: #0C3C78;
  }

  .price {
    margin-top: .35rem;
    font-size: .95rem;
    font-weight: 600;
    color: #1A73B7;
  }

  .category {
    margin-top: .2rem;
    font-size: .85rem;
    color: #777;
  }
</style>
