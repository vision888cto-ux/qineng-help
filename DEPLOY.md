# 部署指南 · qineng.help

网站 + 支付接口部署到 **Vercel**（免费，无需买服务器）。

## 一、部署到 Vercel

### 1. 上传代码

将 `xingqiao-account-site` 文件夹推到 GitHub，或直接在 [vercel.com](https://vercel.com) 导入本地项目。

### 2. 配置环境变量

在 Vercel 项目 → **Settings → Environment Variables** 添加：

| 变量名 | 值 |
|--------|-----|
| `EPAY_PID` | `29145` |
| `EPAY_KEY` | 你的 MD5 密钥（商户后台 API 信息页） |
| `EPAY_API_URL` | `https://pay.v8jisu.cn/` |
| `SITE_URL` | `https://qineng.help` |

### 3. 绑定域名

Vercel 项目 → **Settings → Domains** → 添加：

- `qineng.help`
- `www.qineng.help`（可选）

按 Vercel 提示配置 DNS。

---

## 二、阿里云 DNS 解析（你的域名在万网/阿里云）

登录域名控制台 → **解析** → 添加记录：

| 主机记录 | 记录类型 | 记录值 |
|----------|----------|--------|
| `@` | A | `76.76.21.21` |
| `www` | CNAME | `cname.vercel-dns.com` |

（若 Vercel 给出不同值，以 Vercel 面板为准。）

等待 5–30 分钟生效，浏览器访问 https://qineng.help 应能看到网站。

---

## 三、彩虹易支付后台配置

1. 登录 https://pay.v8jisu.cn/
2. **域名授权** → 添加 `qineng.help`
3. 确认已开通 **支付宝 + 微信** 通道

回调地址由代码自动生成，无需手动填写：

- 异步通知：`https://qineng.help/api/pay/notify`
- 同步跳转：`https://qineng.help/api/pay/return`

---

## 四、测试支付

1. 打开 https://qineng.help
2. 选一个商品 → **立即购买**
3. 选支付宝或微信 → **去支付**
4. 用小额（如 ¥0.01，若后台支持）完成一笔测试
5. 在 Vercel → **Logs** 查看 `[pay/notify] 支付成功` 日志

---

## 五、本地调试（可选）

```bash
cd xingqiao-account-site
npm i -g vercel
vercel dev
```

复制 `.env.example` 为 `.env.local` 并填入密钥。

> 本地调试时 notify 回调需要公网地址，可用 [ngrok](https://ngrok.com) 临时暴露，或直接在 Vercel 上测试。

---

## 六、支付成功后

当前流程：**支付成功 → 后台日志记录 → 人工发货**。

后续可扩展：

- 接入 Telegram / 邮件通知客服
- 对接自动发货 API
- 升级 V2 RSA 签名

---

## 常见问题

**创建订单失败？**
- 检查环境变量 EPAY_PID / EPAY_KEY 是否正确
- 确认域名已在彩虹易支付授权
- 查看 Vercel 函数日志中的具体报错

**支付完没跳转？**
- 确认 SITE_URL 为 `https://qineng.help`（带 https，无末尾斜杠）

**签名错误？**
- MD5 密钥是否与后台一致
- 密钥重置后需同步更新 Vercel 环境变量
