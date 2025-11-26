<script>
  export let images = [];

  let current = 0;
  const setImage = (i) => current = i;
</script>

<div class="gallery">

  <!-- 大图展示 -->
  <div class="main-img-box">
    <img
      src={images?.[current]?.url || "/images/placeholder.jpg"}
      alt="product image"
      class="main-img"
    />
  </div>

  <!-- 缩略图 -->
  <div class="thumb-row">
    {#each images as img, i}
      <img
        src={img.url}
        alt="thumb"
        class="thumb {current === i ? 'active' : ''}"
        on:click={() => setImage(i)}
      />
    {/each}
  </div>

</div>

<style>
  .gallery {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .main-img-box {
    width: 100%;
    height: 360px;
    background: #E3EAF1;
    border-radius: 1rem;
    overflow: hidden;
  }

  .main-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumb-row {
    display: flex;
    gap: .75rem;
    overflow-x: auto;
  }

  .thumb {
    width: 70px;
    height: 70px;
    border-radius: .5rem;
    object-fit: cover;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border .25s;
  }

  .thumb.active {
    border-color: #0C3C78;
  }
</style>
