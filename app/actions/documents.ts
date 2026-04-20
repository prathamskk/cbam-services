"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DocumentStatus } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return supabase;
}

export async function uploadDocumentImporter(formData: FormData) {
  const supabase = await requireUser();

  const supplier_id = formData.get("supplier_id") as string;
  const product_id_raw = formData.get("product_id") as string | null;
  const product_id = product_id_raw && product_id_raw !== "none" ? product_id_raw : null;
  const file = formData.get("file") as File | null;
  if (!file || !supplier_id) throw new Error("Missing file or supplier");

  const buffer = Buffer.from(await file.arrayBuffer());
  const id = crypto.randomUUID();
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${supplier_id}/${id}-${safeName}`;

  const { error: upErr } = await supabase.storage.from("documents").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (upErr) throw upErr;

  const { error: dbErr } = await supabase.from("documents").insert({
    id,
    supplier_id,
    product_id,
    storage_path: path,
    filename: file.name,
    status: "pending",
  });
  if (dbErr) throw dbErr;

  revalidatePath("/documents");
}

export async function updateDocumentStatus(documentId: string, status: DocumentStatus) {
  const supabase = await requireUser();
  const { error } = await supabase
    .from("documents")
    .update({
      status,
      reviewed_at: status === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", documentId);
  if (error) throw error;
  revalidatePath("/documents");
}

export async function deleteDocument(documentId: string, storage_path: string) {
  const supabase = await requireUser();
  const { error: stErr } = await supabase.storage.from("documents").remove([storage_path]);
  if (stErr) throw stErr;
  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) throw error;
  revalidatePath("/documents");
}
