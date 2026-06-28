import { getProduct } from "../../lib/products.js";
import { createOrderNo, createPayment, getClientIp, getConfig } from "../../lib/epay.js";

const PAY_TYPES = { alipay: "alipay", wxpay: "wxpay" };

async function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body) return JSON.parse(req.body);
  return {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, msg: "Method not allowed" });
  }

  try {
    const { productId, payType } = await parseBody(req);
    const product = getProduct(productId);
    const type = PAY_TYPES[payType];

    if (!product) {
      return res.status(400).json({ ok: false, msg: "商品不存在" });
    }
    if (!type) {
      return res.status(400).json({ ok: false, msg: "请选择支付宝或微信支付" });
    }

    const { siteUrl } = getConfig();
    const outTradeNo = createOrderNo();

    const result = await createPayment({
      type,
      outTradeNo,
      name: product.name,
      money: product.price,
      notifyUrl: `${siteUrl}/api/pay/notify`,
      returnUrl: `${siteUrl}/api/pay/return`,
      clientip: getClientIp(req),
      param: productId,
    });

    if (result.code !== 1) {
      return res.status(502).json({ ok: false, msg: result.msg || "创建支付失败" });
    }

    if (result.payurl) {
      return res.status(200).json({
        ok: true,
        payurl: result.payurl,
        outTradeNo,
        qrcode: result.qrcode || null,
      });
    }

    if (result.qrcode) {
      return res.status(200).json({
        ok: true,
        qrcode: result.qrcode,
        outTradeNo,
        payurl: null,
      });
    }

    return res.status(502).json({ ok: false, msg: "支付接口未返回付款链接" });
  } catch (err) {
    console.error("[pay/create]", err);
    return res.status(500).json({ ok: false, msg: err.message || "服务器错误" });
  }
}
