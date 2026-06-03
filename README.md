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

- `GCS_CLIENT_EMAIL`
- `GCS_PRIVATE_KEY`

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
