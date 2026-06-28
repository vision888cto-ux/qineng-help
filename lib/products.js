/** @type {Record<string, { name: string; price: string }>} */
export const products = {
  gpt: { name: "GPT 成品账号", price: "168.00" },
  claude: { name: "Claude 成品账号", price: "188.00" },
  gemini: { name: "Gemini 成品账号", price: "70.00" },
};

export function getProduct(id) {
  return products[id] || null;
}
