"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function DashboardYearControls({ year }: { year: number }) {
  const router = useRouter();
  const years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Reporting year</span>
      <div className="flex flex-wrap gap-1">
        {years.map((y) => (
          <Button
            key={y}
            type="button"
            variant={y === year ? "default" : "outline"}
            size="sm"
            onClick={() => router.push(`/dashboard?year=${y}`)}
          >
            {y}
          </Button>
        ))}
      </div>
    </div>
  );
}
