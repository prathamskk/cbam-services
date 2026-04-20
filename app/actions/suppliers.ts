"use server";

import { hashToken, generatePortalToken } from "@/lib/token";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

export async function createSupplier(input: {
  name: string;
  country?: string | null;
  carbon_maturity_score?: number | null;
}) {
  const supabase = await requireUser();
  const { error } = await supabase.from("suppliers").insert({
    name: input.name,
    country: input.country ?? null,
    carbon_maturity_score: input.carbon_maturity_score ?? null,
  });
  if (error) throw error;
  revalidatePath("/suppliers");
}

export async function createSupplierFromForm(formData: FormData) {
  const scoreRaw = formData.get("score");
  await createSupplier({
    name: String(formData.get("name")),
    country: String(formData.get("country") || "") || null,
    carbon_maturity_score:
      scoreRaw != null && String(scoreRaw).trim() !== ""
        ? parseFloat(String(scoreRaw))
        : null,
  });
}

export async function mintPortalLink(supplierId: string) {
  const supabase = await requireUser();
  const raw = generatePortalToken();
  const token_hash = hashToken(raw);
  const { error } = await supabase.from("supplier_portal_tokens").insert({
    supplier_id: supplierId,
    token_hash,
    expires_at: null,
  });
  if (error) throw error;

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  revalidatePath("/suppliers");
  return `${base}/portal/${raw}`;
}
