<script>
  export let size = "md"; 
  /* 支持：sm | md | lg */

  const sizeMap = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4"
  };
</script>

<div class="flex items-center justify-center">
  <div
    class={`spinner ${sizeMap[size] ?? sizeMap.md}`}
    role="status"
    aria-label="Loading"
  />
</div>

<style>
  /**************************************************
   * Lucky Star — Loading Spinner
   * 深海蓝主色 (#0C3C78) + 太平洋蓝强调色 (#1A73B7)
   **************************************************/

  .spinner {
    border-radius: 50%;
    border-style: solid;
    border-color: #0C3C78 transparent #1A73B7 transparent;
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin {
    0%   { transform: rotate(0deg);   }
    100% { transform: rotate(360deg); }
  }
</style>
