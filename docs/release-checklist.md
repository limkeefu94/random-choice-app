# Release Checklist

每次 merge 前使用这份清单。没有完成的项目需要在 PR 说明里写清楚原因和风险。

## Merge 前检查

1. PR base 是 `main`。
2. Vercel Preview 正常打开。
3. 手机 390px 宽度测试通过。
4. 桌面端主要页面测试通过。
5. 登录 / 注册 / 登出测试通过。
6. 世界频道文字消息测试通过。
7. GCS 图片上传测试通过。
8. 没有密钥、token、private key、service account JSON 或 `.env` 私密值进入 diff。
9. `CHANGELOG.md` 已更新。

## 建议命令

```powershell
git remote -v
git status -sb
npm run check
git diff --check
```

## 建议手动测试

- 打开首页，确认核心随机模式可以正常抽取。
- 在手机 390px 宽度检查顶部栏、更多菜单、反馈表单和世界频道不横向溢出。
- 登录后发送一条世界频道文字消息。
- 如果本次改动影响上传，上传一张小于限制的测试图片。
- 检查浏览器 Console 没有新的 `ReferenceError` 或明显运行时报错。
