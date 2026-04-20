"use client";

import { computeTaxEur } from "@/lib/cbam/calc";
import type { ShipmentDetail } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function factors(emissions: ShipmentDetail["emissions"], type: string) {
  const row = emissions.find((e) => e.type === type);
  return row?.emission_factor_tco2e_per_tonne ?? 0;
}

export function LiabilityClient({ shipments }: { shipments: ShipmentDetail[] }) {
  const [ets, setEts] = useState(80);

  const rows = useMemo(() => {
    return shipments.map((s) => {
      const defF = factors(s.emissions, "default");
      const actF = factors(s.emissions, "actual");
      const defaultCost = computeTaxEur(s.mass_tonnes, defF, ets);
      const actualCost = computeTaxEur(s.mass_tonnes, actF, ets);
      return {
        id: s.id,
        cn: s.product.cn_code,
        supplier: s.supplier.name,
        mass: s.mass_tonnes,
        defaultCost,
        actualCost,
        savings: defaultCost - actualCost,
      };
    });
  }, [shipments, ets]);

  const totals = useMemo(() => {
    const defaultTotal = rows.reduce((a, r) => a + r.defaultCost, 0);
    const actualTotal = rows.reduce((a, r) => a + r.actualCost, 0);
    return { defaultTotal, actualTotal, savings: defaultTotal - actualTotal };
  }, [rows]);

  const chartData = [
    {
      label: "Liability (€)",
      defaultCost: Math.round(totals.defaultTotal * 100) / 100,
      actualCost: Math.round(totals.actualTotal * 100) / 100,
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Carbon price (ETS) scenario</CardTitle>
          <CardDescription>
            Total tax model: mass × emission factor × ETS price (€/tCO₂). Adjust the slider to
            stress-test €80 vs €120+ for budgeting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>ETS price (€ / tCO₂)</Label>
              <span className="text-sm font-medium tabular-nums">{ets} €</span>
            </div>
            <Slider
              value={[ets]}
              min={40}
              max={160}
              step={1}
              onValueChange={(v) => {
                const n = Array.isArray(v) ? v[0] : v;
                setEts(typeof n === "number" ? n : 80);
              }}
            />
            <p className="text-muted-foreground text-xs">
              Formula: <code className="rounded bg-muted px-1 py-0.5">mass × EF × ETS</code>
            </p>
          </div>

          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`€${Number(value ?? 0).toFixed(2)}`, ""]}
                  labelFormatter={() => "Totals"}
                />
                <Legend />
                <Bar
                  dataKey="defaultCost"
                  name="EU default cost"
                  fill="oklch(0.577 0.245 27.325)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="actualCost"
                  name="Supplier actual cost"
                  fill="oklch(0.72 0.19 145)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-muted-foreground text-xs">Default total</p>
              <p className="text-lg font-semibold tabular-nums">
                €{totals.defaultTotal.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-muted-foreground text-xs">Actual total</p>
              <p className="text-lg font-semibold tabular-nums">
                €{totals.actualTotal.toFixed(2)}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-3">
              <p className="text-muted-foreground text-xs">Gap (savings)</p>
              <p className="text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                €{totals.savings.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipment-level exposure</CardTitle>
          <CardDescription>Per-row comparison using the same ETS price.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CN</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Mass (t)</TableHead>
                <TableHead className="text-right">Default €</TableHead>
                <TableHead className="text-right">Actual €</TableHead>
                <TableHead className="text-right">Savings €</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.cn}</TableCell>
                  <TableCell>{r.supplier}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.mass.toFixed(3)}</TableCell>
                  <TableCell className="text-right tabular-nums text-red-600 dark:text-red-400">
                    {r.defaultCost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-emerald-700 dark:text-emerald-400">
                    {r.actualCost.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.savings.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">No shipments to model.</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/api/export/eu-registry"
          className={cn(buttonVariants({ variant: "outline" }))}
          target="_blank"
          rel="noreferrer"
        >
          Export mock EU registry XML
        </Link>
        <p className="text-muted-foreground self-center text-xs">
          Opens a generated XML download; schema is illustrative until wired to the official
          registry XSD.
        </p>
      </div>
    </div>
  );
}
