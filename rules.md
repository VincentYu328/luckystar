luckystar
⭐ Lucky Star Project — SSR × API 统一规范（V3.1）
Author: Vincent Yu / System Architect — Lucky Star
Version: 3.1
Date: 2025-11-28
更新说明: 修正规则 1、6、10，新增规则 12-14，增加优先级分类

一、项目架构原则
Lucky Star 采用 双通道 + 双鉴权 + 统一 API 模块 的后端架构：

staff 通道：管理后台、库存、产品、订单
customer 通道：顾客个人资料、自助下单、自助量体
两个鉴权系统（customerAuth / staffAuth），中间件独立
统一 API 模块（api.xxx.yyy） 作为前端所有请求的唯一入口

并且前端运行在 严格 SSR 环境，因此返回结构、API 一致性、类型稳定性是最高优先级。

二、SSR × API 核心规则（V3.1）
规则 1：API 调用方式取决于 api.js 的架构模式
Lucky Star 支持两种 API 架构模式，整个项目必须统一使用一种模式，不可混用。
模式 A — 自动注入模式（推荐）
特征：

api.js 通过 hooks.server.js 中的 initApi(event.fetch) 自动注入全局 fetch
API 调用无需传递 { fetch, cookies } 参数
API 方法签名：fabricList() 或 fabricOut(data)

示例：
javascript// frontend/lib/server/api.js
export const api = {
  inventory: {
    fabricList() { return request("GET", "/inventory/fabric"); },
    fabricOut(data) { return request("POST", "/inventory/out", data); }
  }
};

// frontend/routes/admin/inventory/+page.server.js
export async function load({ locals }) {
  const res = await api.inventory.fabricList();  // ⭐ 无需传参
  return { fabrics: Array.isArray(res.items) ? res.items : [] };
}
前提条件：

hooks.server.js 必须调用 initApi(event.fetch)（见规则 12）


模式 B — 显式传递模式（传统）
特征：

API 方法接收 ctx 参数：(data, ctx) => apiPost('/path', data, ctx)
前端必须显式传递：await api.inventory.fabricOut(payload, { fetch, cookies })
适用于需要精细控制每个请求上下文的场景

示例：
javascript// frontend/lib/server/api.js
export const api = {
  inventory: {
    fabricList(data, ctx) { return apiGet("/inventory/fabric", ctx); },
    fabricOut(data, ctx) { return apiPost("/inventory/out", data, ctx); }
  }
};

// frontend/routes/admin/inventory/+page.server.js
export async function load({ locals, fetch, cookies }) {
  const res = await api.inventory.fabricList({}, { fetch, cookies });  // ⭐ 必须传参
  return { fabrics: Array.isArray(res.items) ? res.items : [] };
}

如何确认项目使用的模式

查看 api.js 顶部注释

模式 A：注释会说明"无需 ctx.fetch / ctx.cookies"
模式 B：注释会说明"需要传递 ctx 参数"


查看 hooks.server.js

模式 A：有 initApi(event.fetch) 调用
模式 B：无此调用


查看 API 方法签名

模式 A：fabricList() 或 fabricOut(data)
模式 B：fabricList(data, ctx) 或 fabricOut(data, ctx)




规则 2：前端每一个 API 方法必须严格对应后端一个路由
例如：
javascriptapi.inventory.fabricOut  → POST /api/inventory/out
api.products.allFabrics  → GET  /api/products/all-fabrics
api.customers.me         → GET  /api/customers/me
对应关系必须一对一：

✅ 路径一致
✅ HTTP 方法一致
✅ 返回结构一致

否则 SSR JSON decode 会失败。

规则 3：load() 返回结构必须保证类型稳定
统一模板：

数组 → 永远 []
对象 → 永远 {}
字符串 → ''
数值 → Number 类型
布尔值 → Boolean 类型

禁止：

undefined
null
空 Response（无 JSON）
不同类型混合（有时返回数组，有时返回对象）

SSR 的 JSON parser 对类型不稳定异常敏感，会直接崩溃。

规则 4：前端必须对 load() 数据做类型防御
永远不要假设 data.xxx 存在。
正确：
javascriptconst rows = Array.isArray(data.rows) ? data.rows : [];
const item = data.item ?? {};
禁止：
javascriptdata.items.length         // items 可能 undefined
data.item.name            // item 可能 null

规则 5：所有 .length 操作前必须确认是数组
正确：
svelte{#if rows.length === 0}
前提：
javascriptconst rows = Array.isArray(data.rows) ? data.rows : [];
禁止：
javascriptrows.length   // rows 可能不是数组

规则 6：API 返回结构必须统一、稳定、可预测
核心原则：后端返回格式必须与前端 API 模块的字段名完全一致。
❌ 错误示例：字段名不匹配
javascript// 后端返回
{ items: [...] }

// 前端期望（错误）
fabricStock: Array.isArray(res.fabricStock) ? res.fabricStock : []
// ⚠️ res.fabricStock 是 undefined，导致返回空数组
✅ 正确示例 A — 统一使用 items
javascript// 后端
function okItems(rows) {
  return { items: Array.isArray(rows) ? rows : [] };
}

router.get('/fabric', requireAuth, (req, res) => {
  const rows = db.prepare(`SELECT * FROM v_fabric_stock`).all();
  return res.json(okItems(rows));  // { items: [...] }
});

// 前端
const res = await api.inventory.fabricList();
return {
  fabrics: Array.isArray(res.items) ? res.items : []  // ⭐ 取 res.items
};
✅ 正确示例 B — 语义化字段名
javascript// 后端
router.get('/overview', requireAuth, (req, res) => {
  const fabricStock = db.prepare(`SELECT * FROM v_fabric_stock`).all();
  const garmentStock = db.prepare(`SELECT * FROM v_stock_levels`).all();
  
  return res.json({
    fabricStock: Array.isArray(fabricStock) ? fabricStock : [],
    garmentStock: Array.isArray(garmentStock) ? garmentStock : []
  });
});

// 前端
const res = await api.inventory.overview();
return {
  fabricStock: Array.isArray(res.fabricStock) ? res.fabricStock : [],
  garmentStock: Array.isArray(res.garmentStock) ? res.garmentStock : []
};
⚠️ 前后端字段名不匹配是导致 SSR 崩溃的常见原因。

规则 7：API 调用必须使用统一模块 api.xxx.yyy
统一格式：
javascriptapi.products.allFabrics
api.products.allGarments
api.inventory.fabricOut
api.inventory.fabricIn
api.inventory.adjust
api.customers.me
api.staff.login
禁止：
javascriptapiGet('/xxx')        // 旧写法
apiPost('/xxx')       // 旧写法
fetch('/api/xxx')     // 直接调用
（除非在特殊场景明确声明非 SSR 调用，如浏览器端 onMount）

规则 8：inventory 是"只读视图 + 三种写入口"系统
数据库视图（只读）：

v_fabric_stock
v_stock_levels

允许的写入：

POST /inventory/in → 入库
POST /inventory/out → 出库
POST /inventory/adjust → 调整（管理员）

永远禁止：
javascriptPUT /inventory/stock_levels
UPDATE stock_levels
库存只能由动作驱动，不允许直接 edit。

规则 9：SSR 返回内容必须是有效 JSON
后端必须保证：

✅ 所有 SSR API → 必须返回 JSON
✅ 错误 → { error: "xxx" }
❌ 禁止重定向 HTML（302 跳登录页）
❌ 禁止返回纯字符串

否则 SSR JSON decode 失败。

规则 10：API 模块必须与后端路由严格同步更新（三方一致原则）
添加新功能时必须同步修改 三处：
1️⃣ 后端路由（backend/routes/xxxRoutes.js）
javascriptrouter.get('/fabric', requireAuth, (req, res) => {
  const rows = db.prepare(`SELECT * FROM v_fabric_stock`).all();
  return res.json({ items: rows });
});
2️⃣ 前端 API 模块（frontend/lib/server/api.js）


规则 11：统一使用 API 模式 A（自动注入模式）

整个 Lucky Star 项目已经完全确认使用 Mode A：

api.js 自动注入 globalFetch（initApi(event.fetch)）

所有 API 方法不再需要传递 { fetch, cookies }

load()/actions() 中一律写：

await api.inventory.fabricList();
await api.inventory.fabricOut(data);


禁止：

await api.inventory.fabricOut(data, { fetch, cookies });


确保 API 调用方式全项目一致。

规则 12：所有 FormData 必须做“空字串清洗”

浏览器的 <form> 会生成：

未填 → ""（空字串）

填数字 → "2.5"（字符串形式的数字）

未选下拉菜单 → ""

可选字段 → " " 等

但 SQLite 外键约束要求：

必须为 NULL

或真实数字

因此每个 action 必须执行：

function cleanForm(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (v === '' || v === undefined) out[k] = null;
    else if (!isNaN(v)) out[k] = Number(v);
    else out[k] = v;
  }
  return out;
}


并强制使用：

const payload = cleanForm(Object.fromEntries(await request.formData()));


避免：

FOREIGN KEY constraint failed

触发器错误

SUM/ABS 聚合错误（数字变成字符串无法运算）

调整库存时新值 NULL/STRING 变成奇怪的类型

规则 13：所有 load() / actions() 必须带 debug 打印

调试 SvelteKit SSR 唯一可靠方式就是自己打 log。

强制：

console.log("[LOAD inventory/out] payload:", payload);
console.log("[ACTION inventory/out] cleaning result:", payload);


因为：

DevTools 看不到 Request Payload

Network 面板不显示 FormData

Vite 热更新导致日志不同步

因此 Debug Log 是 SSR 级必需。

规则 14：POST 成功后必须 redirect(303, …)，否则 SSR 表单会死循环

任何 action：

throw redirect(303, '/admin/inventory');


原因：

303 会强制浏览器刷新 GET 页面

避免重复提交

避免 SSR JSON 重复解析

避免闪白 / 数据不更新

禁止：

return { success: true }; // 用户留在 POST 页


这会导致你今天遇到的“数据不会自动更新”。