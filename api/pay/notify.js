import { getProduct } from "../../lib/products.js";
import { getConfig, verifySign } from "../../lib/epay.js";

function getParams(req) {
  if (req.method === "GET") return req.query;
  return req.body || {};
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).send("fail");
  }

  try {
    const params = getParams(req);
    const { key } = getConfig();

    if (!verifySign(params, key)) {
      console.error("[pay/notify] 签名验证失败", params.out_trade_no);
      return res.status(400).send("fail");
    }

    const { trade_status, out_trade_no, money, param, trade_no, type } = params;

    if (trade_status !== "TRADE_SUCCESS") {
      return res.status(200).send("success");
    }

    const product = param ? getProduct(param) : null;
    if (product && product.price !== money) {
      console.error("[pay/notify] 金额不匹配", { expected: product.price, got: money, out_trade_no });
      return res.status(400).send("fail");
    }

    console.log("[pay/notify] 支付成功", {
      out_trade_no,
      trade_no,
      money,
      type,
      product: product?.name || param,
    });

    // TODO: 接入自动发货或通知客服（邮件 / Telegram / 数据库）

    return res.status(200).send("success");
  } catch (err) {
    console.error("[pay/notify]", err);
    return res.status(500).send("fail");
  }
}
