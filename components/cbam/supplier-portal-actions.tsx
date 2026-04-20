"use client";

import { mintPortalLink } from "@/app/actions/suppliers";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CopyPortalLinkButton({ supplierId }: { supplierId: string }) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={async () => {
        try {
          const url = await mintPortalLink(supplierId);
          await navigator.clipboard.writeText(url);
          toast.success("Portal link copied to clipboard");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Could not create link");
        }
      }}
    >
      Copy portal link
    </Button>
  );
}
