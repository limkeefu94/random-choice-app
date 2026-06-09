# 关联应用规划

本文档用于预留 `random-choice-app` 和未来更多生活奇思妙想小工具共用账号的底层方向。当前阶段只做设置中心 UI 占位和数据结构说明，不开放真实连接、不跳转外部应用、不读取其他应用数据。

## 当前阶段

- 设置中心展示「关联小应用」分区，并标记为「开发中」。
- 示例应用包括：随心转盘、奇思妙想工具、生活记录工具、更多小工具。
- 未来应用类型可包含灵感、记录、计划、轻咨询等方向。
- 未开放应用以 disabled / 计划中状态展示，不提供真实连接按钮，不触发 OAuth、SSO、外部跳转或跨应用数据读取。
- 现有登录、世界频道、随机功能和 GCS 上传流程不受影响。

## 模式一：共享 accountId

适合第一阶段的自有小应用生态。多个应用使用同一个 `accountId` 识别同一位用户，但每个应用仍然只读取自己需要的数据。

建议结构：

```js
{
  accountId: "acc_...",
  apps: {
    randomChoice: {
      enabled: true,
      role: "current",
      createdAt,
      updatedAt
    },
    ideaTool: {
      enabled: false,
      role: "planned",
      createdAt: null,
      updatedAt: null
    },
    lifeLogTool: {
      enabled: false,
      role: "planned",
      createdAt: null,
      updatedAt: null
    }
  }
}
```

注意事项：

- 只适合可信的第一方应用。
- 不应因为共用 `accountId` 就默认共享所有数据。
- 每个应用仍要有自己的数据 collection 和权限边界。

## 模式二：轻量 appConnection 授权

适合第二阶段：用户在设置中心看到可连接应用，并明确同意某个应用使用有限范围的数据。

建议新增 collection：

```js
randomChoiceAppConnections: {
  id,
  accountId,
  appId,
  appName,
  status: "pending" | "active" | "revoked",
  scopes: ["profile:read"],
  createdAt,
  updatedAt,
  revokedAt
}
```

建议规则：

- 默认不连接，必须由用户主动开启。
- 每个连接都要能撤销。
- `scopes` 使用最小权限，例如只读公开资料，不包含密码、token、private key。
- 后台 API 根据 `accountId + appId + scopes` 判断是否允许读取。

## 模式三：未来 OAuth / SSO

适合更完整的多应用或多域名登录体系。该模式需要独立设计授权页、redirect URI、token 生命周期和退出策略。

未来需要补充：

- OAuth client / redirect URI 管理。
- access token 和 refresh token 的签发、轮换、撤销。
- SSO 登录状态同步。
- 用户可查看和撤销已授权应用。
- 审计日志，记录授权、撤销和异常访问。

当前阶段明确不做：

- 不接 OAuth。
- 不做 SSO。
- 不保存跨应用 access token。
- 不向其他应用暴露用户数据。

## 安全原则

- 不在代码中写入密钥或 service account JSON。
- 不保存密码、auth token、private key 到前端日志或反馈资料。
- public account 只返回安全字段。
- 跨应用读取必须经过显式授权或严格的第一方服务端判断。
- 默认关闭未来功能入口，避免用户误以为已经能连接其他应用。
