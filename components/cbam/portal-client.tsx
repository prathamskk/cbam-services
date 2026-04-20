"use client";

import { portalUploadDocument } from "@/app/actions/portal";
import type { ProductRow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
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
import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { format } from "date-fns";

type DocRow = {
  id: string;
  filename: string;
  status: string;
  created_at: string;
  cn_code: string | null;
};

export function PortalClient({
  token,
  supplierName,
  products,
  documents,
}: {
  token: string;
  supplierName: string;
  products: ProductRow[];
  documents: DocRow[];
}) {
  const router = useRouter();
  const [productId, setProductId] = useState<string>("none");

  const productLabel = useMemo(() => {
    if (productId === "none") return "None";
    return products.find((p) => p.id === productId)?.cn_code ?? "CN code";
  }, [productId, products]);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      const fd = new FormData();
      fd.set("token", token);
      fd.set("product_id", productId === "none" ? "none" : productId);
      fd.set("file", file);
      try {
        await portalUploadDocument(fd);
        toast.success("Uploaded");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      }
    },
    [token, productId, router],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
  });

  function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
    if (s === "verified") return "default";
    if (s === "rejected") return "destructive";
    return "secondary";
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-balance text-2xl text-foreground sm:text-3xl">Supplier portal</h1>
        <p className="text-muted-foreground text-sm">
          You are signed in as <strong>{supplierName}</strong>. Upload evidence for your products
          only — other importers&apos; vendors are never visible here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload evidence</CardTitle>
          <CardDescription>Optional: link a file to a CN code for faster triage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-w-sm space-y-2">
            <span className="text-sm font-medium">Product (optional)</span>
            <Select value={productId} onValueChange={(v) => setProductId(v ?? "none")}>
              <SelectTrigger className="w-full min-w-0 max-w-full justify-between">
                <SelectValue placeholder="CN code">{productLabel}</SelectValue>
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
          <div
            {...getRootProps()}
            className="border-input bg-muted/30 hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center transition-colors"
          >
            <input {...getInputProps()} />
            <p className="text-sm font-medium">
              {isDragActive ? "Drop file here…" : "Drag & drop a file, or click to browse"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your submissions</CardTitle>
          <CardDescription>Statuses are reviewed by your importer.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>CN</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="max-w-[220px] truncate font-medium">{d.filename}</TableCell>
                  <TableCell>{d.cn_code ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {format(new Date(d.created_at), "yyyy-MM-dd HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {documents.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">No uploads yet.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
