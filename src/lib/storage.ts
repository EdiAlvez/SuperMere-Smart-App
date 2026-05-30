export function readStoredJson<T>(key: string, fallback: T, storage: Storage = localStorage): T {
  const value = storage.getItem(key);

  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`Valor invalido no storage: ${key}`, error);
    storage.removeItem(key);
    return fallback;
  }
}

export function writeStoredJson<T>(key: string, value: T, storage: Storage = localStorage) {
  storage.setItem(key, JSON.stringify(value));
}

export function removeStoredItem(key: string, storage: Storage = localStorage) {
  storage.removeItem(key);
}
