"use client";

import { createShipmentFromForm } from "@/app/actions/shipments";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductRow, SupplierRow } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function ShipmentDialog({
  suppliers,
  products,
}: {
  suppliers: SupplierRow[];
  products: ProductRow[];
}) {
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const router = useRouter();

  const supplierLabel = useMemo(() => {
    if (!supplierId) return "Select supplier";
    return suppliers.find((s) => s.id === supplierId)?.name ?? "Select supplier";
  }, [supplierId, suppliers]);

  const productLabel = useMemo(() => {
    if (!productId) return "Select product";
    const p = products.find((x) => x.id === productId);
    if (!p) return "Select product";
    return `${p.cn_code} — ${p.description ?? "Product"}`;
  }, [productId, products]);

  async function action(fd: FormData) {
    try {
      fd.set("supplier_id", supplierId);
      fd.set("product_id", productId);
      await createShipmentFromForm(fd);
      toast.success("Shipment recorded");
      setOpen(false);
      setSupplierId("");
      setProductId("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Add shipment
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New shipment</DialogTitle>
          <DialogDescription>
            Creates default and actual emission rows for liability comparison.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shipment_date">Date</Label>
            <Input id="shipment_date" name="shipment_date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select value={supplierId} onValueChange={(v) => setSupplierId(v ?? "")} required>
              <SelectTrigger id="supplier_id" className="w-full min-w-0 max-w-full justify-between">
                <SelectValue placeholder="Select supplier">{supplierLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Product (CN)</Label>
            <Select value={productId} onValueChange={(v) => setProductId(v ?? "")} required>
              <SelectTrigger id="product_id" className="w-full min-w-0 max-w-full justify-between">
                <SelectValue placeholder="Select product">{productLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.cn_code} — {p.description ?? "Product"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mass_tonnes">Mass (tonnes)</Label>
            <Input
              id="mass_tonnes"
              name="mass_tonnes"
              type="number"
              step="0.001"
              min="0.001"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="actual_emission_factor">
              Actual emission factor (tCO₂e/t) — optional
            </Label>
            <Input
              id="actual_emission_factor"
              name="actual_emission_factor"
              type="number"
              step="0.001"
              min="0"
              placeholder="Defaults to EU default for product if empty"
            />
          </div>
          <Button type="submit" className="w-full" disabled={!supplierId || !productId}>
            Save shipment
          </Button>
        </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
