import { ShipmentDialog } from "@/components/cbam/shipment-dialog";
import { DeleteShipmentButton } from "@/components/cbam/delete-shipment-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listProducts, listShipmentsWithDetails, listSuppliers } from "@/lib/queries";
import { format } from "date-fns";

export default async function ShipmentsPage() {
  const [shipments, suppliers, products] = await Promise.all([
    listShipmentsWithDetails(),
    listSuppliers(),
    listProducts(),
  ]);

  function factor(type: string) {
    return (emissions: { type: string; emission_factor_tco2e_per_tonne: number }[]) => {
      const row = emissions.find((e) => e.type === type);
      return row ? row.emission_factor_tco2e_per_tonne : null;
    };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-balance text-2xl text-foreground sm:text-3xl">Shipment register</h1>
          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Immutable-style audit trail for imports: date, mass, CN code, and supplier. Emission
            factors power the default vs actual liability view.
          </p>
        </div>
        <ShipmentDialog suppliers={suppliers} products={products} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
          <CardDescription>
            {shipments.length} record{shipments.length === 1 ? "" : "s"} loaded from Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>CN</TableHead>
                <TableHead className="text-right">Mass (t)</TableHead>
                <TableHead className="text-right">Default EF</TableHead>
                <TableHead className="text-right">Actual EF</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((s) => {
                const def = factor("default")(s.emissions);
                const act = factor("actual")(s.emissions);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(s.shipment_date), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>{s.supplier.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.product.cn_code}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{s.mass_tonnes.toFixed(3)}</TableCell>
                    <TableCell className="text-right">
                      {def != null ? def.toFixed(3) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {act != null ? act.toFixed(3) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeleteShipmentButton shipmentId={s.id} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {shipments.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">No shipments yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
