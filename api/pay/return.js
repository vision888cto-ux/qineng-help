import { getConfig, verifySign } from "../../lib/epay.js";

function getParams(req) {
  if (req.method === "GET") return req.query;
  return req.body || {};
}

export default async function handler(req, res) {
  let siteUrl = "https://qineng.help";

  try {
    siteUrl = getConfig().siteUrl;
  } catch {
    /* use default */
  }

  const params = getParams(req);

  try {
    const { key } = getConfig();
    const valid = verifySign(params, key);
    const success = valid && params.trade_status === "TRADE_SUCCESS";
    const order = params.out_trade_no || "";

    const target = success
      ? `${siteUrl}/?pay=success&order=${encodeURIComponent(order)}`
      : `${siteUrl}/?pay=fail&order=${encodeURIComponent(order)}`;

    return res.redirect(302, target);
  } catch {
    return res.redirect(302, `${siteUrl}/?pay=fail`);
  }
}
