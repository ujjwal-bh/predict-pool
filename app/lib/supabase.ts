import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;
let supabaseServerInstance: any = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      supabaseInstance = createClient(url, key);
    }
  }
  return supabaseInstance;
};

export const supabaseServer = () => {
  if (!supabaseServerInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      supabaseServerInstance = createClient(url, key);
    }
  }
  return supabaseServerInstance;
};

export const supabase = new Proxy({}, {
  get: (_, prop) => {
    const instance = getSupabase();
    return instance?.[prop as string];
  },
}) as any;
