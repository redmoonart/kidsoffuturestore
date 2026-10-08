export function fmt(n) {
  return Number(n).toLocaleString("fr-DZ").replace(/[\s\u00A0\u202F]/g, "\u00A0");
}

export function money(n, currency) {
  return `${fmt(n)} ${currency}`;
}
