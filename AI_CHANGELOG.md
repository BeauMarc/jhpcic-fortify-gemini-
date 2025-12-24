
# AI Changelog

## [Handover] - 2024-05-20

### 交付说明
- **工程化落地**: 补全了 `package.json`, `vite.config.ts`, `tsconfig.json` 等工程文件，项目正式转为标准的 Vite + React 工程。
- **文档交付**: 新增 `HANDOVER_README.md`，用于指导后续团队接手、安装与部署。
- **状态确认**: Stage 2 核心功能（KV 存储、API 降级、超时控制）代码已就绪。

## [Stage 2 Updates] - 2024-05-20 (Cloudflare Integration)

### 核心功能上线 (Core Launch)
- **Cloudflare Worker & KV Integrated:** 
  - 新增 `worker.js`，实现了后端存储 API (`/api/save`, `/api/get`)。
  - 数据现在优先存储在 Cloudflare KV 中，生成短链接 (`?id=...`)，彻底解决了长 Base64 链接导致微信扫码失败的问题。
- **环境检测:** Admin 页面增加了本地环境 (`file://`, `localhost`) 检测，提示用户部署以启用扫码功能。

### 页面逻辑变更 (Page Logic)
- **Admin:**
  - `generateLink` 逻辑重构：优先异步请求 `/api/save`，成功则生成 ID 短链；失败（或离线）则回退到 Base64 长链。
  - 增加 Loading 状态，防止重复点击。
- **ClientIndex & Buffer:**
  - 新增对 `id` URL 参数的支持。
  - 页面加载时自动判断参数类型：若为 `id` 则异步拉取数据；若为 `data` 则本地解码。

## [Stage 1 Updates] - 2024-05-20 (Part 3)

### 架构提案 (Architecture Proposal)
- **Cloudflare Integration:** 提交了 `CLOUDFLARE_ARCHITECTURE.md`，详述了如何使用 Cloudflare Workers + KV 实现低成本、无运维的后端存储，用于替代当前的内存存储。

### 功能增强 (Feature Enhancements)
- **Autopay (Admin):**
  - **信息库 (Profile Library):** 实现了投保人、被保险人、车辆信息的“保存”与“读取”功能。
  - **交互优化:** 在各录入板块右上角增加了“保存”与“读取”的快捷操作区。
  - **数据结构准备:** 内部状态管理已对齐 Cloudflare KV 的 JSON 结构，为 Stage 2 迁移做好准备。

## [Stage 1 Updates] - 2024-05-20 (Part 2)

### 功能增强 (Feature Enhancements)
- **Autopay (Admin):**
  - **历史记录/溯源 (History & Traceability):** 新增了“6. 历史/溯源”标签页。
  - **自动归档:** 点击生成链接时，当前表单数据自动保存至内存历史列表中。
  - **信息复用 (Data Recall):** 支持从历史记录中一键加载旧保单信息（自动重置订单号），便于快速为老客户录入新单或修改信息。
  - **车辆字段扩展:** 增加了“初次登记日期”、“整备质量”、“核定载质量”、“机动车辆所有人”字段。
  - **日期逻辑:** 实现了“保险期间”的一年期自动计算逻辑。

## [Stage 1 Updates] - 2024-05-20 (Part 1)

### 业务字段变更 (Field Updates)
- **Proposer & Insured:**
  - 标签修改: "姓名" -> "名称", "身份证号" -> "证件号"。
  - 新增字段: "证件类型" (ID Type) 与 "住址" (Address)。
  - 客户端核对页面同步增加了 "证件类型" 和 "住址" 的展示。

## [Stage 1 Refactoring] - 2024-05-20

### 架构重构 (Architecture Refactor)
- **Migrated to React SPA:** 将原散乱的 HTML 文件重构为单页应用 (SPA)，使用 `HashRouter` 模拟多页面跳转 (`#/autopay`, `#/buffer`, `#/index`)。
- **Data Transport Protocol:** 确立了以 `Base64(JSON)` URL 参数为唯一数据传输标准的机制，移除了原代码中对 Worker 和 LocalStorage 的不一致依赖。
- **File Structure:** 建立了清晰的 `pages/` (Admin, Buffer, Client) 和 `utils/` (Codec) 结构。

### 页面与流程变更 (Page & Flow Changes)
- **Autopay (Admin):** 
  - 合并了原 `autopay` 与 `admin` 功能。
  - 新增 "生成支付链接" 与 "生成已支付确认链接" 功能，无需后端即可改变客户端状态。
  - 优化了录入表单，分为 4 个 Tab (投保人、被保人、车辆、项目)。
  - **[Updated]** 升级了投保方案录入模块，由文本域改为结构化表格（险种/保额/免赔/保费），并实现保费自动汇总。
- **Buffer:** 
  - 严格保留了 4 秒强制停留倒计时。
  - 增加了数据完整性校验，防止空数据跳转。
- **Index (Client):**
  - **Logic Refactor:** 实现了严格的步骤状态机：`Terms` -> `MobileVerify` -> `InfoCheck` -> `Sign` -> `Pay`。
  - **Mobile Verification:** 强制校验 URL 参数中的手机号与用户输入是否一致。
  - **Payment Status:** 支持通过 URL 参数 `status=paid` 直接渲染支付完成页。
  - **[Updated]** 优化了核对页面（Step 3）的展示，使用正规表格样式展示险种明细。

### 数据处理 (Data Handling)
- **Codec:** 实现了 UTF-8 安全的 Base64 编解码工具，解决中文乱码问题。
- **Sign:** 集成 HTML5 Canvas 签名功能，签名数据转换为 Base64 存入流程状态（虽暂不持久化，但为后续 Stage 2 预留了数据结构）。
- **[Updated]** 更新了 `InsuranceData` 结构，将 `coverageDetails` (string) 替换为 `coverages` (CoverageItem[]) 以支持结构化数据。

### 零容忍合规 (Compliance)
- 未引入任何后端数据库。
- 未引入任何支付类状态存储。
- 保持了 UI 核心流程顺序不变。