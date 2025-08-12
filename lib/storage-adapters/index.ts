import { StorageAdapter } from './types';
import { SupabaseStorageAdapter } from './supabase';
import { LocalStorageAdapter } from './local';

export function createStorageAdapter(): StorageAdapter {
  if (process.env.NODE_ENV === 'development' && !process.env.SUPABASE_URL) {
    return new LocalStorageAdapter();
  }
  
  return new SupabaseStorageAdapter();
}

export * from './types';
export { SupabaseStorageAdapter } from './supabase';
export { LocalStorageAdapter } from './local';