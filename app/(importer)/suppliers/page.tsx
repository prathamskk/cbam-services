import { CopyPortalLinkButton } from "@/components/cbam/supplier-portal-actions";
import { CreateSupplierForm } from "@/components/cbam/create-supplier-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listSuppliers } from "@/lib/queries";

export default async function SuppliersPage() {
  const suppliers = await listSuppliers();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-balance">Suppliers &amp; portal links</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Issue a unique, revocable-by-rotation portal URL so a factory can upload evidence without
          seeing other vendors.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add supplier</CardTitle>
          <CardDescription>Creates a supplier row for shipments and document tagging.</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateSupplierForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Directory</CardTitle>
          <CardDescription>Generate a portal token and copy the link to share.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Maturity</TableHead>
                <TableHead className="text-right">Portal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.country ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {s.carbon_maturity_score ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <CopyPortalLinkButton supplierId={s.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {suppliers.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">No suppliers yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
