import { useLocalStorage } from 'react-use';
import useSWRMutation from 'swr/mutation';
import { LOCAL_STORAGE_KEYS } from '../../config/localStorage.ts';
import {
  createClientSession,
  updateClientSession,
} from '../fetch/api/clientSession.ts';

export function useClientSession(apiKey?: string, environment?: string) {
  const [value, setValue] = useLocalStorage<Record<string, unknown>>(
    LOCAL_STORAGE_KEYS.clientSession,
  );

  const createSession = useSWRMutation(
    apiKey && environment ? ['clientSession', environment, apiKey] : null,
    createClientSession,
  );

  const updateSession = useSWRMutation(
    apiKey && environment && createSession.data?.clientToken
      ? ['clientSession', environment, apiKey, createSession.data.clientToken]
      : null,
    updateClientSession,
  );

  return {
    createClientSession: () => {
      value && createSession.trigger(value);
    },
    updateClientSession: () => {
      value && updateSession.trigger(value);
    },
    config: value,
    clientSession: createSession.data,
    setConfig: setValue,
    error: createSession.error,
    isLoading: createSession.isMutating,
  };
}
