"use client";

import { deleteDocument, updateDocumentStatus, uploadDocumentImporter } from "@/app/actions/documents";
import type { DocumentListRow, DocumentStatus, ProductRow, SupplierRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { format } from "date-fns";

function statusVariant(
  s: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (s === "verified") return "default";
  if (s === "rejected") return "destructive";
  return "secondary";
}

export function DocumentsVault({
  initial,
  suppliers,
  products,
}: {
  initial: DocumentListRow[];
  suppliers: SupplierRow[];
  products: ProductRow[];
}) {
  const router = useRouter();
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [productId, setProductId] = useState<string>("none");

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file || !supplierId) {
        toast.error("Select a supplier and drop a file.");
        return;
      }
      const fd = new FormData();
      fd.set("supplier_id", supplierId);
      fd.set("product_id", productId === "none" ? "none" : productId);
      fd.set("file", file);
      try {
        await uploadDocumentImporter(fd);
        toast.success("Document uploaded");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      }
    },
    [supplierId, productId, router],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  async function onStatusChange(id: string, status: DocumentStatus) {
    try {
      await updateDocumentStatus(id, status);
      toast.success("Status updated");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  async function onDelete(id: string, path: string) {
    if (!confirm("Remove this file from the vault?")) return;
    try {
      await deleteDocument(id, path);
      toast.success("Document removed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload evidence</CardTitle>
          <CardDescription>
            Drag and drop energy bills, lab reports, or certificates. Tag verification status in
            the table below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-medium">Supplier</span>
              <Select value={supplierId} onValueChange={(v) => setSupplierId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Supplier" />
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
              <span className="text-sm font-medium">Product (optional)</span>
              <Select value={productId} onValueChange={(v) => setProductId(v ?? "none")}>
                <SelectTrigger>
                  <SelectValue placeholder="Link to CN (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.cn_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            {...getRootProps()}
            className="border-input bg-muted/30 hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center transition-colors"
          >
            <input {...getInputProps()} />
            <p className="text-sm font-medium">
              {isDragActive ? "Drop file here…" : "Drag & drop a file, or click to browse"}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">Single file per upload.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evidence register</CardTitle>
          <CardDescription>Status workflow: pending → verified or rejected.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>CN</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initial.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="max-w-[200px] truncate font-medium">{d.filename}</TableCell>
                  <TableCell>{d.supplier_name ?? "—"}</TableCell>
                  <TableCell>{d.cn_code ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                      <Select
                        value={d.status}
                        onValueChange={(v) => onStatusChange(d.id, v as DocumentStatus)}
                      >
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="verified">verified</SelectItem>
                          <SelectItem value="rejected">rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {format(new Date(d.created_at), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => onDelete(d.id, d.storage_path)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {initial.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">No documents yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
