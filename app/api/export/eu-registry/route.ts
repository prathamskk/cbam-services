import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Mock EU CBAM registry XML. Replace structure with the official XSD when available.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ data: shipments }, { data: suppliers }, { data: products }, { data: emissions }] =
    await Promise.all([
      supabase.from("shipments").select("*").order("shipment_date", { ascending: true }),
      supabase.from("suppliers").select("*"),
      supabase.from("products").select("*"),
      supabase.from("emissions").select("*"),
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

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const lines: string[] = [];
  lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  lines.push(
    `<CBAMRegistrySubmission xmlns="https://example.com/cbam/mock" mock="true" generatedAt="${new Date().toISOString()}">`,
  );
  lines.push(`  <Meta>`);
  lines.push(`    <ExporterUser>${escape(user.email ?? user.id)}</ExporterUser>`);
  lines.push(`    <Note>Placeholder schema for MVP — validate against official EU registry XSD before filing.</Note>`);
  lines.push(`  </Meta>`);
  lines.push(`  <Shipments>`);

  for (const s of shipments ?? []) {
    const sup = supMap.get(s.supplier_id);
    const prod = prodMap.get(s.product_id);
    const ems = emByShipment.get(s.id) ?? [];
    const def = ems.find((x) => x.type === "default");
    const act = ems.find((x) => x.type === "actual");
    lines.push(`    <Shipment id="${s.id}">`);
    lines.push(`      <Date>${s.shipment_date}</Date>`);
    lines.push(`      <MassTonnes>${Number(s.mass_tonnes)}</MassTonnes>`);
    lines.push(`      <Supplier name="${escape(sup?.name ?? "")}" country="${escape(sup?.country ?? "")}" />`);
    lines.push(
      `      <Product cnCode="${escape(prod?.cn_code ?? "")}" description="${escape(prod?.description ?? "")}" />`,
    );
    lines.push(
      `      <Emissions defaultFactor="${def?.emission_factor_tco2e_per_tonne ?? ""}" actualFactor="${act?.emission_factor_tco2e_per_tonne ?? ""}" />`,
    );
    lines.push(`    </Shipment>`);
  }

  lines.push(`  </Shipments>`);
  lines.push(`</CBAMRegistrySubmission>`);

  const xml = lines.join("\n");

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="cbam-registry-mock-${Date.now()}.xml"`,
    },
  });
}
