import { useLocalStorage } from 'react-use';
import { LOCAL_STORAGE_KEYS } from '../../config/localStorage.ts';

type APICondfig = {
  apiKey: string;
  environment: string;
};

export function useAPIConfig() {
  const [value, setValue] = useLocalStorage<APICondfig>(
    LOCAL_STORAGE_KEYS.apiConfig,
  );

  return {
    config: value,
    setConfig: (values: APICondfig) => {
      setValue(values);
    },
  };
}
