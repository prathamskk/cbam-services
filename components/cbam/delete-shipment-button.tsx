"use client";

import { deleteShipment } from "@/app/actions/shipments";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DeleteShipmentButton({ shipmentId }: { shipmentId: string }) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive"
      onClick={async () => {
        if (!confirm("Delete this shipment and its emissions?")) return;
        try {
          await deleteShipment(shipmentId);
          toast.success("Shipment removed");
          router.refresh();
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Delete failed");
        }
      }}
    >
      Delete
    </Button>
  );
}
