<script>
  export let error;
  export let status;

  // 避免输出太长的错误内容（生产环境更友好）
  const message =
    error?.message && error.message.length > 200
      ? error.message.slice(0, 200) + '...'
      : error?.message || 'Unexpected error';
</script>

<div class="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-6">
  <div class="text-center max-w-lg">
    <!-- 错误图标 -->
    <div class="mx-auto mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-20 h-20 text-brand-primary mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3m0 3h.01M21 12a9 9 0 
             11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>

    <!-- 状态码 -->
    <h1 class="text-4xl font-bold text-brand-primary mb-2">
      {status}
    </h1>

    <!-- 错误信息 -->
    <p class="text-lg text-brand-accent mb-8 leading-relaxed">
      {message}
    </p>

    <!-- 返回首页 -->
    <a
      href="/"
      class="inline-block bg-brand-primary text-white px-6 py-3 rounded-2xl shadow-soft hover:opacity-90 transition"
    >
      Return to Home
    </a>
  </div>
</div>
