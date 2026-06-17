# random-choice-app

日常随机选择应用：食物、饮料、旅行、购物、号码、自定义候选，以及独立世界频道聊天原型。

旅行模式支持「想去国家」和「想要活动」筛选，包含潜水、浮潜、海岛跳岛、爬山、徒步、滑雪、冲浪、露营、极光、野生动物、赏鲸等全球精选目的地。当前是人工整理的精选池，不是所有国家所有景点的完整数据库。

娱乐号码模式覆盖马来西亚、新加坡、美国、欧洲、加拿大、菲律宾、台湾、香港、日本、韩国、泰国等常见 4D、6D、TOTO 等号码格式。号码由随机算法生成，仅供娱乐，不构成投注建议。

## 娱乐号码资料说明

号码格式资料优先参考官方彩票机构、官方运营商或监管机构公开规则；官方资料难找时，才参考可靠的百科或资料汇总。当前数据是初版整理，只用于娱乐和学习，后续上线前需要人工逐项校对最新规则。

应用内不会加入真实投注平台链接、购买入口、投注技巧或中奖预测。

## Vercel 部署

1. 把这个仓库连接到 Vercel。
2. Framework Preset 选择 `Other`。
3. Build Command 留空即可；如果 Vercel 自动要求命令，可填 `npm run check` 只做语法检查。
4. Output Directory 留空，项目根目录就是静态页面。
5. 部署后，Vercel 会自动暴露 `api/gcs-signed-url.js` 为 `/api/gcs-signed-url`。

## Google Cloud Storage API 放哪里

不要把 Google Cloud Storage API key、service account JSON 或 private key 放进前端代码，也不要提交到 GitHub。

后端接口已经放在 `api/gcs-signed-url.js`，Vercel 会把它部署成 `/api/gcs-signed-url`。你要放的是 GCS 凭证环境变量，不是把密钥写进 `app.js` 或 `index.html`。

在 Vercel 项目里打开 `Settings -> Environment Variables`，新增这些变量：

- `GCP_PROJECT_ID`：Google Cloud project id。
- `GCS_BUCKET_NAME`：你的 Cloud Storage bucket 名称。
- `APP_ALLOWED_ORIGIN`：你的 Vercel 正式域名，例如 `https://your-app.vercel.app`。
- `GCS_SERVICE_ACCOUNT_JSON_BASE64`：推荐放完整 service account JSON 的 base64 字符串。

如果你不想用 base64 JSON，也可以改用：

- `GCP_CLIENT_EMAIL`：service account 的 `client_email`。
- `GCP_PRIVATE_KEY`：service account 的 `private_key`。

接口也兼容旧命名 `GCS_CLIENT_EMAIL` / `GCS_PRIVATE_KEY`，但 Vercel 里只需要保留一套即可。

本地开发时可以复制 `.env.example` 为 `.env.local`，但 `.env.local` 不要提交。

## GCS 上传接口

前端上传文件时先请求：

```http
POST /api/gcs-signed-url
Content-Type: application/json
```

```json
{
  "fileName": "photo.png",
  "contentType": "image/png",
  "fileSize": 123456
}
```

接口会返回一个 15 分钟有效的 `uploadUrl`，前端再用 `PUT` 把文件上传到 GCS。

世界频道图片会先显示待发送缩略图，点「发送消息」才上传并发到聊天。上传默认使用 `/api/gcs-upload` 同源上传，避免浏览器被 GCS CORS 拦截。这个接口只接受图片，单张最大 2.5MB。`/api/gcs-signed-url` 保留给之后配置好 GCS CORS 后的大文件直传。

登入/注册目前是本地原型账号，账号数据保存在当前浏览器；GCS 图片上传已经通过 Vercel API 接到后端环境变量，不再需要在前端显示「等待接后台」。

## Firestore 多用户同步基础版

这个版本不是完整 SaaS，只按浏览器自动生成的匿名 `userId` 做数据隔离。

- 首次打开会生成 `anon_...` 格式的 `userId`，并保存到 `localStorage`。
- 页面载入时会请求 `/api/user-data?userId=...`，读取当前用户的 `history`、`favorites`、`uploads`。
- 随机产生最近决定时，会同步到 Firestore `history`。
- 收藏结果时，会同步到 Firestore `favorites`。
- 世界频道图片上传到 GCS 成功后，会把 `imageUrl`、`filePath`、`createdAt` 写入 Firestore `uploads`。
- Firestore 失败时不会中断页面；应用会继续显示 `localStorage` 里的离线缓存。

你需要在 Google Cloud 做：

1. 开启 Firestore，选择 Native mode，并建立默认数据库。
2. 确认 Vercel 里的 service account 环境变量仍然存在：`GCP_PROJECT_ID` + `GCS_SERVICE_ACCOUNT_JSON_BASE64`，或 `GCP_CLIENT_EMAIL` + `GCP_PRIVATE_KEY`。
3. 给这个 service account 加 Firestore 写入权限，例如 `Cloud Datastore User` / `roles/datastore.user`。
4. 重新部署 Vercel。

Firestore 结构：

```text
randomChoiceUsers/{userId}/history/{itemId}
randomChoiceUsers/{userId}/favorites/{itemId}
randomChoiceUsers/{userId}/uploads/{itemId}
randomChoiceAccounts/{accountId}
randomChoiceUsernames/{usernameKey}
randomChoiceWorldMessages/{messageId}
randomChoiceReports/{reportId}
randomChoiceBlocks/{blockId}
randomChoiceFriendRequests/{requestId}
randomChoiceFriendships/{friendshipId}
randomChoiceFeedback/{feedbackId}
randomChoiceClientErrors/{errorId}
```

## 云端账号和世界频道

登录/注册已经从本地测试版升级为后端账号：

- 前端只保存登录令牌，不再保存密码。
- 密码会在 Vercel API 里加密后写入 Firestore。
- 注册后会生成固定的 `userId`，最近决定、收藏、上传记录会跟着这个账号同步。
- 世界频道会写入 `randomChoiceWorldMessages`，不同设备和不同用户能看到同一个频道。
- 世界频道发送有基础频率限制，并预留 `channelId`、`topic`、`language`、`region` 字段。
- 举报世界频道消息会写入 `randomChoiceReports`；封锁用户会写入 `randomChoiceBlocks`。
- `AUTH_TOKEN_SECRET` must be a dedicated random secret in production; do not reuse any Google service account private key.

## 社交功能底层预留

- `SOCIAL_FEATURES_ENABLED=false` keeps future friends, direct messages, friend circle, and world-channel filter UI hidden.
- Account API responses now include safe default `privacy` and `worldPreferences` fields for old and new accounts.
- `publicAccount` only returns whitelisted public profile fields and does not expose password hashes, salts, token secrets, service-account data, or private relationship data.
- 好友 API 骨架已预留在 `/api/friend-request` 和 `/api/friends`；开发期不显示 UI 入口。
- 好友申请写入 `randomChoiceFriendRequests`，接受后写入 `randomChoiceFriendships`，并会检查登录、自我申请、重复申请和封锁关系。
- The implementation plan is documented in `docs/social-privacy-plan.md`.

## 用户反馈入口

- 更多菜单里的「反馈问题」会提交到 `/api/feedback`。
- 反馈写入 Firestore `randomChoiceFeedback` collection，允许未登录用户提交。
- 接口只保存反馈白名单字段，不保存密码、登录 token、private key 或请求原始 headers。

## 前端错误记录

- 全局 JS 错误、Promise 错误和关键 API 失败会提交到 `/api/client-error`。
- 错误写入 Firestore `randomChoiceClientErrors` collection，用于后续排查 Bug。
- 客户端和接口都会脱敏常见密码、token、GCP key、private key；同一错误 60 秒内最多上报一次。

- `/api/feedback` and `/api/client-error` are server-side rate-limited to reduce anonymous write spam. Tune with `FEEDBACK_RATE_LIMIT_*` and `CLIENT_ERROR_RATE_LIMIT_*`.

## `/api/user-data` access control

- Logged-in cloud sync requests must send `Authorization: Bearer <token>`.
- The requested `userId` must match the logged-in account `userId`; otherwise `/api/user-data` returns `403`.
- Anonymous sync is opt-in only. Set `ALLOW_ANON_SYNC=true` for local/dev anonymous browser sync.
- Keep `ALLOW_ANON_SYNC` unset or `false` in production; unauthenticated `/api/user-data` requests return `401`.

## Auth token secret policy

- Production must set `APP_ENV=production` and a dedicated `AUTH_TOKEN_SECRET`.
- In production, the API refuses to mint or verify auth tokens when `AUTH_TOKEN_SECRET` is missing.
- Development may use `APP_ENV=development`; only development keeps the legacy fallback to Google service account private key.
- Do not reuse `GCP_PRIVATE_KEY`, `GCS_PRIVATE_KEY`, or service account JSON private keys as the production auth token secret.

## GCS upload access control

- `/api/gcs-upload` and `/api/gcs-signed-url` require `Authorization: Bearer <token>` by default.
- Set `ALLOW_PUBLIC_UPLOAD=true` only in local/dev environments that intentionally allow upload testing without login.
- Upload requests are rate-limited per logged-in account or public client IP. Tune with `UPLOAD_RATE_LIMIT_MAX` and `UPLOAD_RATE_LIMIT_WINDOW_MS`.
- Requests over the upload limit return `429` with `Retry-After` and `X-RateLimit-*` headers.
- World channel image messages only accept GCS `world/` objects from the configured bucket.

## API CORS policy

- Production API CORS uses `APP_ALLOWED_ORIGIN`; requests from other origins do not receive `Access-Control-Allow-Origin`.
- Set `ALLOW_DEV_CORS=true` only in local/dev environments to reflect the request `Origin` for easier testing.
- `OPTIONS` preflight requests keep returning `204` with the configured method/header allow-list.

## Auth rate limiting

- Failed login attempts are rate-limited per IP + username and return `429` after the configured threshold.
- Registration attempts are rate-limited per IP to reduce spam signups.
- Production defaults are stricter; set `ALLOW_DEV_RATE_LIMITS=true` only in local/dev to use wider defaults.
- Tune with `AUTH_LOGIN_RATE_LIMIT_MAX`, `AUTH_LOGIN_RATE_LIMIT_WINDOW_MS`, `AUTH_REGISTER_RATE_LIMIT_MAX`, and `AUTH_REGISTER_RATE_LIMIT_WINDOW_MS`.
