import { useApp } from "@/context/AppContext";
import { CURRENCY_SYMBOLS, formatCurrency } from "@/utils/finance";

/**
 * All transaction amounts are stored in EUR (base currency).
 * This hook provides helpers to:
 *   - format(eurAmount)  → display string in user's selected currency
 *   - toBase(displayAmt) → convert from user's display currency back to EUR for storage
 *   - symbol             → currency symbol string
 *   - currency           → ISO currency code
 */
export function useCurrency() {
  const { profile, convertAmount, exchangeRates } = useApp();
  const currency = profile.currency || "EUR";
  const symbol = CURRENCY_SYMBOLS[currency] || "€";

  /** Convert EUR → display currency and format as string */
  const format = (eurAmount: number): string => {
    const converted = convertAmount(eurAmount, currency);
    return formatCurrency(converted, currency);
  };

  /** Convert display currency amount → EUR (for saving to storage) */
  const toBase = (displayAmount: number): number => {
    const rate = exchangeRates[currency] ?? 1;
    return displayAmount / rate;
  };

  /** Convert EUR amount to display currency number (without formatting) */
  const convert = (eurAmount: number): number => {
    return convertAmount(eurAmount, currency);
  };

  return { format, toBase, convert, symbol, currency };
}
