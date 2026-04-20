import { createClient } from "@/lib/supabase/server";
import type { DocumentListRow, ShipmentDetail } from "@/lib/types";

const THRESHOLD_TONNES = 50;

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function listSuppliers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("cn_code", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listShipmentsWithDetails(): Promise<ShipmentDetail[]> {
  const supabase = await createClient();
  const { data: shipments, error } = await supabase
    .from("shipments")
    .select("id, shipment_date, mass_tonnes, supplier_id, product_id")
    .order("shipment_date", { ascending: false });
  if (error) throw error;
  if (!shipments?.length) return [];

  const supplierIds = [...new Set(shipments.map((s) => s.supplier_id))];
  const productIds = [...new Set(shipments.map((s) => s.product_id))];

  const shipmentIds = shipments.map((s) => s.id);

  const [{ data: suppliers }, { data: products }, { data: emissions }] = await Promise.all([
    supabase.from("suppliers").select("id, name, country").in("id", supplierIds),
    supabase
      .from("products")
      .select("id, cn_code, description, default_emission_factor_tco2e_per_tonne")
      .in("id", productIds),
    shipmentIds.length
      ? supabase
          .from("emissions")
          .select("shipment_id, type, emission_factor_tco2e_per_tonne")
          .in("shipment_id", shipmentIds)
      : Promise.resolve({ data: [] as { shipment_id: string; type: string; emission_factor_tco2e_per_tonne: number }[] }),
  ]);

  const supMap = new Map((suppliers ?? []).map((s) => [s.id, s]));
  const prodMap = new Map((products ?? []).map((p) => [p.id, p]));
  const emByShipment = new Map<string, { type: string; emission_factor_tco2e_per_tonne: number }[]>();
  for (const e of emissions ?? []) {
    const list = emByShipment.get(e.shipment_id) ?? [];
    list.push({
      type: e.type,
      emission_factor_tco2e_per_tonne: Number(e.emission_factor_tco2e_per_tonne),
    });
    emByShipment.set(e.shipment_id, list);
  }

  return shipments.map((s) => {
    const supplier = supMap.get(s.supplier_id);
    const product = prodMap.get(s.product_id);
    if (!supplier || !product) {
      throw new Error("Missing related supplier or product for shipment");
    }
    return {
      id: s.id,
      shipment_date: s.shipment_date,
      mass_tonnes: Number(s.mass_tonnes),
      supplier,
      product,
      emissions: emByShipment.get(s.id) ?? [],
    };
  });
}

export type CnThresholdRow = {
  cn_code: string;
  total_mass_tonnes: number;
  pct_of_threshold: number;
  remaining_tonnes: number;
};

export async function getThresholdByCnCode(year: number): Promise<CnThresholdRow[]> {
  const supabase = await createClient();
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const { data: rows, error } = await supabase
    .from("shipments")
    .select("mass_tonnes, product_id")
    .gte("shipment_date", start)
    .lte("shipment_date", end);
  if (error) throw error;

  const productIds = [...new Set((rows ?? []).map((r) => r.product_id))];
  let cnByProduct = new Map<string, string>();
  if (productIds.length) {
    const { data: products } = await supabase
      .from("products")
      .select("id, cn_code")
      .in("id", productIds);
    cnByProduct = new Map((products ?? []).map((p) => [p.id, p.cn_code]));
  }

  const map = new Map<string, number>();
  for (const r of rows ?? []) {
    const cn = cnByProduct.get(r.product_id) ?? "unknown";
    const m = Number(r.mass_tonnes);
    map.set(cn, (map.get(cn) ?? 0) + m);
  }

  return Array.from(map.entries()).map(([cn_code, total]) => ({
    cn_code,
    total_mass_tonnes: total,
    pct_of_threshold: Math.min(100, (total / THRESHOLD_TONNES) * 100),
    remaining_tonnes: Math.max(0, THRESHOLD_TONNES - total),
  }));
}

export async function listDocumentsWithRelations(): Promise<DocumentListRow[]> {
  const supabase = await createClient();
  const { data: docs, error } = await supabase
    .from("documents")
    .select(
      "id, supplier_id, product_id, storage_path, filename, status, reviewed_at, created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!docs?.length) return [];

  const supplierIds = [...new Set(docs.map((d) => d.supplier_id))];
  const productIds = [...new Set(docs.map((d) => d.product_id).filter(Boolean) as string[])];

  const [{ data: suppliers }, { data: products }] = await Promise.all([
    supabase.from("suppliers").select("id, name").in("id", supplierIds),
    productIds.length
      ? supabase.from("products").select("id, cn_code").in("id", productIds)
      : Promise.resolve({ data: [] as { id: string; cn_code: string }[] }),
  ]);

  const supMap = new Map((suppliers ?? []).map((s) => [s.id, s.name]));
  const prodMap = new Map((products ?? []).map((p) => [p.id, p.cn_code]));

  return docs.map((d) => ({
    ...d,
    supplier_name: supMap.get(d.supplier_id) ?? null,
    cn_code: d.product_id ? prodMap.get(d.product_id) ?? null : null,
  }));
}

