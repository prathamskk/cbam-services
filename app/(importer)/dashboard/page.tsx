import { DashboardYearControls } from "@/components/cbam/dashboard-year-controls";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getThresholdByCnCode } from "@/lib/queries";
import Link from "next/link";

const THRESHOLD = 50;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const sp = await searchParams;
  const parsed = sp.year ? parseInt(sp.year, 10) : new Date().getFullYear();
  const year = Number.isFinite(parsed) ? parsed : new Date().getFullYear();
  const rows = await getThresholdByCnCode(year);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-balance text-2xl text-foreground sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          Threshold intelligence: aggregate import mass by CN code versus the{" "}
          <strong>{THRESHOLD} tonne</strong> annual exemption band used in this MVP model.
        </p>
      </div>

      <DashboardYearControls year={year} />

      <div className="grid gap-4 md:grid-cols-2">
        {rows.length === 0 ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>No shipments</CardTitle>
              <CardDescription>
                Add shipments for {year} to see threshold exposure by CN code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/shipments" className="text-primary text-sm underline underline-offset-4">
                Go to shipment register
              </Link>
            </CardContent>
          </Card>
        ) : (
          rows.map((r) => (
            <Card key={r.cn_code}>
              <CardHeader>
                <CardTitle className="text-lg">CN {r.cn_code}</CardTitle>
                <CardDescription>
                  Cumulative mass in {year}:{" "}
                  <span className="text-foreground font-medium">
                    {r.total_mass_tonnes.toFixed(2)} t
                  </span>{" "}
                  · Remaining to {THRESHOLD} t:{" "}
                  <span className="text-foreground font-medium">
                    {r.remaining_tonnes.toFixed(2)} t
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress toward {THRESHOLD} t</span>
                  <span>{r.pct_of_threshold.toFixed(0)}%</span>
                </div>
                <Progress value={r.pct_of_threshold} className="h-2" />
                {r.total_mass_tonnes >= THRESHOLD * 0.95 ? (
                  <p className="text-destructive text-xs">
                    Approaching or past the model threshold — plan registration before the next
                    shipment.
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Separator />

      <div className="flex flex-wrap gap-4 text-sm">
        <Link className="text-primary underline underline-offset-4" href="/documents">
          Evidence vault
        </Link>
        <Link className="text-primary underline underline-offset-4" href="/liability">
          Liability modeler
        </Link>
        <Link className="text-primary underline underline-offset-4" href="/suppliers">
          Supplier portal links
        </Link>
      </div>
    </div>
  );
}
