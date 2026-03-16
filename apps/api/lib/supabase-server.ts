/**
 * Supabase server client helpers for Next.js API routes.
 *
 * - createServerClient: uses service role key for admin operations
 * - createUserClient: uses request cookies/headers for user-scoped operations
 */

import { createServerClient as createSSRClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Admin Supabase client using the service role key.
 * Bypasses RLS. Use only for server-side admin operations.
 */
export function createServerClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * User-scoped Supabase client using request cookies for auth.
 * Respects RLS policies. Use for all user-facing operations.
 */
export async function createUserClient() {
  const cookieStore = await cookies();

  return createSSRClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        for (const { name, value, options } of cookiesToSet) {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Ignore - this is called from a Server Component
          }
        }
      },
    },
  });
}
