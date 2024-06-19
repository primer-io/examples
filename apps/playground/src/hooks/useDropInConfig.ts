import { useLocalStorage } from 'react-use';
import { LOCAL_STORAGE_KEYS } from '../../config/localStorage.ts';

export function useDropInConfig() {
  const [value, setValue] = useLocalStorage<Record<string, unknown>>(
    LOCAL_STORAGE_KEYS.dropInConfig,
  );

  return {
    config: value,
    setConfig: (values: Record<string, unknown>) => {
      setValue(values);
    },
  };
}
