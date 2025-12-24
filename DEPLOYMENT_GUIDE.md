
# JHPCIC Project Deployment & Handover Guide (BeauMarc Edition)

**Version**: Stage 2 (Cloudflare Integration)
**User**: BeauMarc

## 1. 核心架构变更 (Architecture Overview)

本系统采用 **Cloudflare Pages + Functions + KV** 架构，解决了长链接在微信中无法访问的问题。

---

## 2. 部署指南 (Cloudflare Pages 界面配置)

如果在 Cloudflare 部署界面没有找到 "Vite" 预设，请按以下步骤手动配置：

### 步骤 A: 构建配置 (Build Settings)
1. **Framework preset**: 选择 **`None`**。
2. **Build command**: 手动输入 `npm run build`。
3. **Build output directory**: 手动输入 `dist`。

### 步骤 B: 环境变量 (Environment Variables)
在 **Settings -> Environment Variables** 中添加：
- **API_KEY**: 填入你的 Google Gemini API Key。

### 步骤 C: KV 绑定 (KV Binding) - **必须执行**
1. 进入 **Settings -> Functions**。
2. 在 **KV Namespace Bindings** 中点击 **Add binding**。
3. **Variable name**: 必须填写 `JHPCIC_STORE`。
4. **KV Namespace**: 选择你创建的 KV 数据库。
5. **保存并重新部署**。

---

## 3. 故障排查 (Troubleshooting)

### 🔴 Git 报错 403 (Permission Denied)
如果推送时提示 `The requested URL returned error: 403`：
1. 前往 GitHub Settings 生成一个勾选了 `repo` 权限的新 Token。
2. 执行以下命令重新关联：
   ```bash
   git remote remove origin
   git remote add origin https://BeauMarc:你的TOKEN@github.com/BeauMarc/chinalife-JHPCICfortify.git
   git push -u origin main
   ```

### 🔴 页面显示 404 或构建失败
- 确保 **Build output directory** 填的是 `dist` 而不是 `build`。
- 确保本地执行过 `npm install` 且 `package.json` 文件完整。

### 🔴 扫码提示 "KV Not Configured"
- 请检查 `JHPCIC_STORE` 绑定名是否完全匹配（全大写，带下划线）。
