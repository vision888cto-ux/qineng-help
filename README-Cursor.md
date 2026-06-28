# 星桥账号 · 出海账号服务网站

面向中文用户的出海账号、AI Token 与平台教程站点，已接入彩虹易支付（支付宝 + 微信）。

## 预览

```bash
npx vercel dev
```

或部署后访问 https://qineng.help

## 文件结构

- `index.html` / `styles.css` / `script.js` — 前端页面
- `api/pay/` — 支付接口（Vercel Serverless）
- `lib/` — 签名与商品配置
- `DEPLOY.md` — **部署与域名配置说明（必读）**

## 支付流程

1. 用户选商品 → 选支付宝/微信
2. `POST /api/pay/create` 创建订单
3. 跳转彩虹易支付收银台
4. 支付成功 → `/api/pay/notify` 回调 → 跳转回首页

## 环境变量

见 `.env.example`，部署时在 Vercel 后台配置。
