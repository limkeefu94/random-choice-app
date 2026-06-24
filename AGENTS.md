# random-choice-app Codex 工作守则

本仓库是 `limkeefu94/random-choice-app`。所有 Codex 任务必须先确认当前仓库和远端，避免改错项目。

## 仓库范围

- 只能修改 `limkeefu94/random-choice-app`。
- 不要修改 `BlythraLoop` 或其他同级仓库。
- 修改前必须运行并确认 `git remote -v` 指向 `https://github.com/limkeefu94/random-choice-app.git`。
- 如果当前路径不是 `D:\threshold\random-choice-app` 或远端不正确，先停止并说明问题。

## 分支和 PR

- 每个任务必须从 `main` 新建分支。
- PR base 必须是 `main`。
- 一个 PR 只做一件事，避免把无关功能、重构和修 bug 混在一起。
- 不要直接把多个用户任务混进同一个 PR，除非用户明确要求合并提交。

## 安全要求

- 不要提交密钥、token、密码、private key 或 `.env` 私密内容。
- 不要把 service account JSON 写入代码、README、测试数据或截图。
- 示例配置只能写占位符，真实值必须放在部署平台或本地环境变量中。

## 交付要求

- 完成后说明改了哪些文件。
- 完成后说明如何测试，以及哪些测试已经跑过。
- 如果因为环境限制无法测试，必须明确写出原因和建议的手动验证步骤。
- 不要改随机功能、Auth、GCS、世界频道或 UI，除非当前任务明确要求。

## 默认开发规则

除非任务卡明确要求，否则 Codex 必须遵守以下规则。

### 不要改动无关系统

不要随便改这些核心逻辑：

* Auth / 登录逻辑
* GCS 上传逻辑
* Firestore collection 名称或数据结构
* World Channel API
* 点爱心 API
* Gift Exchange 配对逻辑
* 首页布局保存结构
* 图片裁剪 / 图片浏览器核心逻辑
* GitHub Actions CI
* i18n audit 规则

如果当前任务需要改以上内容，必须在 PR 描述里说明原因、影响范围和测试结果。

### 版本要求

每个功能或修复 PR 都要更新：

* package.json
* package-lock.json 如果存在
* RELEASE_NOTES
* CHANGELOG.md

版本号必须按照任务卡要求升级。

### i18n 要求

所有新增 UI 文案必须支持：

* zh-CN
* en
* ms

新增按钮、placeholder、toast、tooltip、aria-label、错误提示、空状态文案都必须走 locale key。

不要在 app.js / index.html 里新增硬编码中文 UI。
不要用中文当英文或马来文 fallback。

### 必跑检查

提交 PR 前必须运行：

```bash
npm run check
npm run check:i18n
node scripts/check-locales.js
node scripts/audit-i18n.js
git diff --check
```

如果修改了 JS 文件，也要运行对应的：

```bash
node --check <file>
```

### PR 要求

每个 PR 必须包含：

* Summary
* What changed
* Manual testing
* Automated checks
* i18n notes 如果有 UI 文案改动
* Risk notes

不要自动 merge。

### UI 要求

手机端 390px 宽度必须可用。

优先复用现有按钮、icon button、tooltip、more menu 样式。
不要重新做第二套按钮系统。

删除、清空、重置等危险操作必须有确认。

### World Channel 要求

如果任务碰到世界频道，必须确认：

* 发文字正常
* 发图片正常
* 旧图片过期刷新正常
* 图片浏览器正常
* 爱心动画正常
* 新消息提示正常
* 自动滚动不打断看旧消息
* 只有本人可以编辑 / 删除自己的消息

### 工作方式

保持 PR 小而集中。
不要把多个大功能混进同一个 PR。
如果发现不属于当前任务的问题，先在 PR 描述里记录，不要顺手大改。