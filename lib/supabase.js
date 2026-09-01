// lib/supabase.js
// ─────────────────────────────────────────────
// Supabase Admin Client (Server-only)
// Lazy-initialized to avoid crashing at module load
// if env vars are not yet configured.
// ─────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js';

let _client = null;

/**
 * Returns the Supabase admin client, initializing it on first call.
 * Throws a clear error only when actually used (not at module load).
 */
export function getSupabaseAdmin() {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY ' +
      'harus di-set di environment variables.'
    );
  }

  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}
