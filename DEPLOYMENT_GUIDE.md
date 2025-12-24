# JHPCIC Project Deployment & Handover Guide

**Version**: Stage 2 (Cloudflare Integration)
**Date**: 2024-05-20

## 1. 核心架构变更 (Architecture Overview)

本阶段（Stage 2）对系统进行了云端化升级，从纯静态页面转变为 **Cloudflare Pages + Functions + KV** 架构，以解决长链接在微信中无法访问的问题。

### 旧架构 (Stage 1)
*   **模式**: 纯静态前端 (Static HTML/JS)。
*   **数据流**: 所有保单数据经过 JSON -> Base64 编码后，直接附在 URL 参数 (`?data=...`) 中传递。
*   **缺陷**: URL 极长，容易被微信屏蔽或截断；无数据持久化能力。

### 新架构 (Stage 2)
*   **平台**: Cloudflare Pages。
*   **前端**: React SPA (Single Page Application)。
*   **后端**: Cloudflare Pages Functions (Serverless, 位于 `functions/` 目录)。
*   **数据库**: Cloudflare Workers KV (Key-Value Store)。
*   **数据流**:
    1.  Admin 发起请求 -> POST `/api/save`。
    2.  Function 接收数据 -> 存入 KV -> 返回短 ID。
    3.  Admin 生成短链接 (`?id=uuid`)。
    4.  Client 打开短链接 -> GET `/api/get?id=uuid` -> 读取 KV -> 渲染页面。

---

## 2. 部署指南 (For DevOps Team)

由于本地开发环境无法直接模拟 Cloudflare 完整的 KV 环境，**必须部署到 Cloudflare 才能测试完整流程**。

### 步骤 A: 准备工作
1.  确保已安装 Node.js (v18+)。
2.  安装 Wrangler CLI: `npm install -g wrangler`。
3.  登录 Cloudflare: `wrangler login`。

### 步骤 B: 部署代码 (无 Git 环境手动部署)
如果您没有配置 GitHub CI/CD，请使用以下命令手动部署：

1.  **构建项目**:
    ```bash
    npm install
    npm run build
    ```
    *(此步骤会生成 `dist` 或 `build` 目录)*

2.  **上传至 Cloudflare**:
    ```bash
    npx wrangler pages deploy dist --project-name chinalife-jhpcic
    ```
    *(注意: Wrangler 会自动检测根目录下的 `functions/` 文件夹并一同上传，无需额外配置)*

### 步骤 C: 关键配置 (Binding KV) - 必做！
代码部署后，必须在 Cloudflare 后台绑定 KV 数据库，否则 API 会报错 500。

1.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com)。
2.  进入 **Workers & Pages** -> 选择 **chinalife-jhpcic** 项目。
3.  点击 **Settings (设置)** -> **Functions (函数)**。
4.  向下滚动找到 **KV Namespace Bindings**。
5.  点击 **Add binding**:
    *   **Variable name**: `JHPCIC_STORE` (**必须完全一致，不可更改**)
    *   **KV Namespace**: 选择一个现有的 KV 命名空间（如果没有，请先在 Workers -> KV 中创建一个，例如命名为 `JHPCIC_KV`）。
6.  点击 **Save**。
7.  **重新部署 (Redeploy)**: 绑定变更后，建议重新执行步骤 B，或者在后台点击 "Manage Deployment" -> "Retry" 确保配置生效。

---

## 3. 故障排查 (Troubleshooting)

### Q: 生成链接时一直显示“正在上传...”，然后卡住？
*   **原因**: 前端无法连接到后端 `/api/save` 接口。可能是本地环境运行（未连接云端），或者后端部署了但未绑定 KV。
*   **解决**: 代码中已加入 3 秒超时机制。如果 3 秒内未成功，会自动降级为 **Base64 离线模式**。请检查浏览器控制台 (Console) 是否有 `Cloudflare API error` 或 `KV Namespace not bound` 的日志。

### Q: 微信扫码后显示“无法获取保单信息”？
*   **原因**: `id` 无效或 KV 中数据已过期（默认有效期 30 天）。
*   **解决**: 请确认 KV Binding 是否配置正确（变量名必须是 `JHPCIC_STORE`）。