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
