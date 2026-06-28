import crypto from "crypto";

export function getConfig() {
  const pid = process.env.EPAY_PID;
  const key = process.env.EPAY_KEY;
  const apiUrl = (process.env.EPAY_API_URL || "https://pay.v8jsu.cn/").replace(/\/?$/, "/");
  const siteUrl = (process.env.SITE_URL || "https://qineng.help").replace(/\/?$/, "");

  if (!pid || !key) {
    throw new Error("缺少 EPAY_PID 或 EPAY_KEY 环境变量");
  }

  return { pid, key, apiUrl, siteUrl };
}

/** 彩虹易支付 V1 MD5 签名 */
export function buildSign(params, key) {
  const sorted = Object.keys(params)
    .filter((k) => params[k] !== "" && params[k] != null && k !== "sign" && k !== "sign_type")
    .sort();

  const str = sorted.map((k) => `${k}=${params[k]}`).join("&") + key;
  return crypto.createHash("md5").update(str, "utf8").digest("hex");
}

export function verifySign(params, key) {
  const sign = params.sign;
  if (!sign) return false;
  return buildSign(params, key).toLowerCase() === String(sign).toLowerCase();
}

export function createOrderNo() {
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `XQ${Date.now()}${rand}`;
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "127.0.0.1";
}

/** 调用 mapi.php 创建支付订单 */
export async function createPayment({ type, outTradeNo, name, money, notifyUrl, returnUrl, clientip, param }) {
  const { pid, key, apiUrl } = getConfig();

  const params = {
    pid,
    type,
    out_trade_no: outTradeNo,
    notify_url: notifyUrl,
    return_url: returnUrl,
    name: name.slice(0, 127),
    money,
    clientip,
    param: param || "",
    sign_type: "MD5",
  };
  params.sign = buildSign(params, key);

  const body = new URLSearchParams(params);
  const res = await fetch(`${apiUrl}mapi.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`支付接口返回异常: ${text.slice(0, 200)}`);
  }
}
