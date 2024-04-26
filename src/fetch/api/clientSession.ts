import { MutationFetcher } from 'swr/mutation';
import { API_URLS } from '../../../envs.ts';
import { ClientSession } from '../../types/clientSession.ts';
import { patch, post } from '../fetch.ts';

export const createClientSession: MutationFetcher<
  ClientSession,
  [string, string, string],
  Record<string, unknown>
> = ([_key, env, apiKey], { arg }) => {
  const apiURL = API_URLS[env];

  return post(`${apiURL}/client-session`, {
    headers: {
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify(arg),
  });
};

export const updateClientSession: MutationFetcher<
  ClientSession,
  [string, string, string, string],
  Record<string, unknown>
> = ([_key, env, apiKey, clientToken], { arg }) => {
  const apiURL = API_URLS[env];

  return patch(`${apiURL}/client-session`, {
    headers: {
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ clientToken, ...arg }),
  });
};
