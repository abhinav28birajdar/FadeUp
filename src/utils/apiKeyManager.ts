import * as SecureStore from 'expo-secure-store';

const STORE_PREFIX = 'FADEUP_';
const KEYS = {
  SUPABASE_URL: `${STORE_PREFIX}SUPABASE_URL`,
  SUPABASE_KEY: `${STORE_PREFIX}SUPABASE_KEY`,
};

export async function saveSupabaseKeys(url: string, key: string) {
  await SecureStore.setItemAsync(KEYS.SUPABASE_URL, url);
  await SecureStore.setItemAsync(KEYS.SUPABASE_KEY, key);
}

export async function getSupabaseKeys(): Promise<{ url?: string; key?: string }> {
  const url = await SecureStore.getItemAsync(KEYS.SUPABASE_URL);
  const key = await SecureStore.getItemAsync(KEYS.SUPABASE_KEY);
  return { url: url ?? undefined, key: key ?? undefined };
}

export async function clearSupabaseKeys() {
  await SecureStore.deleteItemAsync(KEYS.SUPABASE_URL);
  await SecureStore.deleteItemAsync(KEYS.SUPABASE_KEY);
}
