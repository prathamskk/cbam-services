"use server";

import { hashToken } from "@/lib/token";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

export type PortalContext = {
  supplierId: string;
  supplierName: string;
};

export async function validatePortalToken(rawToken: string): Promise<PortalContext | null> {
  const h = hashToken(rawToken);
  const sb = createServiceClient();
  const { data: row, error } = await sb
    .from("supplier_portal_tokens")
    .select("supplier_id, expires_at")
    .eq("token_hash", h)
    .maybeSingle();
  if (error || !row) return null;
  if (row.expires_at && new Date(row.expires_at) < new Date()) return null;

  const { data: sup, error: sErr } = await sb
    .from("suppliers")
    .select("id, name")
    .eq("id", row.supplier_id)
    .single();
  if (sErr || !sup) return null;

  return { supplierId: sup.id, supplierName: sup.name };
}

export async function portalUploadDocument(formData: FormData) {
  const rawToken = formData.get("token") as string;
  const product_id_raw = formData.get("product_id") as string | null;
  const product_id = product_id_raw && product_id_raw !== "none" ? product_id_raw : null;
  const file = formData.get("file") as File | null;

  const ctx = await validatePortalToken(rawToken);
  if (!ctx) throw new Error("Invalid or expired link");
  if (!file) throw new Error("Missing file");

  const buffer = Buffer.from(await file.arrayBuffer());
  const sb = createServiceClient();
  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${ctx.supplierId}/${id}-${safeName}`;

  const { error: upErr } = await sb.storage.from("documents").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) throw upErr;

  const { error: dbErr } = await sb.from("documents").insert({
    id,
    supplier_id: ctx.supplierId,
    product_id,
    storage_path: path,
    filename: file.name,
    status: "pending",
  });
  if (dbErr) throw dbErr;

  revalidatePath(`/portal/${rawToken}`);
}
