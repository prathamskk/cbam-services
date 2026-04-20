import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const placeholderUrl = "https://placeholder.supabase.co";
const placeholderAnon =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.placeholder";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? placeholderUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? placeholderAnon,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — ignore if middleware already set cookies.
          }
        },
      },
    },
  );
}
