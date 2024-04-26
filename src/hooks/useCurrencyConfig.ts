import useSWRImmutable from 'swr/immutable';
import {
  CURRENCY_INFORMATION,
  fetchCurrencyInformation,
} from '../fetch/api/currencyInformation.ts';

export let currencyInformation = new Map<string, number>();

export const setCurrencyInformation = (data: typeof currencyInformation) => {
  currencyInformation = data;
};

export const useCurrencyInformation = () => {
  const { isLoading, error } = useSWRImmutable(
    CURRENCY_INFORMATION,
    fetchCurrencyInformation,
    {
      onSuccess: setCurrencyInformation,
    },
  );

  if (error) throw error;

  return { isLoading };
};
