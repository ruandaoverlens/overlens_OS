import { createBrowserClient } from "@supabase/ssr";

// These are public values (anon key is designed to be exposed client-side).
// Hardcoded to avoid Vercel env var truncation issues with special characters.
const SUPABASE_URL = "https://lqymftfphjexutgtvjuh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxeW1mdGZwaGpleHV0Z3R2anVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTkyNzEsImV4cCI6MjA4ODAzNTI3MX0." +
  "TB9UWWnUuOw3-OiOn_iVxlvTuxYFv2Oh_G23sL7pVw4";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Waits for the Supabase browser client to have a valid session.
 *
 * Uses a module-level flag so the first call waits (via onAuthStateChange),
 * but every subsequent call returns instantly. This prevents:
 * - Lock contention from repeated getSession() calls
 * - Accumulated subscriptions on every client-side navigation
 * - Blocking when the client is busy with other requests (e.g. polling)
 */
let _authReady = false;
let _authPromise: Promise<void> | null = null;

export function waitForAuth(): Promise<void> {
  // Fast path — auth already confirmed, no work needed
  if (_authReady) return Promise.resolve();

  // Deduplicate — only one subscription at a time
  if (!_authPromise) {
    _authPromise = new Promise<void>((resolve) => {
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        () => {
          // INITIAL_SESSION fires immediately with current state
          _authReady = true;
          subscription.unsubscribe();
          resolve();
        }
      );
      // Hard timeout — never block longer than 2s
      setTimeout(() => {
        _authReady = true;
        subscription.unsubscribe();
        resolve();
      }, 2000);
    });
  }

  return _authPromise;
}
