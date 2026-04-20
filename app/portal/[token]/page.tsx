import { validatePortalToken } from "@/app/actions/portal";
import { PortalClient } from "@/components/cbam/portal-client";
import { createServiceClient } from "@/lib/supabase/service";
import type { ProductRow } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const ctx = await validatePortalToken(token);
  if (!ctx) notFound();

  const sb = createServiceClient();
  const [{ data: products }, { data: rawDocs }] = await Promise.all([
    sb.from("products").select("*").order("cn_code", { ascending: true }),
    sb
      .from("documents")
      .select("id, filename, status, created_at, product_id")
      .eq("supplier_id", ctx.supplierId)
      .order("created_at", { ascending: false }),
  ]);

  const productRows = (products ?? []) as ProductRow[];
  const productMap = new Map(productRows.map((p) => [p.id, p.cn_code]));

  const documents = (rawDocs ?? []).map((d) => ({
    id: d.id,
    filename: d.filename,
    status: d.status,
    created_at: d.created_at,
    cn_code: d.product_id ? productMap.get(d.product_id) ?? null : null,
  }));

  return (
    <div className="bg-background min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <PortalClient
          token={token}
          supplierName={ctx.supplierName}
          products={productRows}
          documents={documents}
        />
      </div>
    </div>
  );
}
