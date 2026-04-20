import { createBrowserClient } from "@supabase/ssr";

const placeholderUrl = "https://placeholder.supabase.co";
const placeholderAnon =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder";

/**
 * Falls back to placeholders so `next build` can prerender without a local `.env`.
 * Configure real values in `.env.local` before running the app against Supabase.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? placeholderUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? placeholderAnon,
  );
}
