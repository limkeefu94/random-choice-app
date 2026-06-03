# random-choice-app

日常随机选择应用：食物、饮料、旅行、购物、号码、自定义候选，以及独立世界频道聊天原型。

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
- `GCS_ALLOWED_ORIGIN`：你的 Vercel 正式域名，例如 `https://your-app.vercel.app`。
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
