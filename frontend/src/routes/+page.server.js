/** 
 * Lucky Star — Homepage (SSR)
 * 
 * 当前版本：返回静态结构
 * 如需产品数据，可从后端 fetch 注入
 */

export async function load({ fetch }) {

  // ============ 可扩展区（未来使用） ============  
  // 示例：从后端 API 拉取新品、推荐产品等
  //
  // const res = await fetch(`${import.meta.env.VITE_API_URL}/products/latest`);
  // const latestProducts = await res.json();
  //
  // return { latestProducts };


  // ============ 当前首页无需数据 ============
  return {
    status: 'ok'
  };
}
