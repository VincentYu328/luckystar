git add .
git commit -m "overwrite remote with local"
git remote remove origin 2>/dev/null
git remote add origin https://github.com/VincentYu328/luckystar.git
git push origin main --force




# luckystar
使用AI协助本项目的编程与管理有以下几个注意事项：

1、本项目采用了STAFF-CUSTOMER双通道，所以在后端层级上AI可能会误解。例如，某个注册客户在管理自己的账户信息时走的是customers/me，没有为此而建立专门的DAO，SERVICE和路由。但是，除此之外，几乎所有其它方面都是双通道并行的，在DAO层面，有customers-dao.js和users-dao.js；在service层面，有customerService.js和userService.js；在路由层面，有customerRoutes.js和userRoutes.js。与此同时，在授权方面，也并行两个：customerAuthService.js和authService.js，以及customerAuthRoutes.js和authRoutes.js。在DAO层面无专门的授权模块。现在看起来，有几个失误：1)员工不应该用users指代，应该直接写staff；2)授权层应该清楚分别customerAuth和staffAuth。

2、一开始觉得ADMIN也是员工的一部分，不想创建新的ADMIN通道，但操作过程中发现这样非常困难，于是不得不增加adminService.js和adminRoutes.js。

3、最麻烦的是measurement模块。STAFF能对客户进行量体，走的是measurements-dao.js, measurementService.js, measurementRoutes.js；而客户也能自行量体，走的又是customers通道下的子路径。所以AI在设计API时出错几乎是必然，为此的DEBUG也耗费大量精力。

4、开发完后端DB和EXPRESS后，看似基础已建好，前端只要这些基本上搭建就很快，但事实上，依赖AI行事问题非常多。它会在前端构建一个不存在的API，或者在绝对路径和相对路径上混淆不清。如果跑不通，需要从以下几个方面入手：
- 每次都要把一个模块的DB，DAO, SERVICE, ROUTES, +page.server.js, +page.svelte, +layout.server.js, +layout.svelte拿出来让AI阅读理解。
- 一个AI的建议有时会出错，让另一个AI把关。
- 短路径问题可以让AI加一个CONSOLE.LOG来记录，而不是盲人摸象。
- 长路径问题，除了上述DB，DAO, SERVICE, ROUTES, +page.server.js, +page.svelte, +layout.server.js, +layout.svelte外，还要把后端middleware, api.js，以及前端的/lib/server/api.js, lib/server/auth.js，hooks.sever.js，甚至环境变量也给AI看。
- 不涉及调用服务器或写入服务器的功能时，可以使用相对路径或少量的onMount，但一旦涉及数据库读写，就必须绝对路径，且出于SSR考量，不能使用onMount。

5、每个前端svelte页面顶部都必须写入相对路径，以免文件众多时混乱。

6、以下几个规则已被证明行之有效：
规则 1：SSR 调用 API 必须显式写 { fetch, cookies }
在 SSR 环境中：await api.xxx.yyy(params, { fetch, cookies })
必须这样写，否则：
服务器 fetch 不带 cookie
staff 鉴权失败 → 401
SSR load() 返回 undefined → Svelte crash

失败例子（全部禁止）：
fetch('/api/...')      // ❌ 无 cookie
apiGet('/xxx')         // ❌ 裸 fetch
globalThis.fetch       // ❌ 无上下文
api.xxx.yyy()          // ❌ 未传 fetch/cookies
没有例外。

规则 2：后端必须存在对应 API 路由，否则 SSR 必崩
✔ 前端调用的所有 api.xxx.yyy() 必须有对应后端路由
✔ 后端路由必须返回纯 JSON（对象或数组）
✔ 返回结构必须稳定（见规则 6）
这是防止 SSR 直接崩溃的“硬规则”。

规则 3：load() 返回的数据必须保持类型稳定
任何返回数据都必须保证：

类型	load() 必须返回
数组	永远返回 []
对象	永远返回 {}
字符串	永远返回 ''
数值	永远返回 Number 类型

禁止：
undefined
null
随机结构的 JSON
错误对象（如 Error: …）
SSR 会因类型变化直接 Crash。

规则 4：前端必须对 load() 数据进行类型防御
前端永远不要相信 load() 会返回正确类型。
const items = Array.isArray(data.items) ? data.items : [];
const item = data.item ?? {};

禁止：
data.items.length      // ❌ data.items 可能是 undefined
data.item.field        // ❌ data.item 可能是 null
类型防御是 SSR 稳定运行的最关键流程。

规则 5：所有 .length 使用前必须确认是数组
必须这样：
const rows = Array.isArray(data.rows) ? data.rows : [];
{#if rows.length === 0}

否则 SSR 直接爆：
Cannot read property 'length' of undefined

规则 6：API 返回结构必须统一且永远一致
例：
product.list()    → { items: [...] } 
product.get(id)   → { item: {...} }
inventory.fetch() → { fabricStock: [...], garmentStock: [...] }

禁止：
有时返回 { items: [...] }
有时返回 { error: ... }
有时返回 HTML            // 会导致 SSR JSON parse fail

必须：
遇到错误 → 返回 4xx JSON：{ error: "xxx" }
成功 → 保持结构不变
SSR 完全依赖结构稳定性。

规则 7：所有前端调用的 API 必须有后端路由支撑
如果前端写了：
await api.inventory.fabricList(...);

但后端没有：
GET /api/inventory/fabrics

结果就是：
后端返回 HTML 404
SSR JSON parse → Invalid JSON
SSR 崩溃
所以：每一个前端 API 调用都必须先验证后端是否存在。

规则 8：inventory 属于“只读视图 + 两个写入入口”
数据库设计是正确的：
库存 = 视图计算（fabric view + garment view）
不允许直接修改 stock_levels
只允许 incoming / out / adjust

所以规则：
inventory API 必须存在，但可以是只读的。

必须有：
GET /api/inventory/fabrics       → v_fabric_stock
GET /api/inventory/garments      → v_stock_levels

可选（写入）：
POST /api/inventory/in
POST /api/inventory/out
POST /api/inventory/adjust   // 管理员

但没有：
PUT /inventory/stock_levels   // ❌ 永远禁止
库存不允许直接 edit。

规则 9（新增）：SSR JSON 必须是有效 JSON，不得返回 HTML
SSR 接 API 后必须能 JSON.parse。
所以后端必须保证：
不返回 HTML
不返回 redirect 页面
不返回字符串模板
不返回空白（空响应）
否则 SSR JSON decode → 崩溃。

规则 10（新增）：API 模块必须与后端路由结构一一对应
你的 api.js 不能随便写：
inventory.fabricList = GET /inventory/fabric

除非后端真的有：
router.get('/fabric', ...)
api.js 与后端 routing 必须同步。


规则 11：SvelteKit form 的 action 名称必须和 actions 完全对齐

核心结论：

<form method="POST"> 不写 action="?...“ → SvelteKit 默认调用 actions.default

如果你的 export const actions = { create(){}, adjust(){} } 没有 default，就会直接报：
No action with name 'default' found

反过来，如果你写了 action="?/create"，那 SvelteKit 就会去找 actions.create，不会再找 default。


🔥 标准化 SSR 模板（最新版）
Template A — load()
export async function load({ locals, fetch, cookies }) {
  const user = locals.authUser;
  if (!user) throw error(403);

  const res = await api.xxx.list({}, { fetch, cookies });

  return {
    items: Array.isArray(res.items) ? res.items : []
  };
}

Template B — actions
export const actions = {
  default: async ({ request, fetch, cookies }) => {
    const form = Object.fromEntries(await request.formData());

    const res = await api.xxx.update(form.id, form, { fetch, cookies });

    return { success: !res.error };
  }
};

Template C — get one record
const res = await api.xxx.get(id, { fetch, cookies });
const item = res.item ?? {};



✅ FORM提交的两种合法用法（只能选一种）

模式 A：只有 default action（最简单）

// +page.server.js
export const actions = {
  default: async ({ request, fetch, cookies }) => {
    // ...
  }
};

<!-- +page.svelte -->
<form method="POST">
  <!-- 不写 action -->
</form>


特点：

前端 <form method="POST"> 不写 action

后端只写一个 default，不要再写 create、adjust 之类

模式 B：多个命名 action（create / adjust 等）

// +page.server.js
export const actions = {
  create: async ({ request, fetch, cookies }) => { /* ... */ },
  adjust: async ({ request, fetch, cookies }) => { /* ... */ }
};

<!-- +page.svelte -->
<form method="POST" action="?/create">
  <!-- 触发 actions.create -->
</form>

<form method="POST" action="?/adjust">
  <!-- 触发 actions.adjust -->
</form>


特点：

只要不是 default，就必须在 <form> 上写 action="?/动作名"

动作名 必须和 actions 里的 key 完全一致（create ↔ actions.create）

❌ 明确禁止的写法

前端不写 action，后端却只写命名 action：

export const actions = {
  create: async () => { /* ... */ }
};

<form method="POST">
  <!-- ❌ SvelteKit 会去找 actions.default → 报错 404 -->
</form>


action 名和 actions key 不一致：

<form method="POST" action="?/create">

export const actions = {
  // ❌ 这里叫 'createIncoming'，前端却写 '?/create'
  createIncoming: async () => { /* ... */ }
};


