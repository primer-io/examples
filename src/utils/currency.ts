import { currencyInformation } from '../hooks/useCurrencyConfig.ts';

export const currencyCodes = Intl.supportedValuesOf?.('currency');

export const currencyMinorUnits = (currency: string) =>
  currencyInformation.get(currency) ?? 0;

export const currencySubUnit = (currency: string, minorUnits?: number) =>
  10 ** (minorUnits ?? currencyMinorUnits(currency));

export function formatMoney(
  inputValue: number | string | null | undefined,
  currencyCode?: string,
) {
  // To keep it backwards compatible
  if (inputValue === undefined || inputValue === null) return '0';

  const inputValueAsNumber = Number(inputValue);

  if (isNaN(inputValueAsNumber)) return '0';

  const subUnit = currencySubUnit(currencyCode ?? '');

  const value = inputValueAsNumber / subUnit;

  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}
