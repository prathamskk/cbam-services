import { createClient } from "@supabase/supabase-js";

/**
 * Service role client — server-only. Used for supplier portal after token validation.
 * Never import from client components.
 */
const placeholderUrl = "https://placeholder.supabase.co";
const placeholderService =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.placeholder";

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? placeholderUrl;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? placeholderService;
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
