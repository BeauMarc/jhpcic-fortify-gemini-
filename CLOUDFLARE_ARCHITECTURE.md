# Cloudflare Serverless Architecture (Stage 2)

本系统采用 **Cloudflare Pages + Functions + KV** 架构。

## 1. 架构组件

*   **Frontend**: React SPA，部署在 Cloudflare Pages (`chinalife-jhpcic`)。
*   **Backend**: Cloudflare Pages Functions，位于 `functions/` 目录。自动随前端部署，运行在同一域名下。
*   **Database**: Workers KV，存储保单数据。

## 2. 目录结构

*   `functions/api/save.js`: 处理保存请求，生成短 ID。
*   `functions/api/get.js`: 处理读取请求，通过 ID 获取完整 JSON。

## 3. 部署配置 (必须操作)

在代码上传至 Cloudflare Pages 后，必须在 Cloudflare Dashboard 进行以下配置才能使用 KV 功能：

1.  进入 **Workers & Pages** -> 选择 **chinalife-jhpcic** 项目。
2.  点击 **Settings** (设置) -> **Functions** (函数)。
3.  找到 **KV Namespace Bindings** (KV 命名空间绑定)。
4.  点击 **Add binding** (添加绑定)：
    *   **Variable name (变量名)**: `JHPCIC_STORE`  <-- 必须完全一致
    *   **KV Namespace**: 选择您创建好的 KV 数据库 (例如 `JHPCIC_KV`)。
5.  点击 **Save**。
6.  **重新部署** (Redeploy) 您的项目以使配置生效。

## 4. 数据流

1.  **Admin 生成链接**:
    *   POST `/api/save` -> Pages Function -> 写入 KV -> 返回 ID。
    *   生成短链接: `https://.../#/buffer?id={ID}`。
2.  **Client 扫码**:
    *   访问短链接 -> 页面加载。
    *   React 检查到 `id` 参数 -> GET `/api/get?id={ID}` -> 读取 KV -> 渲染页面。

此架构解决了 Base64 URL 过长导致微信无法打开的问题，并实现了数据的云端持久化。