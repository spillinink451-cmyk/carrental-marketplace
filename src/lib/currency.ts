const CURRENCY_LOCALES: Record<string, string> = {
  PKR: "en-PK",
  OMR: "en-OM",
  USD: "en-US",
  AED: "en-AE",
  SAR: "en-SA",
};

// OMR (and a few other Gulf currencies) use 3 decimal places, not 2 —
// getting this wrong makes Omani prices display subtly incorrectly.
const THREE_DECIMAL_CURRENCIES = new Set(["OMR", "BHD", "KWD"]);

export function formatCurrency(amount: number | string, currencyCode: string): string {
  const numericAmount = typeof amount === "string" ? Number(amount) : amount;
  const locale = CURRENCY_LOCALES[currencyCode] ?? "en-US";
  const decimals = THREE_DECIMAL_CURRENCIES.has(currencyCode) ? 3 : 2;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(numericAmount);
  } catch {
    // Fallback if Intl doesn't recognize the currency code for some reason
    return `${currencyCode} ${numericAmount.toLocaleString()}`;
  }
}