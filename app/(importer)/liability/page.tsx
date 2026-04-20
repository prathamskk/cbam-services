import { LiabilityClient } from "@/components/cbam/liability-client";
import { listShipmentsWithDetails } from "@/lib/queries";

export default async function LiabilityPage() {
  const shipments = await listShipmentsWithDetails();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Liability modeler</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Actual vs default gap analysis: compare the financial cost of EU default emission factors
          against supplier-submitted actuals, then export a mock registry XML payload.
        </p>
      </div>
      <LiabilityClient shipments={shipments} />
    </div>
  );
}
