import { DocumentsVault } from "@/components/cbam/documents-vault";
import { listDocumentsWithRelations, listProducts, listSuppliers } from "@/lib/queries";

export default async function DocumentsPage() {
  const [docs, suppliers, products] = await Promise.all([
    listDocumentsWithRelations(),
    listSuppliers(),
    listProducts(),
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-balance">Evidence vault</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Legal-grade file storage with review states. Files live in a private Supabase Storage
          bucket; metadata links supplier, optional CN code, and verification status.
        </p>
      </div>
      <DocumentsVault initial={docs} suppliers={suppliers} products={products} />
    </div>
  );
}
