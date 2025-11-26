<script>
  export let categories = [];
  export let selectedCategory = "";
  export let priceRange = "";
  export let color = "";
  export let gender = "";

  const update = () => {
    const params = new URLSearchParams({
      category: selectedCategory,
      price: priceRange,
      color,
      gender
    });

    window.location.search = params.toString();
  };
</script>

<div class="filter-box">

  <div class="row">
    <label>Category</label>
    <select bind:value={selectedCategory} on:change={update}>
      <option value="">All</option>
      {#each categories as c}
        <option value={c.code}>{c.name}</option>
      {/each}
    </select>
  </div>

  <div class="row">
    <label>Price</label>
    <select bind:value={priceRange} on:change={update}>
      <option value="">All</option>
      <option value="0-30">0 – 30</option>
      <option value="30-50">30 – 50</option>
      <option value="50-100">50 – 100</option>
    </select>
  </div>

  <div class="row">
    <label>Color</label>
    <input type="text" bind:value={color} placeholder="e.g. red" on:input={update} />
  </div>

  <div class="row">
    <label>Gender</label>
    <select bind:value={gender} on:change={update}>
      <option value="">All</option>
      <option value="mens">Men</option>
      <option value="womens">Women</option>
      <option value="boys">Boys</option>
      <option value="girls">Girls</option>
    </select>
  </div>

</div>

<style>
  .filter-box {
    display: grid;
    gap: 1rem;
    background: white;
    padding: 1.25rem;
    border-radius: 1rem;
    border: 1px solid rgba(143,163,184,0.25);
  }

  .row {
    display: flex;
    flex-direction: column;
    gap: .3rem;
  }

  label {
    font-size: .9rem;
    color: #0C3C78;
    font-weight: 600;
  }

  select, input {
    border: 1px solid rgba(143,163,184,0.4);
    padding: .5rem .75rem;
    border-radius: .6rem;
    outline: none;
    font-size: .95rem;
  }

  select:focus, input:focus {
    border-color: #0C3C78;
    box-shadow: 0 0 0 2px rgba(12,60,120,0.15);
  }
</style>
