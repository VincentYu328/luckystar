<script>
  // No props needed
</script>

<footer class="footer">
  <div class="footer-content">

    <!-- 左：版权 -->
    <div class="footer-copy">
      © {new Date().getFullYear()} Lucky Star Fashion. All rights reserved.
    </div>

    <!-- 中：联系信息 -->
    <div class="footer-contact">
      <div>Ph: 09 270 6088</div>
      <div>Add: 6 Avenue Road, Ōtāhuhu, Auckland 1062</div>
    </div>

    <!-- 右：Powered by -->
    <div class="footer-powered">
      Powered by 
      <a href="https://vincentyu.pro" target="_blank" rel="noopener">
        vincentyu.pro
      </a>
    </div>

  </div>
</footer>

<style>
  .footer {
    background: rgba(196, 219, 111, 0.94);
    border-top: 3px solid #FFF8E7;
    color: #FFF8E7;
    padding: 0.9rem 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.2;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.2);
    
    /* 桌面端字号 */
    font-size: 1rem;
    font-weight: 600;
  }

  .footer-content {
    max-width: 82rem;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    justify-items: center;
    gap: 0.5rem;
  }

  .footer-copy {
    justify-self: start;
  }

  .footer-contact {
    text-align: center;
  }

  .footer-powered {
    justify-self: end;
    text-align: right;
  }

  .footer-powered a {
    color: white;
    text-decoration: none;
    font-weight: 700;
    margin-left: 4px;
    padding-bottom: 1px;
    border-bottom: 1px solid transparent;
    transition: all 0.3s;
  }

  .footer-powered a:hover {
    color: #FFF8E7;
    border-bottom-color: #FFF8E7;
  }

  /* ==================== 手机端优化 ==================== */
  @media (max-width: 767px) {
    .footer {
      /* 手机端字号缩小到 0.875rem（14px）或更小，看你喜好 */
      font-size: 0.875rem;        /* 14px，更清爽 */
      /* 如果还想再小一点，可以用 0.8125rem（13px） */
      /* font-size: 0.8125rem; */
      padding: 0.8rem 0;
    }

    .footer-content {
      grid-template-columns: 1fr;
      text-align: center;
      gap: 0.75rem;               /* 手机端稍微加大行间距，呼吸感更好 */
    }

    .footer-copy,
    .footer-powered {
      justify-self: center;
      text-align: center;
    }

    .footer-contact div {
      line-height: 1.5;           /* 手机端地址和电话分行时更好看 */
    }
  }

  /* 可选：超小屏幕（<400px）再稍微收紧一点 */
  @media (max-width: 400px) {
    .footer {
      font-size: 0.8125rem;       /* 13px */
    }
    .footer-content {
      padding: 0 1rem;
    }
  }
</style>