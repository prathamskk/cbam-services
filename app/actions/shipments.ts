"use server";

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

export async function createShipment(input: {
  shipment_date: string;
  supplier_id: string;
  product_id: string;
  mass_tonnes: number;
  actual_emission_factor?: number | null;
}) {
  const supabase = await requireUser();

  const { data: product, error: pErr } = await supabase
    .from("products")
    .select("default_emission_factor_tco2e_per_tonne")
    .eq("id", input.product_id)
    .single();
  if (pErr || !product) throw pErr ?? new Error("Product not found");

  const defaultFactor = Number(product.default_emission_factor_tco2e_per_tonne);
  const actualFactor =
    input.actual_emission_factor != null && Number.isFinite(input.actual_emission_factor)
      ? input.actual_emission_factor
      : defaultFactor;

  const { data: shipment, error: sErr } = await supabase
    .from("shipments")
    .insert({
      shipment_date: input.shipment_date,
      supplier_id: input.supplier_id,
      product_id: input.product_id,
      mass_tonnes: input.mass_tonnes,
    })
    .select("id")
    .single();

  if (sErr || !shipment) throw sErr ?? new Error("Failed to create shipment");

  const { error: eErr } = await supabase.from("emissions").insert([
    {
      shipment_id: shipment.id,
      type: "default",
      emission_factor_tco2e_per_tonne: defaultFactor,
    },
    {
      shipment_id: shipment.id,
      type: "actual",
      emission_factor_tco2e_per_tonne: actualFactor,
    },
  ]);
  if (eErr) throw eErr;

  revalidatePath("/shipments");
  revalidatePath("/dashboard");
  revalidatePath("/liability");
}

export async function updateShipmentActualFactor(shipmentId: string, actualFactor: number) {
  const supabase = await requireUser();
  const { error } = await supabase
    .from("emissions")
    .update({ emission_factor_tco2e_per_tonne: actualFactor })
    .eq("shipment_id", shipmentId)
    .eq("type", "actual");
  if (error) throw error;
  revalidatePath("/shipments");
  revalidatePath("/liability");
}

export async function deleteShipment(shipmentId: string) {
  const supabase = await requireUser();
  const { error } = await supabase.from("shipments").delete().eq("id", shipmentId);
  if (error) throw error;
  revalidatePath("/shipments");
  revalidatePath("/dashboard");
  revalidatePath("/liability");
}

export async function createShipmentFromForm(formData: FormData) {
  const rawActual = formData.get("actual_emission_factor");
  await createShipment({
    shipment_date: String(formData.get("shipment_date")),
    supplier_id: String(formData.get("supplier_id")),
    product_id: String(formData.get("product_id")),
    mass_tonnes: parseFloat(String(formData.get("mass_tonnes"))),
    actual_emission_factor:
      rawActual != null && String(rawActual).trim() !== ""
        ? parseFloat(String(rawActual))
        : null,
  });
}
