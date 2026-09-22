# 高中数学教学反思

按人教A版2019教材章节记录教学反思、教学总结、学生易错点和改进措施。应用是响应式 PWA，可在电脑和手机上使用；未配置云端时自动以本机模式运行。

## 已实现

- 五册人教A版2019教材目录。
- 按教材、章、节新增和编辑课次记录。
- 教学反思、教学总结、学生易错点、改进措施和标签。
- 自动保存、本机草稿和离线队列。
- 按关键词、教材、章节和日期搜索。
- 归档与恢复。
- JSON 和 Markdown 导出。
- Supabase 邮箱登录和云端同步。
- PWA 安装、应用外壳缓存和响应式桌面/手机布局。

## 本机运行

```bash
npm install
npm run dev
```

打开终端输出的本地地址。没有环境变量时，应用使用浏览器 IndexedDB 保存数据。

运行验证：

```bash
npm test
npm run build
npm run test:e2e
```

首次执行端到端测试前安装 Chromium：

```bash
npx playwright install chromium
```

## 启用电脑和手机同步

### 1. 创建 Supabase 项目

1. 在 [Supabase](https://supabase.com/) 创建项目。
2. 打开 SQL Editor。
3. 复制并执行 [0001_initial.sql](./supabase/migrations/0001_initial.sql)。
4. 在 Authentication 的 URL Configuration 中，把本地地址和 Vercel 域名加入允许的 Redirect URLs。
5. 在 Project Settings 的 API 页面获取 Project URL 和 anon public key。

SQL 会创建教材、章、节、课次记录和版本快照表，并启用 Row Level Security。每个账号只能访问 `owner_id` 等于自己的数据。

### 2. 配置本地环境

创建 `.env.local`：

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

重新运行：

```bash
npm run dev
```

应用会显示邮箱登录页。邮箱收到魔法登录链接后，电脑和手机使用同一邮箱登录，即会读取和更新同一份云端记录。

## 部署到 Vercel

1. 把代码推送到 GitHub。
2. 在 Vercel 导入该 GitHub 仓库。
3. Framework Preset 选择 `Vite`。
4. Build Command 使用 `npm run build`。
5. Output Directory 使用 `dist`。
6. 添加环境变量：

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

7. 部署完成后，把 Vercel 域名加入 Supabase 的 Redirect URLs。

## 手机安装

1. 手机浏览器打开 Vercel 地址并登录。
2. iPhone Safari 选择“共享” -> “添加到主屏幕”。
3. Android Chrome 选择浏览器菜单中的“安装应用”或“添加到主屏幕”。

安装后可以从主屏幕直接进入，主要界面在断网时仍可打开，未同步编辑会保留在本机队列中。

## 数据备份与 GitHub

设置页可以导出 JSON 和 Markdown。JSON 保留完整字段，Markdown 适合长期阅读。

GitHub 用于代码版本管理，不承担主数据库同步。多设备同时编辑时，Git 提交容易冲突，也不适合逐条记录权限和离线合并。主数据使用 Supabase，GitHub 负责源码和部署。

## 项目结构

```text
src/app/             应用状态、认证和工作区上下文
src/components/      导航、目录、记录列表和编辑器
src/data/            IndexedDB、Supabase、目录和同步适配器
src/domain/          类型、搜索和导出
src/pages/           目录工作台、搜索、归档和设置
supabase/migrations/ 数据库结构和 RLS
e2e/                 桌面和手机端到端测试
docs/superpowers/    设计说明和实施计划
```
