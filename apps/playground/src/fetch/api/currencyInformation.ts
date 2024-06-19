import { ASSETS_URL } from '../../../envs.ts';
import { get } from '../fetch';

export const CURRENCY_INFORMATION = `/currency-information/v1/data.json`;

type CurrencyData = { m: number; c: string }[];

export const fetchCurrencyInformation = () =>
  get<Response>(ASSETS_URL + CURRENCY_INFORMATION)
    .then((response) => response.json())
    .then((data: CurrencyData) => {
      return new Map(data.map(({ c, m }) => [c, m]));
    });
